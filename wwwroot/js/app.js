// app.js — Código base de la Tarea 6 (Agroservicio La Cosecha)
const API = '/api';
let insumos = [];

async function cargarInsumos() {
    try {
        const resp = await fetch(`${API}/insumos`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        insumos = await resp.json();
        dibujar(insumos);
    }   catch (error) {
        const m = document.getElementById('mensaje');
        m.textContent = `No se pudo cargar el catálogo: ${error.message}`;
        m.hidden = false;
    }
}

function dibujar(datos) {
    const lista = document.getElementById('lista');
    lista.innerHTML = '';
    datos.forEach(i => {
        const alerta = i.existencias < 10 ? '<span class="alerta">Pocas existencias</span>' : '';
        lista.insertAdjacentHTML('beforeend', `
            <article class="tarjeta">
                <h2>${i.nombre}</h2>
                <small>${i.categoria} · ${i.unidad}</small>
                <p><strong>Q${i.precio.toFixed(2)}</strong> · ${i.existencias} disponibles ${alerta}</p>
            </article>`);
    });
}

// Búsqueda en vivo por nombre (sin volver a llamar al servidor)
document.getElementById('buscar').addEventListener('input', e => {
    const texto = e.target.value.toLowerCase();
    dibujar(insumos.filter(i => i.nombre.toLowerCase().includes(texto)));
});

cargarInsumos();