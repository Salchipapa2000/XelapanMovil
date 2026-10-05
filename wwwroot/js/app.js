// app.js — Código base de la Tarea 6 (Agroservicio La Cosecha)
const API = '/api';
let insumos = [];

// AGREGADO: productos seleccionados para la cotización
let cotizacion = [];

async function cargarInsumos(categoria = '') {
    try {

        let url = `${API}/insumos`;

        // AGREGADO: filtro por categoría en el servidor
        if (categoria) {
            url += `?categoria=${encodeURIComponent(categoria)}`;
        }

        const resp = await fetch(url);

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        insumos = await resp.json();

        dibujar(insumos);

    } catch (error) {

        const m = document.getElementById('mensaje');

        m.textContent =
            `No se pudo cargar el catálogo: ${error.message}`;

        m.hidden = false;
    }
}

function dibujar(datos) {

    const lista = document.getElementById('lista');

    lista.innerHTML = '';

    datos.forEach(i => {

        const alerta =
            i.existencias < 10
                ? '<span class="alerta">Pocas existencias</span>'
                : '';

        lista.insertAdjacentHTML('beforeend', `
            <article class="tarjeta">

                <h2>${i.nombre}</h2>

                <small>
                    ${i.categoria} · ${i.unidad}
                </small>

                <p>
                    <strong>Q${i.precio.toFixed(2)}</strong>
                    · ${i.existencias} disponibles
                    ${alerta}
                </p>

                <!-- AGREGADO -->
                <div class="agregar">

                    <label>
                        Cantidad
                        <input
                            type="number"
                            class="cantidad"
                            min="1"
                            max="${i.existencias}"
                            value="1"
                            data-id="${i.id}">
                    </label>

                    <button
                        type="button"
                        class="btn-agregar"
                        data-id="${i.id}">
                        Agregar
                    </button>

                </div>

            </article>
        `);
    });

    // AGREGADO: activar botones Agregar
    document.querySelectorAll('.btn-agregar').forEach(boton => {

        boton.addEventListener('click', () => {

            const id = Number(boton.dataset.id);

            const tarjeta = boton.closest('.tarjeta');

            const cantidad =
                Number(tarjeta.querySelector('.cantidad').value);

            agregarAOferta(id, cantidad);
        });
    });
}

// Búsqueda en vivo por nombre

document.getElementById('buscar').addEventListener('input', e => {

    const texto = e.target.value.toLowerCase();

    dibujar(
        insumos.filter(i =>
            i.nombre.toLowerCase().includes(texto)
        )
    );
});


// AGREGADO: FILTRO POR CATEGORÍA

document.querySelectorAll('.chip').forEach(chip => {

    chip.addEventListener('click', () => {

        const categoria =
            chip.dataset.categoria || '';

        // IMPORTANTE:
        // aquí se llama al servidor
        cargarInsumos(categoria);

        document.querySelectorAll('.chip').forEach(c =>
            c.classList.remove('activo')
        );

        chip.classList.add('activo');
    });
});

// AGREGADO: AGREGAR A COTIZACIÓN

function agregarAOferta(id, cantidad) {

    const insumo =
        insumos.find(i => i.id === id);

    if (!insumo) {
        mostrarMensaje('No se encontró el insumo.', true);
        return;
    }

    if (!Number.isInteger(cantidad) || cantidad < 1) {

        mostrarMensaje(
            'La cantidad debe ser mayor o igual a 1.',
            true
        );

        return;
    }

    if (cantidad > insumo.existencias) {

        mostrarMensaje(
            `Solo hay ${insumo.existencias} de ${insumo.nombre}.`,
            true
        );

        return;
    }


    const existente =
        cotizacion.find(item =>
            item.insumoId === id
        );


    if (existente) {

        const nuevaCantidad =
            existente.cantidad + cantidad;

        if (nuevaCantidad > insumo.existencias) {

            mostrarMensaje(
                `Solo hay ${insumo.existencias} de ${insumo.nombre}.`,
                true
            );

            return;
        }

        existente.cantidad = nuevaCantidad;

    } else {

        cotizacion.push({
            insumoId: id,
            cantidad: cantidad
        });
    }


    actualizarResumen();

    mostrarMensaje(
        `${insumo.nombre} agregado a la cotización.`
    );
}

// AGREGADO: ACTUALIZAR RESUMEN

function actualizarResumen() {

    const total =
        cotizacion.reduce(
            (suma, item) =>
                suma + item.cantidad,
            0
        );

    document.getElementById('resumen').textContent =
        `Insumos en la cotización: ${total}`;
}


// AGREGADO: ENVIAR COTIZACIÓN
document
    .getElementById('form-cotizacion')
    .addEventListener('submit', async e => {

        e.preventDefault();


        if (cotizacion.length === 0) {

            mostrarMensaje(
                'Agrega al menos un insumo a la cotización.',
                true
            );

            return;
        }


        const cliente =
            document.getElementById('cliente')
                .value
                .trim();

        const telefono =
            document.getElementById('telefono')
                .value
                .trim();


        const datos = {
            cliente: cliente,
            telefono: telefono,
            items: cotizacion
        };


        try {

            const resp = await fetch(
                `${API}/cotizaciones`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(datos)
                }
            );


            const resultado =
                await resp.json();


            // RESPUESTA 201

            if (resp.status === 201) {

                mostrarResultado(`
                    <h2>¡Cotización creada!</h2>

                    <p>
                        Número de cotización:
                        <strong>#${resultado.id}</strong>
                    </p>

                    <p>
                        Subtotal:
                        <strong>
                            Q${resultado.subtotal.toFixed(2)}
                        </strong>
                    </p>

                    <p>
                        Descuento:
                        <strong>
                            Q${resultado.descuento.toFixed(2)}
                        </strong>
                    </p>

                    <p>
                        Total:
                        <strong>
                            Q${resultado.total.toFixed(2)}
                        </strong>
                    </p>
                `);


                // Vaciar cotización

                cotizacion = [];

                actualizarResumen();

                document
                    .getElementById('form-cotizacion')
                    .reset();
            }


            // RESPUESTA 400

            else if (resp.status === 400) {

                mostrarMensaje(
                    resultado.mensaje ||
                    'Los datos enviados no son válidos.',
                    true
                );
            }


            // OTROS ERRORES

            else {

                mostrarMensaje(
                    `Error del servidor: HTTP ${resp.status}`,
                    true
                );
            }


        } catch (error) {

            mostrarMensaje(
                `No se pudo enviar la cotización: ${error.message}`,
                true
            );
        }
    });

// AGREGADO: MENSAJES
function mostrarMensaje(texto, error = false) {

    const mensaje =
        document.getElementById('mensaje');

    mensaje.textContent = texto;

    mensaje.hidden = false;

    mensaje.classList.toggle('error', error);
}
// AGREGADO: RESULTADO

function mostrarResultado(html) {

    const resultado =
        document.getElementById('resultado');

    resultado.innerHTML = html;

    resultado.hidden = false;
}
// INICIAR
cargarInsumos();
actualizarResumen();
