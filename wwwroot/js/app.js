// app.js — Consume el servicio web REST con fetch() y dibuja el menú
const API = '/api'; // misma dirección que la página: sin CORS
let productos = []; // datos recibidos del servidor
const carrito = new Map(); // productoId -> cantidad

// ---------- Paso 6: leer productos del servicio web ----------
async function cargarProductos() {
    try {
        const resp = await fetch(`${API}/productos`); // GET
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        productos = await resp.json(); // texto JSON -> arreglo
        dibujarFiltros();
        dibujarLista(productos);
    } catch (error) {
        mostrarMensaje(`No se pudo cargar el menú: ${error.message}`, true);
    }
}

function dibujarFiltros() {
    const categorias = ['Todas', ...new Set(productos.map(p => p.categoria))];
    const nav = document.getElementById('filtros');
    nav.innerHTML = '';
    categorias.forEach((cat, i) => {
        const b = document.createElement('button');
        b.textContent = cat;
        if (i === 0) b.classList.add('activo');
        b.addEventListener('click', () => {
            nav.querySelectorAll('button').forEach(x => x.classList.remove('activo'));
            b.classList.add('activo');
            dibujarLista(cat === 'Todas' ? productos : productos.filter(p => p.categoria === cat));
        });
        nav.appendChild(b);
    });
}

function dibujarLista(datos) {
    const lista = document.getElementById('lista');
    lista.innerHTML = '';
    datos.forEach(p => {
        const art = document.createElement('article');
        art.className = 'tarjeta';
        art.innerHTML = `
            <div>
                <h2>${p.nombre}</h2>
                <small>${p.categoria} · Q${p.precio.toFixed(2)}</small>
            </div>
            <button aria-label=&quot;Agregar ${p.nombre}&quot;>+</button>`;
        art.querySelector('button').addEventListener('click', () => agregar(p.id));
        lista.appendChild(art);
    });
}

function mostrarMensaje(texto, esError = false) {
    const m = document.getElementById('mensaje');
    m.textContent = texto;
    m.className = esError ? 'mensaje error' : 'mensaje';
    m.hidden = false;
}

cargarProductos(); // arranca la app al abrir la página

// ---------- Paso 7: carrito y envío del pedido ----------
function agregar(id) {
    carrito.set(id, (carrito.get(id) || 0) + 1);
    actualizarResumen();
}

function actualizarResumen() {
    let cantidad = 0, total = 0;
    carrito.forEach((cant, id) => {
        const p = productos.find(x => x.id === id);
        cantidad += cant;
        total += p.precio * cant;
    });
    document.getElementById('resumen').textContent =
        `${cantidad} productos · Q${total.toFixed(2)}`;
}

async function enviarPedido(evento) {
    evento.preventDefault(); // evita recargar la página
    const pedido = {
        cliente: document.getElementById('cliente').value,
        items: [...carrito].map(([productoId, cantidad]) => ({ productoId, cantidad }))
    };
    try {
        const resp = await fetch(`${API}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // sin esto: error 415
            body: JSON.stringify(pedido)
        });
        const datos = await resp.json();
        if (!resp.ok) throw new Error(datos.mensaje);
        mostrarMensaje(`Pedido #${datos.id} recibido. Total: Q${datos.total.toFixed(2)}`);
        carrito.clear();
        actualizarResumen();
        evento.target.reset();
    }   catch (error) {
        mostrarMensaje(`Error: ${error.message}`, true);
    }
}

document.getElementById('formPedido').addEventListener('submit', enviarPedido);

// ---------- Paso 9: registrar el service worker (PWA) ----------
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service worker registrado'))
        .catch(err => console.warn('SW no registrado:', err));
}