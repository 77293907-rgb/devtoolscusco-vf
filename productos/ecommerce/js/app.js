/* =========================================
   Inkari Art - Lógica de la Tienda
   ========================================= */

// Estado global del carrito: [{ id, cantidad }]
let carrito = [];

// Estado del panel lateral
let carritoAbierto = false;
let ultimoFocoCarrito = null;
let eliminacionPendiente = null;

// Filtro activo del catálogo
let categoriaActiva = 'Todos';

const CLAVE_CARRITO = 'inkari_carrito';
const MAX_CANTIDAD = 99;

// Imagen de respaldo si un hotlink externo falla (SVG local en data URI)
const IMAGEN_FALLBACK = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">' +
    '<rect width="400" height="500" fill="#ebe6dd"/>' +
    '<path d="M200 190l64 108H136z" fill="#c85a3e"/>' +
    '<circle cx="200" cy="150" r="10" fill="#d4af37"/>' +
    '<text x="200" y="350" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="#2c251e">Inkari Art</text>' +
    '<text x="200" y="378" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" letter-spacing="3" fill="#8a7a64">CUSCO · PERÚ</text>' +
    '</svg>'
);

/* =========================================
   UTILIDADES
   ========================================= */
function escaparHTML(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (caracter) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[caracter]));
}

function formatearPrecio(valor) {
    const numero = Number(valor);
    return `S/ ${(Number.isFinite(numero) ? numero : 0).toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar y normalizar el carrito guardado
    cargarCarrito();

    // 2. Renderizar filtros y productos en el catálogo
    configurarFiltros();
    configurarCatalogo();
    renderizarProductos();

    // 3. Navegación (menú móvil)
    configurarNavegacion();

    // 4. Carrito lateral (apertura, foco, cantidades)
    configurarCarrito();
    configurarCheckout();
    actualizarCarritoUI();

    // 5. Año dinámico en el footer
    const anio = document.getElementById('anio-actual');
    if (anio) anio.textContent = String(new Date().getFullYear());
});

/* =========================================
   NAVEGACIÓN (MENÚ MÓVIL)
   ========================================= */
function configurarNavegacion() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    const iconoAbrir = document.getElementById('icono-menu');
    const iconoCerrar = document.getElementById('icono-cerrar');
    const enlaces = menu.querySelectorAll('a');
    const escritorio = window.matchMedia('(min-width: 768px)');

    const estaAbierto = () => toggle.getAttribute('aria-expanded') === 'true';

    const abrirMenu = () => {
        menu.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Cerrar menú de navegación');
        iconoAbrir?.classList.add('hidden');
        iconoCerrar?.classList.remove('hidden');
    };

    const cerrarMenu = ({ devolverFoco = false } = {}) => {
        if (!estaAbierto()) return;
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú de navegación');
        iconoAbrir?.classList.remove('hidden');
        iconoCerrar?.classList.add('hidden');
        if (devolverFoco) toggle.focus();
    };

    toggle.addEventListener('click', () => {
        if (estaAbierto()) {
            cerrarMenu({ devolverFoco: true });
        } else {
            abrirMenu();
        }
    });

    // Al elegir un destino se cierra el menú.
    enlaces.forEach((enlace) => {
        enlace.addEventListener('click', () => cerrarMenu());
    });

    // Clic fuera del menú o del botón.
    document.addEventListener('click', (evento) => {
        if (!estaAbierto()) return;
        if (menu.contains(evento.target) || toggle.contains(evento.target)) return;
        cerrarMenu();
    });

    // Escape cierra y devuelve el foco al botón.
    document.addEventListener('keydown', (evento) => {
        if (evento.key !== 'Escape' || !estaAbierto()) return;
        evento.preventDefault();
        cerrarMenu({ devolverFoco: true });
    });

    // Si se pasa a escritorio con el menú abierto, se cierra.
    escritorio.addEventListener('change', (evento) => {
        if (evento.matches) cerrarMenu();
    });

    // El carrito y el menú nunca se solapan.
    document.addEventListener('eco:carrito-abierto', () => cerrarMenu());
}

/* =========================================
   FILTROS DEL CATÁLOGO
   ========================================= */
function configurarFiltros() {
    const contenedor = document.getElementById('filtros-categorias');
    if (!contenedor) return;

    // Se generan desde los datos reales: si mañana cambian las categorías,
    // los filtros cambian con ellas.
    const categorias = ['Todos', ...new Set(PRODUCTOS.map((producto) => producto.categoria))];
    contenedor.innerHTML = '';

    categorias.forEach((categoria) => {
        const total = categoria === 'Todos'
            ? PRODUCTOS.length
            : PRODUCTOS.filter((producto) => producto.categoria === categoria).length;

        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'eco-filtro';
        boton.dataset.categoria = categoria;
        boton.setAttribute('aria-pressed', String(categoria === categoriaActiva));
        boton.setAttribute('aria-controls', 'grid-productos');
        boton.setAttribute('aria-label', `${categoria}: ${total} ${total === 1 ? 'pieza' : 'piezas'}`);

        const texto = document.createElement('span');
        texto.textContent = categoria;

        const cuenta = document.createElement('span');
        cuenta.className = 'eco-filtro__count';
        cuenta.textContent = total;
        cuenta.setAttribute('aria-hidden', 'true');

        boton.append(texto, cuenta);
        contenedor.appendChild(boton);
    });

    contenedor.addEventListener('click', (evento) => {
        const boton = evento.target.closest('button[data-categoria]');
        if (!boton || !contenedor.contains(boton)) return;
        seleccionarCategoria(boton.dataset.categoria);
    });
}

function seleccionarCategoria(categoria) {
    if (!categoria) return;

    // Si la categoría ya está activa solo navegamos al catálogo.
    if (categoria !== categoriaActiva) {
        categoriaActiva = categoria;

        document.querySelectorAll('#filtros-categorias .eco-filtro').forEach((boton) => {
            boton.setAttribute('aria-pressed', String(boton.dataset.categoria === categoria));
        });

        renderizarProductos();

        const total = categoria === 'Todos'
            ? PRODUCTOS.length
            : PRODUCTOS.filter((producto) => producto.categoria === categoria).length;
        const estado = document.getElementById('filtros-estado');
        if (estado) {
            estado.textContent = categoria === 'Todos'
                ? `Mostrando las ${total} piezas de la colección`
                : `Mostrando ${total} ${total === 1 ? 'pieza' : 'piezas'} de ${categoria}`;
        }
    }

    // Navegar al catálogo (siempre, incluso desde el footer).
    document.getElementById('coleccion')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* =========================================
   CATÁLOGO: DELEGACIÓN Y RESPALDO DE IMÁGENES
   ========================================= */
function configurarCatalogo() {
    const grid = document.getElementById('grid-productos');
    if (!grid || grid.dataset.configurado === 'true') return;
    grid.dataset.configurado = 'true';

    grid.addEventListener('click', (evento) => {
        const accion = evento.target.closest('[data-accion]');
        if (!accion || !grid.contains(accion)) return;

        if (accion.dataset.accion === 'agregar') {
            agregarAlCarrito(accion.dataset.id);
        }

        if (accion.dataset.accion === 'ver-todos') {
            seleccionarCategoria('Todos');
        }
    });

    // Si un hotlink externo falla, se sustituye por el SVG de respaldo.
    grid.addEventListener('error', (evento) => {
        const imagen = evento.target;
        if (!(imagen instanceof HTMLImageElement)) return;
        if (imagen.dataset.respaldo === 'true') return;

        imagen.dataset.respaldo = 'true';
        imagen.src = IMAGEN_FALLBACK;
        imagen.closest('.eco-card-media')?.classList.add('is-loaded');
    }, true);
}

/* =========================================
   RENDERIZADO DEL CATÁLOGO
   ========================================= */
function renderizarProductos() {
    const grid = document.getElementById('grid-productos');
    if (!grid) return;
    grid.innerHTML = '';

    const productosFiltrados = categoriaActiva === 'Todos'
        ? PRODUCTOS
        : PRODUCTOS.filter((producto) => producto.categoria === categoriaActiva);

    // Estado vacío: colección sin piezas o filtro sin resultados.
    if (productosFiltrados.length === 0) {
        const mensaje = categoriaActiva === 'Todos'
            ? 'La colección está vacía por ahora.'
            : `No hay piezas en ${escaparHTML(categoriaActiva)}.`;

        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-earth-200 bg-cream-50 px-6 py-16 text-center">
                <span class="grid h-16 w-16 place-items-center rounded-full bg-earth-100 text-earth-600" aria-hidden="true">
                    <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0l-2.5 6h-11L4 13m16 0H4" /></svg>
                </span>
                <p class="mt-5 font-serif text-2xl font-bold text-earth-900">No encontramos piezas</p>
                <p class="mt-2 max-w-sm text-sm text-earth-800">${mensaje} Prueba con otra categoría o vuelve a ver toda la colección.</p>
                <button type="button" data-accion="ver-todos" class="eco-btn eco-btn--primary mt-6">Ver toda la colección</button>
            </div>
        `;
        return;
    }

    productosFiltrados.forEach(producto => {
        const card = document.createElement('article');
        card.className = 'group relative flex h-full flex-col';

        card.innerHTML = `
            <div class="eco-card-media card-hover relative aspect-[4/5] overflow-hidden rounded-2xl bg-earth-100 mb-4">
                <div class="eco-card-skeleton absolute inset-0" aria-hidden="true"></div>
                <img src="${escaparHTML(producto.imagen)}" alt="${escaparHTML(producto.nombre)}" width="400" height="500" loading="lazy" decoding="async" class="eco-card-img absolute inset-0 h-full w-full object-cover object-center" />
                <span class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-earth-900 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    ${escaparHTML(producto.categoria)}
                </span>
                <button type="button" data-accion="agregar" data-id="${escaparHTML(producto.id)}" aria-label="Añadir ${escaparHTML(producto.nombre)} al carrito" class="eco-card-add absolute bottom-4 right-4 inline-flex h-11 items-center gap-2 rounded-full bg-earth-900 px-4 text-sm font-medium text-white shadow-lg hover:bg-terra-500">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
                    <span>Añadir</span>
                </button>
            </div>
            <div class="eco-card-body">
                <h3 class="font-serif text-base font-bold text-earth-900 leading-tight transition-colors group-hover:text-terra-600">${escaparHTML(producto.nombre)}</h3>
                <p class="eco-card-desc">${escaparHTML(producto.descripcion)}</p>
                <p class="eco-card-price">${formatearPrecio(producto.precio)}</p>
            </div>
        `;
        grid.appendChild(card);
    });

    // La imagen aparece con fundido cuando termina de cargar.
    grid.querySelectorAll('img.eco-card-img').forEach((imagen) => {
        const marcarCargada = () => {
            imagen.classList.add('is-loaded');
            imagen.closest('.eco-card-media')?.classList.add('is-loaded');
        };

        if (imagen.complete && imagen.naturalWidth > 0) {
            marcarCargada();
        } else {
            imagen.addEventListener('load', marcarCargada, { once: true });
        }
    });
}

/* =========================================
   CARRITO: ESTADO Y PERSISTENCIA
   ========================================= */
function obtenerProducto(id) {
    return PRODUCTOS.find((producto) => producto.id === id) || null;
}

function normalizarCantidad(valor) {
    const numero = Math.trunc(Number(valor));
    if (!Number.isFinite(numero) || numero < 1) return 0;
    return Math.min(numero, MAX_CANTIDAD);
}

function totalUnidades() {
    return carrito.reduce((acc, item) => acc + item.cantidad, 0);
}

// Acepta el formato antiguo (producto completo + cantidad), el nuevo ({ id, cantidad })
// y datos corruptos sin romper la página.
function cargarCarrito() {
    carrito = [];
    let guardado = null;

    try {
        guardado = localStorage.getItem(CLAVE_CARRITO);
    } catch {
        return; // modo privado o almacenamiento bloqueado
    }

    if (!guardado) return;

    let datos = null;
    try {
        datos = JSON.parse(guardado);
    } catch {
        datos = null;
    }

    if (!Array.isArray(datos)) {
        guardarCarrito();
        return;
    }

    const acumulado = new Map();
    datos.forEach((item) => {
        const id = typeof item === 'string' ? item : item?.id;
        if (!id || !obtenerProducto(id)) return;

        const cantidad = normalizarCantidad(item?.cantidad ?? 1);
        if (cantidad < 1) return;

        acumulado.set(id, Math.min((acumulado.get(id) || 0) + cantidad, MAX_CANTIDAD));
    });

    carrito = [...acumulado].map(([id, cantidad]) => ({ id, cantidad }));
    guardarCarrito();
}

function guardarCarrito() {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    } catch {
        // Sin persistencia seguimos operando en memoria.
    }
}

function guardarYActualizar() {
    guardarCarrito();
    actualizarCarritoUI();
}

function anunciarCarrito(mensaje) {
    const estado = document.getElementById('carrito-estado');
    if (!estado) return;

    estado.textContent = '';
    window.setTimeout(() => {
        estado.textContent = mensaje;
    }, 60);
}

function resumenCarrito() {
    const total = totalUnidades();
    return total === 0
        ? 'El carrito está vacío.'
        : `Carrito: ${total} ${total === 1 ? 'artículo' : 'artículos'}.`;
}

/* =========================================
   CARRITO: OPERACIONES
   ========================================= */
function agregarAlCarrito(id) {
    const producto = obtenerProducto(id);
    if (!producto) return false;

    const item = carrito.find((linea) => linea.id === id);

    if (item) {
        item.cantidad = Math.min(item.cantidad + 1, MAX_CANTIDAD);
    } else {
        carrito.push({ id, cantidad: 1 });
        mostrarToast(`"${producto.nombre}" añadido al carrito`);
    }

    eliminacionPendiente = null;
    guardarYActualizar();
    abrirCarrito();
    anunciarCarrito(`"${producto.nombre}" añadido. ${resumenCarrito()}`);
    return true;
}

function eliminarDelCarrito(id) {
    const producto = obtenerProducto(id);
    const indice = carrito.findIndex((item) => item.id === id);
    if (indice === -1) return;

    carrito.splice(indice, 1);
    eliminacionPendiente = null;
    guardarYActualizar();
    anunciarCarrito(producto
        ? `"${producto.nombre}" se quitó del carrito. ${resumenCarrito()}`
        : 'Producto quitado del carrito.');
}

function cambiarCantidad(id, delta) {
    const item = carrito.find((linea) => linea.id === id);
    if (!item) return;

    const nueva = Math.min(Math.max(item.cantidad + delta, 1), MAX_CANTIDAD);
    if (nueva === item.cantidad) return;

    item.cantidad = nueva;
    guardarYActualizar();

    const producto = obtenerProducto(id);
    if (producto) {
        anunciarCarrito(`${producto.nombre}: ${nueva} ${nueva === 1 ? 'unidad' : 'unidades'}.`);
    }
}

/* =========================================
   CARRITO: RENDERIZADO
   ========================================= */
function plantillaItemCarrito(producto, cantidad) {
    const id = escaparHTML(producto.id);
    const nombre = escaparHTML(producto.nombre);
    const confirmando = eliminacionPendiente === producto.id;

    return `
        <li class="eco-cart-item flex gap-4" data-id="${id}">
            <div class="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-earth-100">
                <img src="${escaparHTML(producto.imagen)}" alt="${nombre}" width="80" height="80" loading="lazy" decoding="async" class="h-full w-full object-cover" />
            </div>
            <div class="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                        <h3 class="font-serif font-bold leading-tight text-earth-900">${nombre}</h3>
                        <p class="text-xs text-earth-800">${formatearPrecio(producto.precio)} c/u</p>
                    </div>
                    <button type="button" data-accion="eliminar" data-id="${id}" aria-label="Quitar ${nombre} del carrito" class="eco-cart-icon-btn shrink-0 text-earth-800 transition-colors hover:text-terra-600">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
                <div class="flex items-center justify-between gap-3">
                    <div class="eco-cart-cantidad inline-flex items-center rounded-lg border border-earth-200">
                        <button type="button" data-accion="menos" data-id="${id}" aria-label="Quitar una unidad de ${nombre}" ${cantidad <= 1 ? 'disabled' : ''} class="eco-cart-cantidad__btn text-earth-800 transition-colors hover:text-terra-600 disabled:cursor-not-allowed disabled:opacity-30">−</button>
                        <span class="min-w-8 text-center text-sm font-medium tabular-nums">${cantidad}</span>
                        <button type="button" data-accion="mas" data-id="${id}" aria-label="Añadir una unidad de ${nombre}" ${cantidad >= MAX_CANTIDAD ? 'disabled' : ''} class="eco-cart-cantidad__btn text-earth-800 transition-colors hover:text-terra-600 disabled:cursor-not-allowed disabled:opacity-30">+</button>
                    </div>
                    <span class="shrink-0 text-sm font-bold text-earth-900">${formatearPrecio((Number(producto.precio) || 0) * cantidad)}</span>
                </div>
                ${confirmando ? `
                    <div class="eco-cart-confirm rounded-lg border border-earth-200 bg-earth-50 p-3" role="group" aria-label="Confirmar eliminación de ${nombre}">
                        <p class="text-xs text-earth-800">¿Quitar esta pieza del carrito?</p>
                        <div class="mt-2 flex flex-wrap gap-2">
                            <button type="button" data-accion="confirmar-eliminar" data-id="${id}" class="eco-cart-confirm__btn bg-terra-600 font-medium text-white hover:bg-terra-700">Sí, quitar</button>
                            <button type="button" data-accion="cancelar-eliminar" data-id="${id}" class="eco-cart-confirm__btn border border-earth-200 font-medium text-earth-800 hover:border-earth-400">Cancelar</button>
                        </div>
                    </div>
                ` : ''}
            </div>
        </li>
    `;
}

function actualizarCarritoUI() {
    const lista = document.getElementById('carrito-items');
    const badge = document.getElementById('carrito-count');
    const badgeTitulo = document.getElementById('carrito-count-title');
    const subtotalEl = document.getElementById('carrito-subtotal');
    const btnCarrito = document.getElementById('btn-carrito');
    const btnFinalizar = document.getElementById('btn-finalizar');
    if (!lista) return;

    const total = totalUnidades();
    const subtotal = carrito.reduce((acc, item) => {
        const producto = obtenerProducto(item.id);
        return acc + (Number(producto?.precio) || 0) * item.cantidad;
    }, 0);

    // Contadores: siempre vuelven a 0 cuando el carrito queda vacío.
    if (badge) {
        badge.textContent = String(total);
        badge.classList.toggle('opacity-0', total === 0);
        badge.classList.toggle('scale-0', total === 0);
        badge.classList.toggle('opacity-100', total > 0);
        badge.classList.toggle('scale-100', total > 0);
    }

    if (badgeTitulo) badgeTitulo.textContent = String(total);
    if (subtotalEl) subtotalEl.textContent = formatearPrecio(subtotal);
    if (btnFinalizar) btnFinalizar.disabled = total === 0;

    if (btnCarrito) {
        btnCarrito.setAttribute('aria-label', total === 0
            ? 'Abrir carrito, vacío'
            : `Abrir carrito, ${total} ${total === 1 ? 'artículo' : 'artículos'}`);
    }

    if (carrito.length === 0) {
        lista.innerHTML = `
            <li class="flex h-full flex-col items-center justify-center py-16 text-center">
                <span class="grid h-16 w-16 place-items-center rounded-full bg-earth-100 text-earth-600" aria-hidden="true">
                    <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </span>
                <p class="mt-5 font-serif text-xl font-bold text-earth-900">Tu carrito está vacío</p>
                <p class="mt-2 max-w-[16rem] text-sm text-earth-800">Descubre piezas únicas hechas a mano en Cusco.</p>
                <button type="button" data-accion="ir-coleccion" class="eco-btn eco-btn--primary mt-6">Explorar la colección</button>
            </li>
        `;
        return;
    }

    lista.innerHTML = carrito
        .map((item) => {
            const producto = obtenerProducto(item.id);
            return producto ? plantillaItemCarrito(producto, item.cantidad) : '';
        })
        .join('');
}

/* =========================================
   CARRITO: PANEL LATERAL (FOCO Y TECLADO)
   ========================================= */
function configurarCarrito() {
    const btnCarrito = document.getElementById('btn-carrito');
    const cerrar = document.getElementById('cerrar-carrito');
    const overlay = document.getElementById('carrito-overlay');
    const panel = document.getElementById('carrito-panel');
    const lista = document.getElementById('carrito-items');
    if (!btnCarrito || !cerrar || !overlay || !panel || !lista) return;

    btnCarrito.addEventListener('click', () => abrirCarrito());
    cerrar.addEventListener('click', () => cerrarCarrito({ devolverFoco: true }));
    overlay.addEventListener('click', () => cerrarCarrito({ devolverFoco: true }));
    lista.addEventListener('click', manejarClicCarrito);

    document.addEventListener('keydown', (evento) => {
        if (!carritoAbierto) return;

        if (evento.key === 'Escape') {
            evento.preventDefault();
            cerrarCarrito({ devolverFoco: true });
            return;
        }

        if (evento.key === 'Tab') atraparFoco(evento, panel);
    });

    // Refuerzo de modalidad: el foco no puede quedarse en el fondo.
    document.addEventListener('focusin', (evento) => {
        if (!carritoAbierto || panel.contains(evento.target)) return;
        panel.focus({ preventScroll: true });
    });
}

function abrirCarrito() {
    const panel = document.getElementById('carrito-panel');
    const overlay = document.getElementById('carrito-overlay');
    if (!panel || !overlay || carritoAbierto) return;

    ultimoFocoCarrito = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    carritoAbierto = true;

    panel.inert = false;
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.remove('translate-x-full');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.setAttribute('aria-hidden', 'false');
    bloquearScroll(true);

    // El menú móvil se cierra al abrir el carrito.
    document.dispatchEvent(new CustomEvent('eco:carrito-abierto'));

    window.requestAnimationFrame(() => {
        if (carritoAbierto) panel.focus({ preventScroll: true });
    });
}

function cerrarCarrito({ devolverFoco = true } = {}) {
    const panel = document.getElementById('carrito-panel');
    const overlay = document.getElementById('carrito-overlay');
    if (!panel || !overlay || !carritoAbierto) return;

    const teniaConfirmacion = eliminacionPendiente !== null;
    carritoAbierto = false;
    eliminacionPendiente = null;

    panel.classList.add('translate-x-full');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    panel.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    panel.inert = true;
    bloquearScroll(false);

    if (teniaConfirmacion) actualizarCarritoUI();

    if (devolverFoco && ultimoFocoCarrito?.isConnected) {
        ultimoFocoCarrito.focus({ preventScroll: true });
    }
    ultimoFocoCarrito = null;
}

function bloquearScroll(bloquear) {
    const raiz = document.documentElement;

    if (bloquear) {
        const anchoBarra = window.innerWidth - raiz.clientWidth;
        document.body.style.setProperty('--eco-scrollbar', `${anchoBarra}px`);
        raiz.classList.add('eco-scroll-lock');
    } else {
        raiz.classList.remove('eco-scroll-lock');
        document.body.style.removeProperty('--eco-scrollbar');
    }
}

function elementosEnfocables(panel) {
    return [...panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter((elemento) => elemento.offsetParent !== null);
}

function atraparFoco(evento, panel) {
    const enfocables = elementosEnfocables(panel);

    if (enfocables.length === 0) {
        evento.preventDefault();
        panel.focus({ preventScroll: true });
        return;
    }

    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    const activo = document.activeElement;

    if (evento.shiftKey) {
        if (activo === primero || activo === panel || !panel.contains(activo)) {
            evento.preventDefault();
            ultimo.focus();
        }
        return;
    }

    if (activo === ultimo) {
        evento.preventDefault();
        primero.focus();
    }
}

function enfocarSelector(selectores) {
    for (const selector of selectores) {
        const elemento = document.querySelector(selector);
        if (elemento instanceof HTMLElement && !elemento.disabled) {
            elemento.focus({ preventScroll: true });
            return true;
        }
    }
    return false;
}

function manejarClicCarrito(evento) {
    const boton = evento.target.closest('[data-accion]');
    if (!boton) return;

    const accion = boton.dataset.accion;
    const id = boton.dataset.id;
    if (!accion || (!id && accion !== 'ir-coleccion')) return;

    const idSeguro = id ? CSS.escape(id) : '';

    if (accion === 'mas' || accion === 'menos') {
        cambiarCantidad(id, accion === 'mas' ? 1 : -1);
        const selector = `[data-accion="${accion}"][data-id="${idSeguro}"]`;
        if (!enfocarSelector([selector]) && accion === 'menos') {
            enfocarSelector([`[data-accion="mas"][data-id="${idSeguro}"]`]);
        }
        return;
    }

    if (accion === 'eliminar') {
        eliminacionPendiente = id;
        actualizarCarritoUI();
        enfocarSelector([`[data-accion="confirmar-eliminar"][data-id="${idSeguro}"]`]);
        return;
    }

    if (accion === 'cancelar-eliminar') {
        eliminacionPendiente = null;
        actualizarCarritoUI();
        enfocarSelector([`[data-accion="eliminar"][data-id="${idSeguro}"]`]);
        return;
    }

    if (accion === 'confirmar-eliminar') {
        eliminarDelCarrito(id);
        const siguiente = document.querySelector('[data-accion="eliminar"]');
        if (siguiente instanceof HTMLElement) {
            siguiente.focus({ preventScroll: true });
        } else {
            document.getElementById('cerrar-carrito')?.focus({ preventScroll: true });
        }
        return;
    }

    if (accion === 'ir-coleccion') {
        cerrarCarrito({ devolverFoco: false });
        document.getElementById('coleccion')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/* =========================================
   CHECKOUT: RESUMEN DE PEDIDO (MODAL)
   ========================================= */
function configurarCheckout() {
    const btnFinalizar = document.getElementById('btn-finalizar');
    const pedidoCerrar = document.getElementById('pedido-cerrar');
    const pedidoOverlay = document.getElementById('pedido-overlay');
    if (!btnFinalizar) return;

    btnFinalizar.addEventListener('click', () => {
        if (carrito.length === 0) return;
        cerrarCarrito({ devolverFoco: false });
        mostrarResumenPedido();
    });

    const cerrarPedido = () => {
        const modal = document.getElementById('modal-pedido');
        if (!modal || modal.hidden) return;
        modal.hidden = true;
        document.documentElement.classList.remove('eco-scroll-lock');
        carrito = [];
        guardarCarrito();
        actualizarCarritoUI();
        document.getElementById('btn-carrito')?.focus({ preventScroll: true });
    };

    pedidoCerrar?.addEventListener('click', cerrarPedido);
    pedidoOverlay?.addEventListener('click', cerrarPedido);

    document.addEventListener('keydown', (evento) => {
        const modal = document.getElementById('modal-pedido');
        if (!modal || modal.hidden) return;

        if (evento.key === 'Escape') {
            evento.preventDefault();
            cerrarPedido();
            return;
        }

        if (evento.key === 'Tab') atraparFoco(evento, modal);
    });

    // El foco no debe escaparse al fondo mientras el modal está abierto.
    document.addEventListener('focusin', (evento) => {
        const modal = document.getElementById('modal-pedido');
        if (!modal || modal.hidden) return;
        if (!modal.contains(evento.target)) {
            document.getElementById('pedido-titulo')?.focus({ preventScroll: true });
        }
    });
}

function mostrarResumenPedido() {
    const modal = document.getElementById('modal-pedido');
    const lista = document.getElementById('pedido-items');
    const total = document.getElementById('pedido-total');
    const titulo = document.getElementById('pedido-titulo');
    if (!modal || !lista || !total) return;

    const subtotal = carrito.reduce((acc, item) => {
        const producto = obtenerProducto(item.id);
        return acc + (Number(producto?.precio) || 0) * item.cantidad;
    }, 0);

    lista.innerHTML = carrito.map((item) => {
        const producto = obtenerProducto(item.id);
        if (!producto) return '';
        const nombre = escaparHTML(producto.nombre);
        return `
            <li class="flex items-center justify-between gap-4 text-sm">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-earth-100">
                        <img src="${escaparHTML(producto.imagen)}" alt="" width="40" height="40" loading="lazy" decoding="async" class="h-full w-full object-cover" />
                    </div>
                    <span class="font-medium text-earth-900 truncate">${nombre}</span>
                </div>
                <span class="shrink-0 text-earth-800">${formatearPrecio((Number(producto.precio) || 0) * item.cantidad)}</span>
            </li>`;
    }).join('');

    total.textContent = formatearPrecio(subtotal);
    modal.hidden = false;
    document.documentElement.classList.add('eco-scroll-lock');

    window.requestAnimationFrame(() => titulo?.focus({ preventScroll: true }));
}

/* =========================================
   NOTIFICACIÓN FLOTANTE (TOAST)
   ========================================= */
let _toastTimer = null;

function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    window.clearTimeout(_toastTimer);
    toastMsg.textContent = mensaje;
    toast.classList.remove('translate-y-20', 'opacity-0');

    _toastTimer = window.setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 2500);
}