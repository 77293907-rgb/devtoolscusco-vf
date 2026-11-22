/* =========================================================
   admin.js — Lógica del Panel de Administración
   Contrato con admin.html:
     · Login: #login-form, #login-usuario, #login-password
     · Shell: #pantalla-login, #app-panel, #admin-sidebar,
              #admin-overlay, #admin-menu-toggle
     · Navegación: [data-vista] + #vista-resumen/platos/reservas
     · KPIs: #kpi-activas, #kpi-reservas, #kpi-platos
     · Tablas: #tabla-platos-body, #tabla-reservas-body
     · Modales: #modal-plato, #modal-reserva, #modal-confirmar
     · Anuncios: #admin-anuncio
   Claves de localStorage:
     rinconcito_platos · rinconcito_reservas · rinconcito_sesion
   ========================================================= */

const CLAVE_PLATOS_PANEL   = 'rinconcito_platos';
const CLAVE_RESERVAS_PANEL = 'rinconcito_reservas';
const CLAVE_SESION_PANEL   = 'rinconcito_sesion';
const ESTADOS_RESERVA      = ['Pendiente', 'Confirmada', 'Asistió', 'Cancelada'];

let rolActual           = '';
let vistaActual         = 'resumen';
let focoAntesDeModal    = null;
let temporizadorAnuncio = null;

document.addEventListener('DOMContentLoaded', iniciarAdmin);

function iniciarAdmin() {
  configurarLogin();
  configurarNavegacion();
  configurarMenuAdmin();
  configurarTablas();
  configurarModales();
  configurarConfirmacion();

  const sesion = localStorage.getItem(CLAVE_SESION_PANEL);
  if (sesion) iniciarSesion(sesion);
}

/* =========================================================
   1. LOGIN Y SESIÓN
   ========================================================= */

function configurarLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const usuario = document.getElementById('login-usuario')?.value.trim().toLowerCase() ?? '';
    loginRapido(usuario.includes('vend') ? 'vendedor' : 'admin');
  });
}

function loginRapido(rol) {
  const normalizado = rol === 'vendedor' ? 'vendedor' : 'admin';
  localStorage.setItem(CLAVE_SESION_PANEL, normalizado);
  iniciarSesion(normalizado);
}

function iniciarSesion(rol) {
  rolActual = rol === 'vendedor' ? 'vendedor' : 'admin';

  const perfil = rolActual === 'admin'
    ? { nombre: 'Dueño (Admin)', correo: 'admin@rinconcito.com', inicial: 'A', rol: 'Panel Admin' }
    : { nombre: 'Vendedor',      correo: 'ventas@rinconcito.com', inicial: 'V', rol: 'Panel Ventas' };

  document.getElementById('pantalla-login')?.classList.add('hidden');
  document.getElementById('app-panel')?.classList.remove('hidden');

  asignarTexto('rol-usuario',     perfil.rol);
  asignarTexto('nombre-usuario',  perfil.nombre);
  asignarTexto('correo-usuario',  perfil.correo);
  asignarTexto('inicial-usuario', perfil.inicial);

  const navResumen = document.getElementById('nav-resumen');
  if (navResumen) navResumen.classList.toggle('hidden', rolActual !== 'admin');

  cambiarVista(rolActual === 'admin' ? 'resumen' : 'platos', { anunciar: false });
  document.getElementById('titulo-seccion')?.focus({ preventScroll: true });
  anunciar(`Sesión iniciada como ${perfil.nombre}.`);
}

function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION_PANEL);
  location.reload();
}

/* =========================================================
   2. NAVEGACIÓN
   ========================================================= */

function configurarNavegacion() {
  document.querySelectorAll('[data-vista]').forEach((boton) => {
    boton.addEventListener('click', () => cambiarVista(boton.dataset.vista));
  });

  const titulo = document.getElementById('titulo-seccion');
  if (titulo) titulo.setAttribute('tabindex', '-1');
}

function cambiarVista(vista, opciones = {}) {
  const { anunciar: debeAnunciar = true } = opciones;
  const vistas = {
    resumen:  { panel: 'vista-resumen',  boton: 'nav-resumen',  titulo: 'Resumen General' },
    platos:   { panel: 'vista-platos',   boton: 'nav-platos',   titulo: 'Menú de Platos' },
    reservas: { panel: 'vista-reservas', boton: 'nav-reservas', titulo: 'Historial de Reservas' },
  };

  let destino = vista;
  if (destino === 'resumen' && rolActual !== 'admin') destino = 'platos';
  if (!vistas[destino]) return;

  Object.values(vistas).forEach(({ panel }) => {
    document.getElementById(panel)?.classList.add('hidden');
  });

  document.querySelectorAll('.rn-admin-navlink').forEach((boton) => {
    boton.removeAttribute('aria-current');
  });

  document.getElementById(vistas[destino].panel)?.classList.remove('hidden');
  document.getElementById(vistas[destino].boton)?.setAttribute('aria-current', 'page');
  asignarTexto('titulo-seccion', vistas[destino].titulo);

  vistaActual = destino;

  if (destino === 'resumen') {
    actualizarKPIs();
    dibujarGraficoVentas();
  } else if (destino === 'platos') {
    renderizarTablaPlatos();
  } else {
    renderizarTablaReservas();
  }

  cerrarMenuAdmin({ devolverFoco: false });

  if (debeAnunciar) {
    anunciar(`Vista: ${vistas[destino].titulo}.`);
    document.getElementById('titulo-seccion')?.focus({ preventScroll: true });
  }
}

/* --- Menú lateral off-canvas --- */

function configurarMenuAdmin() {
  const toggle  = document.getElementById('admin-menu-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('admin-overlay');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    if (sidebar.classList.contains('is-open')) cerrarMenuAdmin();
    else abrirMenuAdmin();
  });

  overlay?.addEventListener('click', () => cerrarMenuAdmin());

  document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') return;
    if (sidebar.classList.contains('is-open')) {
      evento.preventDefault();
      cerrarMenuAdmin();
    }
  });

  const escritorio = window.matchMedia('(min-width: 1024px)');
  const alCambiar  = (evento) => { if (evento.matches) cerrarMenuAdmin({ devolverFoco: false }); };

  if (typeof escritorio.addEventListener === 'function') escritorio.addEventListener('change', alCambiar);
  else escritorio.addListener(alCambiar);
}

function abrirMenuAdmin() {
  const toggle  = document.getElementById('admin-menu-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('admin-overlay');
  const main    = document.querySelector('.rn-admin-main');
  if (!toggle || !sidebar) return;

  sidebar.classList.add('is-open');
  if (overlay) overlay.hidden = false;
  if (main)    main.inert = true;
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'Cerrar menú');
  document.body.classList.add('rn-nav-open');

  window.requestAnimationFrame(() => {
    if (!sidebar.classList.contains('is-open')) return;
    sidebar.querySelector('.rn-admin-navlink:not(.hidden)')?.focus();
  });
}

function cerrarMenuAdmin({ devolverFoco = true } = {}) {
  const toggle  = document.getElementById('admin-menu-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('admin-overlay');
  const main    = document.querySelector('.rn-admin-main');
  if (!toggle || !sidebar) return;

  const estabaAbierto = sidebar.classList.contains('is-open');
  sidebar.classList.remove('is-open');
  if (overlay) overlay.hidden = true;
  if (main)    main.inert = false;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menú');
  document.body.classList.remove('rn-nav-open');

  if (estabaAbierto && devolverFoco) toggle.focus();
}

/* =========================================================
   3. KPIs Y GRÁFICO
   ========================================================= */

function actualizarKPIs() {
  const platos   = leerLista(CLAVE_PLATOS_PANEL);
  const reservas = leerLista(CLAVE_RESERVAS_PANEL);

  const activas = reservas.filter((reserva) => {
    const estado = normalizarEstado(reserva.estado);
    return estado === 'Pendiente' || estado === 'Confirmada';
  }).length;

  const hoy   = inicioDelDia(new Date());
  const desde = new Date(hoy);
  desde.setDate(hoy.getDate() - 29);

  const ultimos30 = reservas.filter((reserva) => {
    const fecha = parsearFecha(reserva.fecha);
    return fecha && fecha >= desde && fecha <= hoy;
  }).length;

  asignarTexto('kpi-activas',  String(activas));
  asignarTexto('kpi-reservas', String(ultimos30));
  asignarTexto('kpi-platos',   String(platos.length));
}

function dibujarGraficoVentas() {
  const contenedor = document.getElementById('contenedor-grafico');
  if (!contenedor) return;

  const reservas = leerLista(CLAVE_RESERVAS_PANEL);
  const hoy      = inicioDelDia(new Date());
  const dias     = [];

  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    dias.push({
      iso: fechaLocalISO(fecha),
      dia: new Intl.DateTimeFormat('es-PE', { weekday: 'short' }).format(fecha).replace('.', ''),
      fechaCorta: new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' })
        .format(fecha).replace('.', ''),
      titulo: new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
        .format(fecha),
      total: 0,
    });
  }

  const indicePorFecha = new Map(dias.map((dia, indice) => [dia.iso, indice]));

  reservas.forEach((reserva) => {
    if (normalizarEstado(reserva.estado) === 'Cancelada') return;
    const indice = indicePorFecha.get(reserva.fecha);
    if (indice !== undefined) dias[indice].total += 1;
  });

  const totalSemana = dias.reduce((suma, dia) => suma + dia.total, 0);

  if (totalSemana === 0) {
    contenedor.innerHTML = `
      <div class="rn-chart-empty" role="status">
        <p>
          <strong>Sin reservas esta semana</strong>
          Aún no hay reservas en los últimos 7 días. Las nuevas aparecerán aquí automáticamente.
        </p>
      </div>`;
    return;
  }

  const maximo  = Math.max(1, ...dias.map((dia) => dia.total));
  const resumen = dias.map((dia) => `${dia.dia} ${dia.total}`).join(', ');

  contenedor.innerHTML = `
    <div class="rn-chart-bars" role="img" aria-label="Reservas de los últimos 7 días: ${escaparHTML(resumen)}.">
      ${dias.map((dia) => {
        const altura = Math.max(2, Math.round((dia.total / maximo) * 100));
        return `
          <div class="rn-chart-col">
            <span class="rn-chart-value">${dia.total}</span>
            <div class="rn-chart-track">
              <div class="rn-chart-bar" style="height:${altura}%"></div>
            </div>
            <abbr class="rn-chart-day" title="${escaparHTML(dia.titulo)}">${escaparHTML(dia.dia)}</abbr>
            <span class="rn-chart-date">${escaparHTML(dia.fechaCorta)}</span>
          </div>`;
      }).join('')}
    </div>`;
}

/* =========================================================
   4. TABLAS
   ========================================================= */

function configurarTablas() {
  const tbodyPlatos = document.getElementById('tabla-platos-body');
  tbodyPlatos?.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion="eliminar-plato"]');
    if (boton) eliminarPlato(boton.dataset.id);
  });

  const tbodyReservas = document.getElementById('tabla-reservas-body');
  tbodyReservas?.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion="eliminar-reserva"]');
    if (boton) eliminarReserva(boton.dataset.id);
  });

  tbodyReservas?.addEventListener('change', (evento) => {
    const selector = evento.target.closest('[data-accion="estado-reserva"]');
    if (selector) cambiarEstadoReserva(selector.dataset.id, selector.value);
  });
}

function renderizarTablaPlatos() {
  const tbody = document.getElementById('tabla-platos-body');
  if (!tbody) return;

  const platos = leerLista(CLAVE_PLATOS_PANEL);

  if (platos.length === 0) {
    tbody.innerHTML = filaVacia(4, 'No hay platos registrados. Usa "Agregar Plato" para crear el primero.');
    return;
  }

  tbody.innerHTML = platos.map((plato) => {
    const id          = escaparHTML(plato.id ?? '');
    const nombre      = escaparHTML(plato.nombre ?? 'Sin nombre');
    const categoria   = escaparHTML(plato.categoria ?? 'Sin categoría');
    const descripcion = plato.descripcion
      ? `<p class="rn-muted rn-plato-desc">${escaparHTML(plato.descripcion)}</p>`
      : '';
    const imagen    = typeof plato.imagen === 'string' ? escaparHTML(plato.imagen) : '';
    const miniatura = imagen
      ? `<img class="rn-plato-thumb" src="${imagen}" alt="" width="44" height="44" loading="lazy" />`
      : '<span class="rn-plato-thumb" aria-hidden="true"></span>';

    const acciones = rolActual === 'admin'
      ? `<button type="button" class="rn-icon-btn rn-icon-btn--danger" data-accion="eliminar-plato" data-id="${id}" title="Eliminar ${nombre}" aria-label="Eliminar ${nombre}">
           <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
             <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
           </svg>
         </button>`
      : '<span class="rn-muted">Restringido</span>';

    return `
      <tr>
        <td data-label="Plato" class="rn-cell-plato">
          <div class="rn-plato-cell">
            ${miniatura}
            <div>
              <p class="rn-plato-name">${nombre}</p>
              ${descripcion}
            </div>
          </div>
        </td>
        <td data-label="Categoría"><div><span class="rn-badge rn-badge--neutral">${categoria}</span></div></td>
        <td data-label="Precio"><div><span class="rn-money">${formatearPrecio(plato.precio)}</span></div></td>
        <td data-label="Acciones" class="rn-td-right"><div class="rn-actions">${acciones}</div></td>
      </tr>`;
  }).join('');
}

function renderizarTablaReservas() {
  const tbody = document.getElementById('tabla-reservas-body');
  if (!tbody) return;

  const reservas = leerLista(CLAVE_RESERVAS_PANEL);

  if (reservas.length === 0) {
    tbody.innerHTML = filaVacia(5, 'Aún no hay reservas. Usa "Agregar Reserva" para registrar una manualmente.');
    return;
  }

  tbody.innerHTML = [...reservas].reverse().map((reserva) => {
    const id       = escaparHTML(reserva.id ?? '');
    const nombre   = escaparHTML(reserva.nombre ?? 'Sin nombre');
    const telefono = escaparHTML(reserva.telefono ?? 'Sin teléfono');
    const estado   = normalizarEstado(reserva.estado);
    const personas = Number(reserva.personas) || 0;

    const opciones = ESTADOS_RESERVA.map((opcion) => (
      `<option value="${opcion}" ${opcion === estado ? 'selected' : ''}>${opcion}</option>`
    )).join('');

    const acciones = rolActual === 'admin'
      ? `<button type="button" class="rn-icon-btn rn-icon-btn--danger" data-accion="eliminar-reserva" data-id="${id}" title="Eliminar reserva de ${nombre}" aria-label="Eliminar reserva de ${nombre}">
           <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
             <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
           </svg>
         </button>`
      : '<span class="rn-muted">—</span>';

    return `
      <tr>
        <td data-label="Cliente">
          <div>
            <p class="rn-plato-name">${nombre}</p>
            <p class="rn-muted">${telefono}</p>
          </div>
        </td>
        <td data-label="Fecha / Hora">
          <div>
            <p class="rn-plato-name">${escaparHTML(formatearFecha(reserva.fecha))}</p>
            <p class="rn-muted">${escaparHTML(reserva.hora ?? '--:--')}</p>
          </div>
        </td>
        <td data-label="Personas">
          <div>
            <span class="rn-money">${personas}</span>
            <span class="rn-muted">${personas === 1 ? 'persona' : 'personas'}</span>
          </div>
        </td>
        <td data-label="Estado">
          <div>
            <select class="rn-status ${claseEstado(estado)}" data-accion="estado-reserva" data-id="${id}" aria-label="Estado de la reserva de ${nombre}">
              ${opciones}
            </select>
          </div>
        </td>
        <td data-label="Acciones" class="rn-td-right"><div class="rn-actions">${acciones}</div></td>
      </tr>`;
  }).join('');
}

/* =========================================================
   5. ACCIONES DE TABLA
   ========================================================= */

function eliminarPlato(id) {
  if (rolActual !== 'admin') {
    anunciar('Solo el administrador puede eliminar platos.');
    return;
  }

  const platos = leerLista(CLAVE_PLATOS_PANEL);
  const plato  = platos.find((item) => String(item.id) === String(id));
  if (!plato) return;

  confirmarAccion(
    `¿Eliminar "${plato.nombre}" de la carta? Esta acción no se puede deshacer.`,
    () => {
      if (!guardarLista(CLAVE_PLATOS_PANEL, platos.filter((item) => String(item.id) !== String(id)))) return;
      renderizarTablaPlatos();
      actualizarKPIs();
      anunciar(`Plato "${plato.nombre}" eliminado de la carta.`);
    }
  );
}

function cambiarEstadoReserva(id, nuevoEstado) {
  const estado = ESTADOS_RESERVA.find((opcion) => (
    opcion.toLowerCase() === String(nuevoEstado).toLowerCase()
  ));
  if (!estado) return;

  const reservas = leerLista(CLAVE_RESERVAS_PANEL);
  const indice   = reservas.findIndex((item) => String(item.id) === String(id));
  if (indice === -1) return;

  reservas[indice].estado = estado;
  if (!guardarLista(CLAVE_RESERVAS_PANEL, reservas)) return;

  renderizarTablaReservas();
  actualizarKPIs();
  dibujarGraficoVentas();

  const selector = document.querySelector(
    `[data-accion="estado-reserva"][data-id="${escaparSelector(id)}"]`
  );
  selector?.focus();
  anunciar(`Reserva de ${reservas[indice].nombre}: ${estado}.`);
}

function eliminarReserva(id) {
  if (rolActual !== 'admin') {
    anunciar('Solo el administrador puede eliminar reservas.');
    return;
  }

  const reservas = leerLista(CLAVE_RESERVAS_PANEL);
  const reserva  = reservas.find((item) => String(item.id) === String(id));
  if (!reserva) return;

  confirmarAccion(
    `¿Eliminar la reserva de "${reserva.nombre}"? Esta acción no se puede deshacer.`,
    () => {
      if (!guardarLista(CLAVE_RESERVAS_PANEL, reservas.filter((item) => String(item.id) !== String(id)))) return;
      renderizarTablaReservas();
      actualizarKPIs();
      dibujarGraficoVentas();
      anunciar(`Reserva de ${reserva.nombre} eliminada.`);
    }
  );
}

/* =========================================================
   6. MODALES
   ========================================================= */

function configurarModales() {
  document.getElementById('form-plato')?.addEventListener('submit', manejarAltaPlato);
  document.getElementById('form-reserva-admin')?.addEventListener('submit', manejarAltaReserva);

  document.querySelectorAll('.rn-modal').forEach((modal) => {
    modal.addEventListener('click', (evento) => {
      if (evento.target === modal) cerrarModalPorId(modal.id);
    });
  });

  document.addEventListener('keydown', (evento) => {
    const abierto = [...document.querySelectorAll('.rn-modal')].find((modal) => !modal.hidden);

    if (evento.key === 'Escape' && abierto) {
      evento.preventDefault();
      cerrarModalPorId(abierto.id);
      return;
    }

    if (evento.key === 'Tab' && abierto) atraparFoco(evento, abierto);
  });
}

/* --- Modal de confirmación (reemplaza window.confirm / window.alert) --- */

let _callbackConfirmar = null;

function configurarConfirmacion() {
  const modal    = document.getElementById('modal-confirmar');
  const cancelar = document.getElementById('confirmar-cancelar');
  if (!modal || !cancelar) return;

  cancelar.addEventListener('click', () => cerrarConfirmacion());
  modal.addEventListener('click', (evento) => {
    if (evento.target === modal) cerrarConfirmacion();
  });
}

function confirmarAccion(mensaje, callback) {
  const modal   = document.getElementById('modal-confirmar');
  const desc    = document.getElementById('confirmar-desc');
  let   aceptar = document.getElementById('confirmar-aceptar');
  if (!modal || !desc || !aceptar) { callback(); return; }

  desc.textContent   = mensaje;
  _callbackConfirmar = callback;

  // Sustituir el botón para limpiar listeners acumulados
  const nuevo = aceptar.cloneNode(true);
  aceptar.parentNode.replaceChild(nuevo, aceptar);
  aceptar = nuevo;

  aceptar.addEventListener('click', () => {
    cerrarConfirmacion();
    if (typeof _callbackConfirmar === 'function') _callbackConfirmar();
    _callbackConfirmar = null;
  });

  focoAntesDeModal = document.activeElement;
  modal.hidden     = false;
  document.body.classList.add('rn-modal-open');

  window.requestAnimationFrame(() => aceptar.focus());
}

function cerrarConfirmacion() {
  const modal = document.getElementById('modal-confirmar');
  if (!modal || modal.hidden) return;

  modal.hidden       = true;
  _callbackConfirmar = null;
  actualizarBloqueoScroll();
  devolverFoco();
}

function abrirModalPlato() {
  if (!rolActual) return;

  const modal = document.getElementById('modal-plato');
  if (!modal) return;

  focoAntesDeModal = document.activeElement;
  document.getElementById('form-plato')?.reset();
  document.querySelectorAll('#form-plato .is-invalid').forEach((campo) => campo.classList.remove('is-invalid'));

  modal.hidden = false;
  document.body.classList.add('rn-modal-open');

  window.requestAnimationFrame(() => document.getElementById('plato-nombre')?.focus());
}

function cerrarModalPlato() {
  const modal = document.getElementById('modal-plato');
  if (!modal || modal.hidden) return;

  modal.hidden = true;
  document.getElementById('form-plato')?.reset();
  actualizarBloqueoScroll();
  devolverFoco();
}

function abrirModalReserva() {
  if (!rolActual) return;

  const modal = document.getElementById('modal-reserva');
  if (!modal) return;

  focoAntesDeModal = document.activeElement;
  document.getElementById('form-reserva-admin')?.reset();

  const fecha = document.getElementById('admin-res-fecha');
  if (fecha) {
    fecha.min   = fechaLocalISO();
    fecha.value = fechaLocalISO();
  }

  modal.hidden = false;
  document.body.classList.add('rn-modal-open');

  window.requestAnimationFrame(() => document.getElementById('admin-res-nombre')?.focus());
}

function cerrarModalReserva() {
  const modal = document.getElementById('modal-reserva');
  if (!modal || modal.hidden) return;

  modal.hidden = true;
  document.getElementById('form-reserva-admin')?.reset();
  actualizarBloqueoScroll();
  devolverFoco();
}

function cerrarModalPorId(id) {
  if      (id === 'modal-plato')     cerrarModalPlato();
  else if (id === 'modal-reserva')   cerrarModalReserva();
  else if (id === 'modal-confirmar') cerrarConfirmacion();
}

function actualizarBloqueoScroll() {
  const algunoAbierto = [...document.querySelectorAll('.rn-modal')].some((modal) => !modal.hidden);
  document.body.classList.toggle('rn-modal-open', algunoAbierto);
}

function devolverFoco() {
  const destino = focoAntesDeModal && document.contains(focoAntesDeModal)
    ? focoAntesDeModal
    : document.querySelector('.rn-admin-view:not(.hidden) .rn-btn');

  focoAntesDeModal = null;
  destino?.focus();
}

function atraparFoco(evento, modal) {
  const focusables = [...modal.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter((elemento) => elemento.getClientRects().length > 0);

  if (focusables.length === 0) return;

  const primero = focusables[0];
  const ultimo  = focusables[focusables.length - 1];

  if (!modal.contains(document.activeElement)) {
    evento.preventDefault();
    primero.focus();
  } else if (evento.shiftKey && document.activeElement === primero) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primero.focus();
  }
}

function manejarAltaPlato(evento) {
  evento.preventDefault();

  const nombre      = document.getElementById('plato-nombre')?.value.trim() ?? '';
  const precio      = Number(document.getElementById('plato-precio')?.value);
  const categoria   = document.getElementById('plato-categoria')?.value ?? 'Especialidad';
  const imagen      = document.getElementById('plato-imagen')?.value.trim() ?? '';
  const descripcion = document.getElementById('plato-desc')?.value.trim() ?? '';

  if (!nombre || !Number.isFinite(precio) || precio <= 0 || !imagen || !descripcion) {
    anunciar('Revisa los datos del plato antes de guardar.');
    return;
  }

  const platos = leerLista(CLAVE_PLATOS_PANEL);
  platos.push({ id: `p_${Date.now()}`, nombre, precio, categoria, imagen, descripcion });

  if (!guardarLista(CLAVE_PLATOS_PANEL, platos)) return;

  cerrarModalPlato();
  renderizarTablaPlatos();
  actualizarKPIs();
  anunciar(`Plato "${nombre}" agregado a la carta.`);
}

function manejarAltaReserva(evento) {
  evento.preventDefault();

  const nombre   = document.getElementById('admin-res-nombre')?.value.trim() ?? '';
  const telefono = document.getElementById('admin-res-telefono')?.value.trim() ?? '';
  const fecha    = document.getElementById('admin-res-fecha')?.value ?? '';
  const hora     = document.getElementById('admin-res-hora')?.value ?? '';
  const personas = Number(document.getElementById('admin-res-personas')?.value);

  if (!nombre || !telefono || !fecha || !hora) {
    anunciar('Completa todos los datos de la reserva.');
    return;
  }

  if (fecha < fechaLocalISO()) {
    anunciar('La fecha de la reserva no puede ser anterior a hoy.');
    document.getElementById('admin-res-fecha')?.focus();
    return;
  }

  if (!Number.isInteger(personas) || personas < 1 || personas > 20) {
    anunciar('El número de personas debe estar entre 1 y 20.');
    document.getElementById('admin-res-personas')?.focus();
    return;
  }

  const reservas = leerLista(CLAVE_RESERVAS_PANEL);
  reservas.push({
    id: `res_${Date.now()}`,
    nombre,
    telefono,
    fecha,
    hora,
    personas: String(personas),
    notas: 'Ingresada manualmente',
    estado: 'Confirmada',
    creadaEl: new Date().toISOString(),
  });

  if (!guardarLista(CLAVE_RESERVAS_PANEL, reservas)) return;

  cerrarModalReserva();
  renderizarTablaReservas();
  actualizarKPIs();
  dibujarGraficoVentas();
  anunciar(`Reserva de ${nombre} registrada para el ${formatearFecha(fecha)} a las ${hora}.`);
}

/* =========================================================
   7. UTILIDADES
   ========================================================= */

function escaparHTML(valor) {
  const reemplazos = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(valor ?? '').replace(/[&<>"']/g, (c) => reemplazos[c]);
}

function fechaLocalISO(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes  = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia  = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function inicioDelDia(fecha) {
  const copia = new Date(fecha);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function parsearFecha(valor) {
  if (typeof valor !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!m) return null;
  const fecha = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function formatearFecha(valor) {
  const fecha = parsearFecha(valor);
  if (!fecha) return valor || 'Sin fecha';
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(fecha);
}

function formatearPrecio(valor) {
  const numero = Number(valor);
  const seguro = Number.isFinite(numero) ? numero : 0;
  return `S/ ${new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(seguro)}`;
}

function normalizarEstado(valor) {
  return ESTADOS_RESERVA.find((o) => o.toLowerCase() === String(valor ?? '').toLowerCase()) || 'Pendiente';
}

function claseEstado(estado) {
  const clases = {
    Pendiente: 'rn-status--pendiente',
    Confirmada: 'rn-status--confirmada',
    'Asistió': 'rn-status--asistio',
    Cancelada: 'rn-status--cancelada',
  };
  return clases[estado] || 'rn-status--pendiente';
}

function escaparSelector(valor) {
  if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(valor));
  return String(valor).replace(/["\\]/g, '\\$&');
}

function leerLista(clave) {
  try {
    const crudo = localStorage.getItem(clave);
    const datos = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    console.warn(`No se pudo leer ${clave}:`, error);
    return [];
  }
}

function guardarLista(clave, datos) {
  try {
    localStorage.setItem(clave, JSON.stringify(datos));
    return true;
  } catch (error) {
    console.error(`No se pudo guardar ${clave}:`, error);
    anunciar('No se pudieron guardar los cambios. Revisa el almacenamiento del navegador.');
    return false;
  }
}

function filaVacia(columnas, mensaje) {
  return `<tr class="rn-empty-row"><td colspan="${columnas}" data-label="">${escaparHTML(mensaje)}</td></tr>`;
}

function asignarTexto(id, texto) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = texto;
}

function anunciar(mensaje) {
  const region = document.getElementById('admin-anuncio');
  if (!region) return;

  window.clearTimeout(temporizadorAnuncio);
  region.textContent = '';

  window.requestAnimationFrame(() => { region.textContent = mensaje; });

  temporizadorAnuncio = window.setTimeout(() => { region.textContent = ''; }, 6000);
}
