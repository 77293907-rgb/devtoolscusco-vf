/* =========================================================
   app.js — Lógica de la vista del cliente
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  configurarNavegacion();
  renderizarPlatos();
  configurarFormularioReserva();
  configurarChat();
  actualizarAnio();
});

/* =========================================================
   Navbar: fondo al hacer scroll + menú móvil accesible
   Contrato: #site-header, #menu-toggle, #mobile-menu,
             #icon-open, #icon-close y clases is-scrolled /
             is-menu-open / is-open.
   ========================================================= */
function configurarNavegacion() {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');

  if (header) {
    const actualizarFondo = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', actualizarFondo, { passive: true });
    actualizarFondo();
  }

  if (!toggle || !menu) return;

  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const abrir = () => {
    menu.classList.remove('hidden');
    void menu.offsetHeight; // fuerza el reflow para que la transición se dispare
    menu.classList.add('is-open');
    header?.classList.add('is-menu-open');
    iconOpen?.classList.add('hidden');
    iconClose?.classList.remove('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
  };

  const cerrar = () => {
    menu.classList.remove('is-open');
    header?.classList.remove('is-menu-open');
    iconOpen?.classList.remove('hidden');
    iconClose?.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');

    // display:none al terminar la transición (también con movimiento reducido)
    window.setTimeout(() => {
      if (!menu.classList.contains('is-open')) menu.classList.add('hidden');
    }, reducido ? 0 : 360);
  };

  toggle.addEventListener('click', () => {
    menu.classList.contains('is-open') ? cerrar() : abrir();
  });

  menu.querySelectorAll('a').forEach((enlace) => {
    enlace.addEventListener('click', cerrar);
  });

  // Cierra al pasar a desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && menu.classList.contains('is-open')) cerrar();
  });

  // Cierra con Esc y devuelve el foco al botón
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && menu.classList.contains('is-open')) {
      cerrar();
      toggle.focus();
    }
  });

  // Cierra al hacer clic fuera del header
  document.addEventListener('click', (evento) => {
    if (menu.classList.contains('is-open') && !evento.target.closest('#site-header')) {
      cerrar();
    }
  });
}

function renderizarPlatos() {
  const grid = document.getElementById('grid-platos');
  if (!grid) return;

  let platos = [];
  try {
    const crudo = localStorage.getItem('rinconcito_platos');
    const datos = crudo ? JSON.parse(crudo) : [];
    platos = Array.isArray(datos) ? datos : [];
  } catch (error) {
    console.warn('rinconcito_platos corrupto; se muestran 0 platos.', error);
  }
  grid.innerHTML = '';

  if (platos.length === 0) {
    grid.innerHTML = `
      <div class="rn-dish-empty">
        <p class="font-serif italic mb-4">La cocina está preparando algo especial...</p>
        <a href="#reservas" class="rn-dish-cta">Reservar una mesa</a>
      </div>`;
    return;
  }

  platos.forEach((plato, indice) => {
    const card = document.createElement('article');
    card.className = 'rn-dish-card rn-dish-enter';
    card.style.animationDelay = `${indice * 70}ms`;

    const nombre = escaparHTML(plato.nombre);
    const descripcion = escaparHTML(plato.descripcion);
    const categoria = escaparHTML(plato.categoria);
    const imagen = escaparHTML(plato.imagen);
    const precio = Number(plato.precio) || 0;

    card.innerHTML = `
      <div class="rn-dish-media">
        <img src="${imagen}" alt="${nombre}" loading="lazy" decoding="async" />
        <span class="rn-dish-chip">${categoria}</span>
      </div>

      <div class="rn-dish-body">
        <div class="rn-dish-head">
          <h3 class="rn-dish-name">${nombre}</h3>
          <span class="rn-dish-price">S/ ${precio.toFixed(2)}</span>
        </div>

        <p class="rn-dish-desc">${descripcion}</p>

        <button type="button" class="rn-dish-cta">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Añadir a la reserva
        </button>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* Escapa texto antes de interpolarlo en innerHTML. */
function escaparHTML(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (caracter) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[caracter]));
}
/* =========================================================
   Formulario de reserva: validación y feedback
   Contrato: #form-reserva, #res-nombre, #res-telefono,
             #res-fecha, #res-hora, #res-personas, #res-notas,
             #reserva-panel y #reserva-estado.
   ========================================================= */

const CAMPOS_RESERVA = ['res-nombre', 'res-telefono', 'res-fecha', 'res-hora', 'res-personas', 'res-notas'];
const HORARIO_RESERVA = { apertura: '12:00', cierre: '22:30' };

/* Fecha de hoy en horario local (toISOString usa UTC y en Cusco
   adelantaba el día después de las 19:00). */
function fechaLocalISO(fecha = new Date()) {
  const compensada = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
  return compensada.toISOString().split('T')[0];
}

function configurarFormularioReserva() {
  const form = document.getElementById('form-reserva');
  if (!form) return;

  const fechaInput = document.getElementById('res-fecha');
  const horaInput = document.getElementById('res-hora');
  const estado = document.getElementById('reserva-estado');

  if (fechaInput) fechaInput.min = fechaLocalISO();
  if (horaInput) {
    horaInput.min = HORARIO_RESERVA.apertura;
    horaInput.max = HORARIO_RESERVA.cierre;
  }

  // No marcar en rojo mientras el usuario escribe por primera vez.
  const tocados = new Set();
  CAMPOS_RESERVA.forEach((id) => {
    const campo = document.getElementById(id);
    if (!campo) return;
    campo.addEventListener('blur', () => {
      tocados.add(id);
      validarCampo(id);
    });
    campo.addEventListener('input', () => {
      if (tocados.has(id)) validarCampo(id);
    });
    campo.addEventListener('change', () => {
      if (tocados.has(id)) validarCampo(id);
    });
  });

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    CAMPOS_RESERVA.forEach((id) => tocados.add(id));
    const invalidos = CAMPOS_RESERVA.filter((id) => !validarCampo(id));

    if (invalidos.length > 0) {
      if (estado) {
        estado.hidden = false;
        estado.textContent = invalidos.length === 1
          ? 'Revisa el campo marcado antes de continuar.'
          : `Revisa los ${invalidos.length} campos marcados antes de continuar.`;
      }
      document.getElementById(invalidos[0])?.focus();
      return;
    }

    if (estado) {
      estado.hidden = true;
      estado.textContent = '';
    }

    const nuevaReserva = {
      id: 'res_' + Date.now(),
      nombre: document.getElementById('res-nombre').value.trim(),
      telefono: document.getElementById('res-telefono').value.trim(),
      fecha: document.getElementById('res-fecha').value,
      hora: document.getElementById('res-hora').value,
      personas: document.getElementById('res-personas').value,
      notas: document.getElementById('res-notas').value.trim(),
      estado: 'Pendiente',
      creadaEl: new Date().toISOString(),
    };

    let reservasGuardadas = [];
    try {
      const crudo = localStorage.getItem('rinconcito_reservas');
      const datos = crudo ? JSON.parse(crudo) : [];
      reservasGuardadas = Array.isArray(datos) ? datos : [];
    } catch (error) {
      console.warn('rinconcito_reservas corrupto; se inicia lista vacía.', error);
    }
    reservasGuardadas.push(nuevaReserva);
    localStorage.setItem('rinconcito_reservas', JSON.stringify(reservasGuardadas));

    mostrarMensajeExito(nuevaReserva);
  });
}

/* Devuelve true si el campo es válido y pinta el estado visual. */
function validarCampo(id) {
  const campo = document.getElementById(id);
  if (!campo) return true;

  const valor = campo.value.trim();
  let mensaje = '';

  switch (id) {
    case 'res-nombre':
      if (valor.length < 3) mensaje = 'Escribe tu nombre completo (mínimo 3 caracteres).';
      break;
    case 'res-telefono':
      if (valor.replace(/\D/g, '').length < 6 || !/^\+?[\d\s().-]{6,20}$/.test(valor)) {
        mensaje = 'Ingresa un teléfono válido, con al menos 6 dígitos.';
      }
      break;
    case 'res-fecha':
      if (!valor) mensaje = 'Elige la fecha de tu visita.';
      else if (valor < fechaLocalISO()) mensaje = 'La fecha no puede ser anterior a hoy.';
      break;
    case 'res-hora':
      if (!valor) mensaje = 'Elige la hora de tu reserva.';
      else if (valor < HORARIO_RESERVA.apertura || valor > HORARIO_RESERVA.cierre) {
        mensaje = `Atendemos de ${HORARIO_RESERVA.apertura} a ${HORARIO_RESERVA.cierre}.`;
      }
      break;
    case 'res-personas':
      if (!valor || Number(valor) < 1) mensaje = 'Indica cuántas personas asistirán.';
      break;
    case 'res-notas':
      if (valor.length > 300) mensaje = 'Las notas no pueden superar los 300 caracteres.';
      break;
  }

  pintarCampo(campo, mensaje);
  return mensaje === '';
}

function pintarCampo(campo, mensaje) {
  const error = document.getElementById(`${campo.id}-error`);
  campo.classList.toggle('is-invalid', Boolean(mensaje));
  campo.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
  if (error) {
    error.textContent = mensaje;
    error.hidden = !mensaje;
  }
}

function limpiarErrores() {
  CAMPOS_RESERVA.forEach((id) => {
    const campo = document.getElementById(id);
    if (campo) pintarCampo(campo, '');
  });
  const estado = document.getElementById('reserva-estado');
  if (estado) {
    estado.hidden = true;
    estado.textContent = '';
  }
}

/* El formulario no se destruye: se oculta y se muestra el resumen.
   “Hacer otra reserva” lo restaura en el sitio, sin recargar. */
function mostrarMensajeExito(reserva) {
  const panel = document.getElementById('reserva-panel');
  const form = document.getElementById('form-reserva');
  if (!panel || !form) return;

  form.hidden = true;
  panel.querySelector('.rn-reserve-success')?.remove();

  const fechaObj = new Date(`${reserva.fecha}T00:00:00`);
  const fechaBonita = Number.isNaN(fechaObj.getTime())
    ? reserva.fecha
    : fechaObj.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

  const nombre = escaparHTML(reserva.nombre);
  const notas = reserva.notas ? escaparHTML(reserva.notas) : '';

  const exito = document.createElement('div');
  exito.className = 'rn-reserve-success';
  exito.innerHTML = `
    <div class="rn-reserve-success-icon" aria-hidden="true">
      <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <h3 class="rn-reserve-success-title">¡Reserva registrada!</h3>
    <p class="rn-reserve-success-text">
      Gracias, <strong>${nombre}</strong>. Te esperamos en El Rinconcito Cusqueño.
    </p>

    <dl class="rn-reserve-summary">
      <div><dt>Fecha</dt><dd>${escaparHTML(fechaBonita)}</dd></div>
      <div><dt>Hora</dt><dd>${escaparHTML(reserva.hora)}</dd></div>
      <div><dt>Personas</dt><dd>${escaparHTML(reserva.personas)}</dd></div>
      ${notas ? `<div><dt>Notas</dt><dd>${notas}</dd></div>` : ''}
    </dl>

    <button type="button" class="rn-reserve-again" data-accion="otra-reserva">
      Hacer otra reserva
    </button>
  `;

  panel.appendChild(exito);

  const titulo = exito.querySelector('.rn-reserve-success-title');
  titulo?.setAttribute('tabindex', '-1');
  titulo?.focus();

  exito.querySelector('[data-accion="otra-reserva"]')?.addEventListener('click', () => {
    exito.remove();
    form.hidden = false;
    form.reset();
    limpiarErrores();
    document.getElementById('res-nombre')?.focus();
  });
}

/* =========================================================
   Chatbot visual (demostración): apertura/cierre accesible y
   respuesta local; los mensajes no se envían ni se guardan.
   Contrato: #chat-toggle, #chat-window, #chat-close,
             #chat-messages, #chat-input, #chat-send, #chat-form.
   ========================================================= */

function configurarChat() {
  const toggle = document.getElementById('chat-toggle');
  const ventana = document.getElementById('chat-window');
  if (!toggle || !ventana) return;

  const botonCerrar = document.getElementById('chat-close');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const mensajes = document.getElementById('chat-messages');
  const iconoAbrir = toggle.querySelector('.rn-chat-icon-open');
  const iconoCerrar = toggle.querySelector('.rn-chat-icon-close');
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const abrir = () => {
    ventana.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar chat');
    if (iconoAbrir) iconoAbrir.hidden = true;
    if (iconoCerrar) iconoCerrar.hidden = false;
    window.requestAnimationFrame(() => ventana.classList.add('is-open'));
    input?.focus();
  };

  const cerrar = () => {
    ventana.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir chat');
    if (iconoAbrir) iconoAbrir.hidden = false;
    if (iconoCerrar) iconoCerrar.hidden = true;
    window.setTimeout(() => {
      if (!ventana.classList.contains('is-open')) ventana.hidden = true;
    }, reducido ? 0 : 160);
    toggle.focus();
  };

  toggle.addEventListener('click', () => {
    ventana.hidden ? abrir() : cerrar();
  });

  botonCerrar?.addEventListener('click', cerrar);

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && !ventana.hidden) cerrar();
  });

  form?.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const texto = input?.value.trim() ?? '';
    if (!texto) {
      input?.focus();
      return;
    }

    agregarMensajeChat(texto, 'user');
    if (input) input.value = '';
    mensajes?.scrollTo({ top: mensajes.scrollHeight, behavior: reducido ? 'auto' : 'smooth' });

    window.setTimeout(() => {
      agregarMensajeChat(
        'Gracias por escribir. Este chat es una demostración y no recibe mensajes; para reservar tu mesa usa el formulario de reservas.',
        'bot'
      );
      mensajes?.scrollTo({ top: mensajes.scrollHeight, behavior: reducido ? 'auto' : 'smooth' });
    }, 450);
  });
}

/* Crea una burbuja con textContent (sin innerHTML) para no inyectar HTML. */
function agregarMensajeChat(texto, autor) {
  const mensajes = document.getElementById('chat-messages');
  if (!mensajes) return;

  const fila = document.createElement('div');
  fila.className = `rn-chat-msg rn-chat-msg--${autor}`;

  if (autor === 'bot') {
    const avatar = document.createElement('span');
    avatar.className = 'rn-chat-avatar rn-chat-avatar--sm';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = 'R';
    fila.appendChild(avatar);
  }

  const burbuja = document.createElement('p');
  burbuja.className = `rn-chat-bubble rn-chat-bubble--${autor}`;
  burbuja.textContent = texto;
  fila.appendChild(burbuja);

  mensajes.appendChild(fila);
}

/* Año del footer en curso (H10). */
function actualizarAnio() {
  const anio = document.getElementById('anio-actual');
  if (anio) anio.textContent = String(new Date().getFullYear());
}