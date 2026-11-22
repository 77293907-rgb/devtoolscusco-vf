document.addEventListener('DOMContentLoaded', () => {

    // Colores de contexto para el punto indicador
    const COLORES_PUNTO = {
        luces:   'rgb(234 179 8)',    /* yellow-500 */
        clima:   'rgb(34 211 238)',   /* neon-cyan  */
        puerta:  'rgb(74 222 128)',   /* green-400  */
        defecto: 'rgb(34 211 238)'   /* neon-cyan  */
    };

    const puntoPing = document.getElementById('punto-ping');
    const puntoCore = document.getElementById('punto-core');

    // Utilidad: actualiza el texto de estado global + color del punto
    function actualizarEstadoGlobal(mensaje, contexto = 'defecto') {
        const el = document.getElementById('estado-global');
        if (el) el.textContent = mensaje;
        const color = COLORES_PUNTO[contexto] ?? COLORES_PUNTO.defecto;
        if (puntoPing) puntoPing.style.backgroundColor = color;
        if (puntoCore) puntoCore.style.backgroundColor = color;
    }

    // 0. MENÚ MÓVIL
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconoMenu   = document.getElementById('icono-menu');
    const iconoCerrar = document.getElementById('icono-cerrar');

    if (menuToggle && mobileMenu) {
        const estaAbierto = () => menuToggle.getAttribute('aria-expanded') === 'true';

        const abrirMenu = () => {
            mobileMenu.hidden = false;
            menuToggle.setAttribute('aria-expanded', 'true');
            menuToggle.setAttribute('aria-label', 'Cerrar menú de navegación');
            iconoMenu?.classList.add('hidden');
            iconoCerrar?.classList.remove('hidden');
        };

        const cerrarMenu = ({ devolverFoco = false } = {}) => {
            if (!estaAbierto()) return;
            mobileMenu.hidden = true;
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
            iconoMenu?.classList.remove('hidden');
            iconoCerrar?.classList.add('hidden');
            if (devolverFoco) menuToggle.focus();
        };

        menuToggle.addEventListener('click', () => {
            estaAbierto() ? cerrarMenu({ devolverFoco: true }) : abrirMenu();
        });

        // Clic fuera cierra el menú.
        document.addEventListener('click', (evento) => {
            if (!estaAbierto()) return;
            if (mobileMenu.contains(evento.target) || menuToggle.contains(evento.target)) return;
            cerrarMenu();
        });

        // Escape cierra y devuelve el foco.
        document.addEventListener('keydown', (evento) => {
            if (evento.key === 'Escape' && estaAbierto()) {
                evento.preventDefault();
                cerrarMenu({ devolverFoco: true });
            }
        });

        // Al elegir un enlace móvil se cierra.
        mobileMenu.querySelectorAll('a').forEach((enlace) => {
            enlace.addEventListener('click', () => cerrarMenu());
        });

        // Si se pasa a escritorio con el menú abierto, se cierra.
        window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
            if (e.matches) cerrarMenu();
        });
    }

    // 1. CONTROL DE LUCES
    const btnLuces   = document.getElementById('toggle-luces');
    const estadoLuces = document.getElementById('estado-luces');
    const cardLuces   = document.getElementById('card-luces');
    const iconoLuces  = document.getElementById('icono-luces');

    if (btnLuces) {
        btnLuces.addEventListener('click', () => {
            const encendidas = btnLuces.getAttribute('aria-checked') === 'true';
            const nuevaEstado = !encendidas;

            btnLuces.setAttribute('aria-checked', String(nuevaEstado));
            cardLuces.classList.toggle('dm-card-luces--on', nuevaEstado);
            iconoLuces.classList.toggle('dm-luz-icono--on', nuevaEstado);

            const textoEstado = nuevaEstado ? 'Encendidas' : 'Apagadas';
            estadoLuces.textContent = `Actualmente: ${textoEstado}`;

            // Resumen en la barra
            const chipLuces = document.getElementById('resumen-luces');
            if (chipLuces) {
                chipLuces.querySelector('svg').nextSibling.textContent = ` Luz: ${nuevaEstado ? 'On' : 'Off'}`;
                chipLuces.classList.toggle('dm-resumen-chip--activo', nuevaEstado);
            }

            document.body.style.backgroundColor = nuevaEstado
                ? 'rgb(26 21 16)'   /* --dark-luces-on */
                : '';

            actualizarEstadoGlobal(
                nuevaEstado ? 'Iluminación activada' : 'Iluminación desactivada',
                'luces'
            );
        });
    }

    // 2. CONTROL DE TEMPERATURA
    const sliderTemp = document.getElementById('slider-temp');
    const tempValor  = document.getElementById('temp-valor');

    // Calcula el porcentaje de llenado del track y actualiza el custom property
    function actualizarTrackClima(valor) {
        const min = Number(sliderTemp.min);
        const max = Number(sliderTemp.max);
        const pct = ((valor - min) / (max - min)) * 100;
        sliderTemp.style.setProperty('--dm-slider-fill', `${pct}%`);
    }

    // Devuelve la zona térmica: 'frio' | 'templado' | 'calido'
    function zonaTermica(valor) {
        if (valor < 20) return 'frio';
        if (valor > 25) return 'calido';
        return 'templado';
    }

    if (sliderTemp && tempValor) {
        // Estado inicial
        actualizarTrackClima(21);
        tempValor.classList.add('dm-temp--templado');

        sliderTemp.addEventListener('input', (e) => {
            const valor = Number(e.target.value);

            tempValor.textContent = `${valor}°C`;
            sliderTemp.setAttribute('aria-valuenow', valor);
            sliderTemp.setAttribute('aria-valuetext', `${valor} grados`);

            tempValor.classList.remove('dm-temp--frio', 'dm-temp--templado', 'dm-temp--calido');
            tempValor.classList.add(`dm-temp--${zonaTermica(valor)}`);
            actualizarTrackClima(valor);

            // Resumen en la barra
            const chipTemp = document.getElementById('resumen-temp');
            if (chipTemp) chipTemp.querySelector('svg').nextSibling.textContent = ` ${valor}°C`;

            actualizarEstadoGlobal(`Clima ajustado a ${valor}°C`, 'clima');
        });
    }

    // 3. CONTROL DE SEGURIDAD
    const btnPuerta      = document.getElementById('btn-puerta');
    const iconoPuerta    = document.getElementById('icono-puerta');
    const descPuerta     = document.getElementById('desc-puerta');
    const svgBloqueado   = document.getElementById('svg-bloqueado');
    const svgDesbloqueado = document.getElementById('svg-desbloqueado');

    if (btnPuerta) {
        btnPuerta.addEventListener('click', () => {
            const abierta = btnPuerta.getAttribute('aria-pressed') === 'true';
            const nuevaEstado = !abierta;

            // Fuente de verdad
            btnPuerta.setAttribute('aria-pressed', String(nuevaEstado));

            if (nuevaEstado) {
                btnPuerta.classList.replace('dm-btn-puerta--bloqueada', 'dm-btn-puerta--abierta');
                btnPuerta.setAttribute('aria-label', 'Bloquear la puerta principal de la suite');
                btnPuerta.querySelector('.dm-puerta-texto').textContent = 'Bloquear Puerta';
                btnPuerta.querySelector('.dm-puerta-icono-lock').classList.add('hidden');
                btnPuerta.querySelector('.dm-puerta-icono-unlock').classList.remove('hidden');
                iconoPuerta.classList.remove('text-green-400');
                iconoPuerta.classList.add('dm-icono-puerta--abierta');
                svgBloqueado.classList.add('hidden');
                svgDesbloqueado.classList.remove('hidden');
                descPuerta.textContent = 'La puerta principal está desbloqueada.';

                const chipPuerta = document.getElementById('resumen-puerta');
                if (chipPuerta) {
                    chipPuerta.querySelector('svg').nextSibling.textContent = ' Abierta';
                    chipPuerta.classList.add('dm-resumen-chip--activo');
                }
                actualizarEstadoGlobal('Puerta desbloqueada', 'puerta');
            } else {
                btnPuerta.classList.replace('dm-btn-puerta--abierta', 'dm-btn-puerta--bloqueada');
                btnPuerta.setAttribute('aria-label', 'Desbloquear la puerta principal de la suite');
                btnPuerta.querySelector('.dm-puerta-texto').textContent = 'Desbloquear Puerta';
                btnPuerta.querySelector('.dm-puerta-icono-lock').classList.remove('hidden');
                btnPuerta.querySelector('.dm-puerta-icono-unlock').classList.add('hidden');
                iconoPuerta.classList.add('text-green-400');
                iconoPuerta.classList.remove('dm-icono-puerta--abierta');
                svgBloqueado.classList.remove('hidden');
                svgDesbloqueado.classList.add('hidden');
                descPuerta.textContent = 'La puerta principal de tu suite está bloqueada.';

                const chipPuerta = document.getElementById('resumen-puerta');
                if (chipPuerta) {
                    chipPuerta.querySelector('svg').nextSibling.textContent = ' Bloqueada';
                    chipPuerta.classList.remove('dm-resumen-chip--activo');
                }
                actualizarEstadoGlobal('Puerta bloqueada', 'puerta');
            }
        });
    }

    // 4. SUITES Y MODAL DE RESERVA
    configurarSuites();

    // 5. FOOTER (AÑO DINÁMICO Y REDES SIMULADAS)
    configurarFooter();
});

/* =========================================
   SUITES: DATOS, IMÁGENES Y MODAL (4.9)
   ========================================= */
const SUITES = {
    andina:  { nombre: 'Suite Andina', precio: 450, capacidad: 2 },
    master:  { nombre: 'Inkari Master', precio: 850, capacidad: 4 },
    terraza: { nombre: 'Suite Terraza', precio: 620, capacidad: 2 },
};

// Respaldo local si una imagen de suite no carga.
const SUITE_FALLBACK = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">' +
    '<rect width="800" height="500" fill="#0a0a0a"/>' +
    '<rect x="60" y="60" width="680" height="380" fill="none" stroke="#22d3ee" stroke-opacity="0.25" stroke-width="2"/>' +
    '<path d="M400 150l120 180H280z" fill="#22d3ee" fill-opacity="0.18"/>' +
    '<text x="400" y="390" text-anchor="middle" font-family="Outfit, sans-serif" font-size="26" fill="#ffffff">Inkari Smart</text>' +
    '<text x="400" y="418" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" letter-spacing="4" fill="#9ca3af">SUITE</text>' +
    '</svg>'
);

let suiteActiva = null;
let suiteUltimoFoco = null;
let suiteModalAbierto = false;
let suiteModalConfigurado = false;

function formatearPrecioSuite(valor) {
    const numero = Number(valor);
    return `S/ ${(Number.isFinite(numero) ? numero : 0).toFixed(2)}`;
}

function fechaISO(desplazamientoDias = 0) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + desplazamientoDias);
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

function sumarDiaISO(fechaIso) {
    const [anio, mes, dia] = fechaIso.split('-').map(Number);
    if (!anio || !mes || !dia) return fechaIso;
    const fecha = new Date(anio, mes - 1, dia);
    fecha.setDate(fecha.getDate() + 1);
    const nuevoMes = String(fecha.getMonth() + 1).padStart(2, '0');
    const nuevoDia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${nuevoMes}-${nuevoDia}`;
}

function nochesEntre(entrada, salida) {
    if (!entrada || !salida) return 0;
    const [aAnio, aMes, aDia] = entrada.split('-').map(Number);
    const [bAnio, bMes, bDia] = salida.split('-').map(Number);
    if (!aAnio || !bAnio) return 0;
    const inicio = Date.UTC(aAnio, aMes - 1, aDia);
    const fin = Date.UTC(bAnio, bMes - 1, bDia);
    return Math.round((fin - inicio) / 86400000);
}

function configurarSuites() {
    const grid = document.getElementById('grid-suites');
    if (!grid) return;

    grid.addEventListener('click', (evento) => {
        const boton = evento.target.closest('[data-accion="reservar-suite"]');
        if (!boton || !grid.contains(boton)) return;
        abrirModalSuite(boton.dataset.suite, boton);
    });

    // Si una imagen local falla, se sustituye por el SVG de respaldo.
    grid.addEventListener('error', (evento) => {
        const imagen = evento.target;
        if (!(imagen instanceof HTMLImageElement)) return;
        if (imagen.dataset.respaldo === 'true') return;

        imagen.dataset.respaldo = 'true';
        imagen.src = SUITE_FALLBACK;
        imagen.closest('.dm-suite-media')?.classList.add('is-loaded');
    }, true);

    grid.querySelectorAll('img.dm-suite-img').forEach((imagen) => {
        const marcarCargada = () => {
            imagen.classList.add('is-loaded');
            imagen.closest('.dm-suite-media')?.classList.add('is-loaded');
        };

        if (imagen.complete && imagen.naturalWidth > 0) {
            marcarCargada();
        } else {
            imagen.addEventListener('load', marcarCargada, { once: true });
        }
    });

    configurarModalSuite();
}

function configurarModalSuite() {
    if (suiteModalConfigurado) return;

    const modal = document.getElementById('modal-suite');
    const cerrar = document.getElementById('suite-modal-cerrar');
    const overlay = document.getElementById('suite-modal-overlay');
    const form = document.getElementById('suite-form');
    const exitoCerrar = document.getElementById('suite-exito-cerrar');
    if (!modal || !cerrar || !overlay || !form) return;

    suiteModalConfigurado = true;

    cerrar.addEventListener('click', () => cerrarModalSuite({ devolverFoco: true }));
    overlay.addEventListener('click', () => cerrarModalSuite({ devolverFoco: true }));
    exitoCerrar?.addEventListener('click', () => cerrarModalSuite({ devolverFoco: true }));
    form.addEventListener('submit', manejarEnvioSuite);

    document.getElementById('suite-entrada')?.addEventListener('change', ajustarFechasSuite);
    document.getElementById('suite-salida')?.addEventListener('change', actualizarTotalSuite);

    document.addEventListener('keydown', (evento) => {
        if (!suiteModalAbierto) return;

        if (evento.key === 'Escape') {
            evento.preventDefault();
            cerrarModalSuite({ devolverFoco: true });
            return;
        }

        if (evento.key === 'Tab') atraparFocoSuite(evento);
    });

    // El foco no puede escaparse al fondo mientras el modal está abierto.
    document.addEventListener('focusin', (evento) => {
        if (!suiteModalAbierto) return;
        const tarjeta = modal.querySelector('.dm-modal__card');
        if (tarjeta && !tarjeta.contains(evento.target)) {
            document.getElementById('suite-modal-titulo')?.focus({ preventScroll: true });
        }
    });
}

function abrirModalSuite(id, disparador) {
    const suite = SUITES[id];
    const modal = document.getElementById('modal-suite');
    if (!suite || !modal) return;

    suiteActiva = id;
    suiteUltimoFoco = disparador instanceof HTMLElement ? disparador : document.activeElement;
    suiteModalAbierto = true;

    modal.hidden = false;
    modal.inert = false;
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('dm-scroll-lock');

    prepararFormularioSuite(suite);

    window.requestAnimationFrame(() => {
        if (suiteModalAbierto) {
            document.getElementById('suite-modal-titulo')?.focus({ preventScroll: true });
        }
    });
}

function prepararFormularioSuite(suite) {
    const form = document.getElementById('suite-form');
    const exito = document.getElementById('suite-exito');
    const error = document.getElementById('suite-error');
    const titulo = document.getElementById('suite-modal-titulo');
    const desc = document.getElementById('suite-modal-desc');
    const entrada = document.getElementById('suite-entrada');
    const salida = document.getElementById('suite-salida');
    const huespedes = document.getElementById('suite-huespedes');
    if (!form || !entrada || !salida || !huespedes) return;

    form.hidden = false;
    form.reset();
    if (exito) exito.hidden = true;
    if (error) {
        error.hidden = true;
        error.textContent = '';
    }

    if (titulo) titulo.textContent = `Reservar ${suite.nombre}`;
    if (desc) {
        desc.textContent = `Desde ${formatearPrecioSuite(suite.precio)} por noche · hasta ${suite.capacidad} ${suite.capacidad === 1 ? 'huésped' : 'huéspedes'}.`;
    }

    huespedes.replaceChildren();
    for (let i = 1; i <= suite.capacidad; i += 1) {
        const opcion = document.createElement('option');
        opcion.value = String(i);
        opcion.textContent = `${i} ${i === 1 ? 'huésped' : 'huéspedes'}`;
        huespedes.appendChild(opcion);
    }
    huespedes.value = String(Math.min(2, suite.capacidad));

    const hoy = fechaISO(0);
    entrada.min = hoy;
    entrada.value = hoy;
    salida.min = fechaISO(1);
    salida.value = fechaISO(1);

    actualizarTotalSuite();
}

function ajustarFechasSuite() {
    const entrada = document.getElementById('suite-entrada');
    const salida = document.getElementById('suite-salida');
    if (!entrada || !salida || !entrada.value) return;

    const minimo = sumarDiaISO(entrada.value);
    salida.min = minimo;
    if (!salida.value || salida.value < minimo) salida.value = minimo;

    actualizarTotalSuite();
}

function actualizarTotalSuite() {
    if (!suiteActiva) return;

    const suite = SUITES[suiteActiva];
    const entrada = document.getElementById('suite-entrada');
    const salida = document.getElementById('suite-salida');
    const total = document.getElementById('suite-total');
    const nochesEl = document.getElementById('suite-noches');
    if (!suite || !entrada || !salida || !total) return;

    const noches = Math.max(nochesEntre(entrada.value, salida.value), 0);
    total.textContent = formatearPrecioSuite(noches * suite.precio);
    if (nochesEl) nochesEl.textContent = noches === 1 ? '1 noche' : `${noches} noches`;
}

function mostrarErrorSuite(mensaje) {
    const error = document.getElementById('suite-error');
    if (!error) return;

    error.textContent = mensaje;
    error.hidden = !mensaje;
    if (mensaje) anunciarSuite(mensaje);
}

function anunciarSuite(mensaje) {
    const estado = document.getElementById('suite-estado');
    if (!estado) return;

    estado.textContent = '';
    window.setTimeout(() => {
        estado.textContent = mensaje;
    }, 60);
}

function manejarEnvioSuite(evento) {
    evento.preventDefault();
    if (!suiteActiva) return;

    const suite = SUITES[suiteActiva];
    const entrada = document.getElementById('suite-entrada');
    const salida = document.getElementById('suite-salida');
    const huespedes = document.getElementById('suite-huespedes');
    const nombre = document.getElementById('suite-nombre-huesped');
    const email = document.getElementById('suite-email');
    const form = document.getElementById('suite-form');
    const exito = document.getElementById('suite-exito');
    const resumen = document.getElementById('suite-exito-resumen');
    const codigo = document.getElementById('suite-codigo');
    if (!suite || !entrada || !salida || !nombre || !email || !form || !exito) return;

    const noches = nochesEntre(entrada.value, salida.value);
    const nombreLimpio = nombre.value.trim();
    const emailLimpio = email.value.trim();

    if (!entrada.value || !salida.value) {
        mostrarErrorSuite('Elige las fechas de entrada y salida.');
        entrada.focus();
        return;
    }

    if (noches < 1) {
        mostrarErrorSuite('La salida debe ser posterior a la entrada.');
        salida.focus();
        return;
    }

    if (nombreLimpio.length < 2) {
        mostrarErrorSuite('Escribe el nombre del huésped.');
        nombre.focus();
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
        mostrarErrorSuite('Escribe un correo válido.');
        email.focus();
        return;
    }

    mostrarErrorSuite('');

    const total = noches * suite.precio;
    const codigoReserva = `INK-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    if (resumen) {
        resumen.textContent = `${suite.nombre} · ${noches} ${noches === 1 ? 'noche' : 'noches'} · ${huespedes?.value || '2'} huéspedes · ${formatearPrecioSuite(total)}`;
    }
    if (codigo) codigo.textContent = codigoReserva;

    form.hidden = true;
    exito.hidden = false;
    anunciarSuite(`Reserva simulada confirmada para ${suite.nombre}. Código ${codigoReserva}.`);

    window.requestAnimationFrame(() => {
        document.getElementById('suite-exito-titulo')?.focus({ preventScroll: true });
    });
}

function cerrarModalSuite({ devolverFoco = true } = {}) {
    const modal = document.getElementById('modal-suite');
    if (!modal || !suiteModalAbierto) return;

    suiteModalAbierto = false;
    modal.hidden = true;
    modal.inert = true;
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('dm-scroll-lock');

    const foco = suiteUltimoFoco;
    suiteUltimoFoco = null;
    suiteActiva = null;

    if (devolverFoco && foco?.isConnected) {
        foco.focus({ preventScroll: true });
    }
}

function atraparFocoSuite(evento) {
    const tarjeta = document.querySelector('#modal-suite .dm-modal__card');
    if (!tarjeta) return;

    const enfocables = [...tarjeta.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter((elemento) => elemento.offsetParent !== null);

    if (enfocables.length === 0) {
        evento.preventDefault();
        tarjeta.focus({ preventScroll: true });
        return;
    }

    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    const activo = document.activeElement;

    if (evento.shiftKey) {
        if (activo === primero || !tarjeta.contains(activo)) {
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
/* =========================================
   FOOTER: AÑO DINÁMICO Y REDES (4.10)
   ========================================= */
let footerAvisoTimer = null;

function configurarFooter() {
    // H10: el copyright usa siempre el año en curso.
    const anio = document.getElementById('anio-actual');
    if (anio) anio.textContent = String(new Date().getFullYear());

    const aviso = document.getElementById('footer-aviso');
    const botones = document.querySelectorAll('[data-red]');
    if (!aviso || botones.length === 0) return;

    // Las redes son simuladas: se informa sin navegar a un enlace vacío.
    botones.forEach((boton) => {
        boton.addEventListener('click', () => {
            const red = boton.dataset.red || 'Red social';
            aviso.textContent = `${red}: enlace simulado en este prototipo.`;
            window.clearTimeout(footerAvisoTimer);
            footerAvisoTimer = window.setTimeout(() => {
                aviso.textContent = '';
            }, 4000);
        });
    });
}
