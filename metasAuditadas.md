# 🗺️ metas.md — Hoja de ruta de rediseño · devToolsCusco

> **Objetivo:** rediseñar todo el sitio para que sea moderno, profesional, limpio y 100 % responsive.
> **Método:** metas pequeñas (1 meta ≈ 1 sesión corta). Al terminar una meta se marca `- [x]` y se anota una línea en el **Registro de avance** del final.
> **Regla de oro:** no se empieza una meta si la anterior no está marcada. No se pasa de fase sin cerrar el checklist de la fase.

---

## 0. Contexto detectado (lectura inicial del proyecto)

**Estructura actual**

```
devToolsCusco/
├── index.html                  ← Hub principal (Tailwind CDN + styles.css + main.js)
├── assets/
│   ├── css/styles.css          ← animaciones, reveal, tilt, header, menú móvil
│   ├── js/main.js              ← menú móvil, header inteligente, contadores, reveal, tilt, back-to-top
│   └── img/ (cusco-view.jpg, favicon.svg)
└── productos/
    ├── reservas/   (index.html, admin.html, css/restaurante.css, js/{app,admin,data}.js, img/)
    ├── ecommerce/  (index.html, css/inkari.css, js/{app,data}.js)
    └── domotica/   (index.html, css/domotica.css, js/app.js)
```

**Stack actual:** HTML5 + Tailwind por CDN (con `tailwind.config` repetido en cada página) + CSS propio + JS vanilla. Sin build.

**Hallazgos que condicionan el plan** (a corregir durante las fases):

- [x] H1 · `index.html`: se usan clases `brand-200/300/400/800` que **no existen** en el `tailwind.config` (solo hay 50, 100, 500, 600, 700, 900) → algunos estilos no se aplican.
- [x] H2 · `index.html`: el botón “Ver Prototipos” apunta a `#prototipos`, pero la sección se llama `#productos` → ancla rota.
- [x] H3 · `index.html`: el footer tiene enlaces `#` vacíos y la etiqueta “Control con Ecommerce” es confusa.
- [x] H4 · `README.md` está desactualizado (menciona `productos/reservas.html` y `productos/domotica.html`, y no menciona ecommerce). (Revisado y aprobado)
- [ ] H5 · `reservas`, `ecommerce` y `domotica`: el menú de navegación es `hidden md:flex` **sin menú móvil** → en celular no hay navegación. *(🟡 parcial: `reservas` resuelto en 2.4; `ecommerce` en 3.3 y `domotica` en 4.3)*
- [x] H6 · `reservas`: la imagen del hero usa ruta absoluta `/productos/reservas/img/cusco-view.jpg` (falla si el proyecto no se sirve desde la raíz). Además hay imágenes `.jpe` y varias imágenes hotlinkeadas desde Unsplash/Booking (frágiles). (Revisado y aprobado en 2.3)
- [ ] H7 · `reservas`: la ventana del chatbot usa `right-24` y ancho fijo `w-80` → riesgo de desborde en móvil.
- [ ] H8 · `ecommerce`: filtros de categoría “simulados” (sin funcionalidad) y botón “Finalizar Compra” sin acción.
- [ ] H9 · `domotica`: botones “Reservar Suite” sin acción; el tercer `<img>` usa una URL externa de bstatic.
- [ ] H10 · Copyright fijo “2024” en los tres subproyectos (el hub sí usa año dinámico).
- [ ] H11 · Cada página redefine su propio `tailwind.config` → duplicación y falta de sistema común.

> ℹ️ Aún **no** se han leído `admin.html`, los `.css` de cada módulo ni los `.js` de los módulos. Cada fase empieza con una meta de “auditoría” para leerlos antes de tocar nada.

---

## 1. Sistema de diseño (decisión base, se implementa en la Fase 1)

**Enfoque elegido: Tailwind CSS por CDN (ya en uso) + variables CSS como *design tokens*.**
Motivo: no exige build, conserva lo ya construido y permite que cada módulo tenga su propia identidad (verde/cian del hub, criollo cálido en reservas, terracota en ecommerce, neón oscuro en domótica) sobre una base común.

**Tokens compartidos (definidos en `:root` de `assets/css/styles.css`)**

- **Color:** primario, secundario, acento, superficies (`--surface-1/2/3`), texto (`--text-strong/body/muted`), bordes, estados (éxito, aviso, error). Escala completa 50–900 para la marca (corrige H1).
- **Tipografía:** familia display + cuerpo, escala fluida con `clamp()` (h1…small), pesos y *line-height* definidos.
- **Espaciado:** escala de 4 px (`--space-1 … --space-12`) y ancho de contenedor único (`--container`).
- **Forma y profundidad:** radios (`--radius-sm/md/lg/xl/full`), sombras (`--shadow-sm/md/lg/glow`), bordes sutiles.
- **Movimiento:** duraciones y *easings* (`--ease-out`, `--dur-fast/base/slow`), todo respetando `prefers-reduced-motion`.
- **Breakpoints:** mobile-first (`sm 640 / md 768 / lg 1024 / xl 1280`).

**Componentes base reutilizables:** botón (primario / secundario / ghost), badge, tarjeta, input/select/textarea, navbar con menú móvil, sección con encabezado, footer.

**Reglas de calidad (aplican a todas las fases):**

- Mobile-first; probar a 360 px, 768 px y 1280 px.
- Contraste AA, foco visible, `alt` en imágenes, `aria-*` en menús/modales.
- Imágenes con `loading="lazy"`, `width/height` y rutas **relativas**.
- Cero enlaces `#` vacíos ni anclas rotas.
- Cada módulo conserva su identidad de color/tipografía; solo comparte estructura, espaciado, formas y componentes.
- Se mantiene la lógica JS existente salvo que la meta diga lo contrario.

---

## ✅ FASE 1 — Página principal (`index.html` raíz + `assets/css/styles.css`)

### 1A · Cimientos
- [x] **1.1 Auditoría y respaldo mental:** listar secciones, IDs y clases `data-*` que usa `main.js` (`data-reveal`, `data-tilt`, `data-count`, `#menu-toggle`, etc.) para no romper nada al refactorizar.
- [x] **1.2 Tokens de diseño:** crear la sección `:root` en `styles.css` (color, tipografía fluida, espaciado, radios, sombras, movimiento).
- [x] **1.3 Configuración Tailwind del hub:** completar la escala `brand` 50–900 y mapear colores/fuentes a los tokens (corrige H1).
- [x] **1.4 Base y accesibilidad en CSS** *(utilidades con prefijo `ds-` para no chocar con `.container` de Tailwind: `.ds-container`, `.ds-section`, `.ds-btn`, `.ds-badge`, `.ds-card`, `.ds-skip-link`)*: reset ligero, `focus-visible`, `scroll-padding`, selección de texto, `prefers-reduced-motion`, utilidades `.container`, `.section`, `.btn`, `.badge`, `.card`.

### 1B · Componentes del `index.html` (uno por meta)
- [x] **1.5 Header / Navbar:** refinar logo, enlaces, CTA y estado activo; corregir ancla `#prototipos` → `#productos` (H2); pulir comportamiento sticky/hide-on-scroll.
- [x] **1.6 Menú móvil:** rediseñar panel desplegable (transición, tamaño táctil ≥ 44 px, cierre con `Esc` y al hacer clic fuera, `aria-expanded`).
- [x] **1.7 Hero Section:** reestructurar jerarquía tipográfica, CTAs, trust bar y fondo; asegurar que no desborde a 360 px.
- [x] **1.8 Mock visual del Hero:** refinar el dashboard flotante (versión desktop) y definir qué se muestra en móvil/tablet (hoy está `hidden lg:block`).
- [x] **1.9 Sección Servicios / Ecosistema:** mejorar las dos tarjetas (Software a Medida y Domótica): ritmo vertical, listas, iconos, CTAs.
- [x] **1.10 Sección Prototipos (vitrina):** unificar las 3 tarjetas (Reservas, Domótica, Ecommerce), mejorar cabeceras de tarjeta y estados hover; evaluar mostrar una vista previa en lugar de solo un icono.
- [x] **1.11 Sección Impacto Social:** pulir timeline, tarjeta de métricas, testimonio y CTA de talento; revisar contraste sobre fondo oscuro.
- [x] **1.12 Footer:** reorganizar columnas, reemplazar enlaces `#` vacíos y corregir “Control con Ecommerce” (H3); responsive a 1 / 2 / 4 columnas.
- [x] **1.13 Botón “Volver arriba” y micro-interacciones:** revisar tilt/spotlight y reveal para que se vean sutiles y profesionales.

### 1C · Cierre de Fase 1
- [x] **1.14 Limpieza de `styles.css`:** ordenar por secciones, eliminar CSS muerto, comentar tokens.
- [x] **1.15 Revisión de `main.js`:** solo ajustes necesarios por el nuevo HTML (sin reescribir lo que ya funciona).
- [x] **1.16 SEO y metadatos:** `title`, `description`, Open Graph, `theme-color`, favicon.
- [x] **1.17 Actualizar `README.md`:** estructura real, módulos (reservas, ecommerce, domótica), sistema de diseño (corrige H4). (Revisado y aprobado)
- [x] **1.18 QA Fase 1:** 360 / 768 / 1280 px, teclado, contraste, enlaces a los 3 módulos, consola sin errores. (Revisado y aprobado)

---

## 🍽️ FASE 2 — Módulo Reservas (`productos/reservas`)

> Identidad: criollo cálido (adobe, maíz, huerto) · Playfair Display + Lora + Inter.

### 2A · Preparación
- [x] **2.1 Auditoría del módulo:** leer `admin.html`, `restaurante.css`, `app.js`, `admin.js`, `data.js`; mapear IDs que usa el JS. (Revisado y aprobado)
- [x] **2.2 Tokens del módulo:** variables CSS propias (heredando estructura de la Fase 1) + `tailwind.config` alineado. (Revisado y aprobado)
- [x] **2.3 Normalizar assets:** rutas relativas (H6), renombrar/convertir `.jpe`, decidir qué imágenes externas (Unsplash) se descargan a `img/`. (Revisado y aprobado)

### 2B · `index.html` (público)
- [x] **2.4 Navbar + menú móvil:** crear menú móvil (H5), mantener botón “Reservar Mesa” y acceso staff; fondo que cambie al hacer scroll. (Revisado y aprobado)
- [x] **2.5 Hero:** corregir ruta de imagen, mejorar overlay, tipografía y CTAs. (Revisado y aprobado)
- [x] **2.6 Carta / Platos:** rediseñar tarjetas inyectadas por JS (`#grid-platos`), manteniendo la estructura que genera `app.js`. (Revisado y aprobado)
- [x] **2.7 Nosotros y Espacios:** mejorar composición de imagen+texto y las 3 tarjetas de espacios. (Revisado y aprobado)
- [x] **2.8 Formulario de reservas:** inputs unificados, validación visual, estados de error/éxito, layout móvil. (Revisado y aprobado)
- [ ] **2.9 Chatbot visual:** hacerlo responsive (ancho, posición, `right-24`, H7), mejorar burbujas y botón flotante.
- [ ] **2.10 Footer:** año dinámico (H10), enlace claro de regreso al hub.

### 2C · `admin.html`
- [ ] **2.11 Panel admin:** layout (sidebar/topbar), tabla o tarjetas de reservas responsive, estados (pendiente/confirmada/cancelada).
- [ ] **2.12 Login/acceso staff y acciones:** revisar flujo visual, filtros y botones de acción.

### 2D · Cierre de Fase 2
- [ ] **2.13 Limpieza de `restaurante.css` y ajustes mínimos en `app.js`/`admin.js`.**
- [ ] **2.14 QA Fase 2:** flujo completo (reservar → ver en admin), 360 / 768 / 1280 px, consola limpia.

---

## 🛍️ FASE 3 — Módulo Ecommerce (`productos/ecommerce`)

> Identidad: artesanal cusqueña (crema, tierra, terracota, dorado) · Playfair Display + Inter.

### 3A · Preparación
- [ ] **3.1 Auditoría del módulo:** leer `inkari.css`, `app.js`, `data.js`; mapear IDs y estructura de datos de productos.
- [ ] **3.2 Tokens del módulo:** variables CSS propias + `tailwind.config` alineado.

### 3B · Componentes
- [ ] **3.3 Navbar + menú móvil:** añadir menú móvil (H5), conservar botón de carrito con contador.
- [ ] **3.4 Hero:** composición más editorial, CTA, fondo/patrón.
- [ ] **3.5 Filtros de categoría:** hacerlos funcionales (Todos / Textiles / Joyería / Cerámica) con estado activo (H8).
- [ ] **3.6 Grid y tarjeta de producto:** imagen con proporción fija, precio, botón “añadir”, estados hover, skeleton/placeholder de carga.
- [ ] **3.7 Carrito lateral:** header, ítems (cantidad +/−, eliminar), subtotal, estado vacío, accesibilidad del panel (`Esc`, foco).
- [ ] **3.8 Flujo “Finalizar compra”:** al menos un resumen/confirmación visual simulado (H8).
- [ ] **3.9 Historia / Artesanos:** revisar sección “Nuestra Historia” y crear/ajustar `#artesanos` (el enlace existe en el nav).
- [ ] **3.10 Toast, footer y copyright dinámico** (H10).

### 3C · Cierre de Fase 3
- [ ] **3.11 Limpieza de `inkari.css` y ajustes mínimos en `app.js`.**
- [ ] **3.12 QA Fase 3:** agregar/quitar productos, filtros, carrito en móvil, consola limpia.

---

## 🏠 FASE 4 — Módulo Domótica (`productos/domotica`)

> Identidad: oscuro tecnológico (negro, cian neón) · Outfit + Inter.

### 4A · Preparación
- [ ] **4.1 Auditoría del módulo:** leer `domotica.css` y `app.js`; mapear IDs (`toggle-luces`, `slider-temp`, `btn-puerta`, `estado-global`, etc.).
- [ ] **4.2 Tokens del módulo:** variables CSS propias (neón, superficies oscuras, glow) + `tailwind.config` alineado.

### 4B · Componentes
- [ ] **4.3 Navbar “pill” + menú móvil:** añadir versión móvil (H5), conservar “Volver al Hub”.
- [ ] **4.4 Hero y mockup de suite:** jerarquía, responsive del mockup y de la tarjeta flotante.
- [ ] **4.5 Panel de control — Iluminación:** toggle accesible, feedback visual de luz encendida/apagada.
- [ ] **4.6 Panel de control — Climatización:** slider estilizado cross-browser, valor en vivo, color según temperatura.
- [ ] **4.7 Panel de control — Seguridad:** botón de puerta con estados (bloqueada/abierta), animación sutil.
- [ ] **4.8 Barra de estado global:** reflejar cambios de los tres controles.
- [ ] **4.9 Sección Suites:** tarjetas consistentes, imágenes locales o con *fallback* (H9), botones “Reservar Suite” con acción (modal o enlace a reservas).
- [ ] **4.10 Footer y copyright dinámico** (H10).

### 4C · Cierre de Fase 4
- [ ] **4.11 Limpieza de `domotica.css` y ajustes mínimos en `app.js`.**
- [ ] **4.12 QA Fase 4:** probar los 3 controles, 360 / 768 / 1280 px, rendimiento de blur/glow en móvil, consola limpia.

---

## 🏁 Definición de “terminado” (global)

- [ ] Los 4 sitios (hub + 3 módulos) se ven coherentes como familia, cada uno con su identidad.
- [ ] Navegación móvil funcional en todas las páginas.
- [ ] Sin enlaces rotos, sin anclas inválidas, sin rutas absolutas.
- [ ] Sin errores en consola.
- [ ] README actualizado.
- [ ] Hallazgos H1–H11 resueltos.

---

## 📎 Notas de auditoría — Meta 1.1 (contrato HTML ↔ CSS ↔ JS del hub)

**No se pueden renombrar ni eliminar al refactorizar `index.html`** (los usa `main.js` / `styles.css`):

| Elemento | Quién lo usa | Detalle |
|---|---|---|
| `#menu-toggle`, `#mobile-menu`, `#icon-open`, `#icon-close` | main.js §1 | El menú depende de la combinación de clases `hidden` + `is-open` y de `aria-expanded` / `aria-label`. El panel arranca con `hidden`. |
| `#site-header` + clases `is-scrolled`, `is-hidden` | main.js §2-3, CSS §2 | Sombra tras 8 px; se oculta al bajar pasados 200 px. |
| `#year` | main.js §4 | Año dinámico del footer. |
| `[data-count]` + `data-suffix` | main.js §5 | Contadores de Impacto (25+, 18, 100 %, 12+). Texto inicial `0`. |
| `[data-reveal]` + `data-delay` + clase `is-visible` | main.js §6, CSS §4 | Aparición al hacer scroll. |
| `[data-tilt]` + clase `is-hovered` + vars `--mx`, `--my` | main.js §7, CSS §6 | Tilt 3D + spotlight (solo con `hover: hover`). |
| `.hero-anim`, `.hero-anim-1…5` | CSS §3 | Animación escalonada del hero (arranca en `opacity: 0`). |
| `#back-to-top` + clase `is-visible` | main.js §8, CSS §7 | Aparece tras 600 px de scroll. |
| `a[href^="#"]` | main.js §9 | Scroll suave + enlace activo (añade `text-brand-700 font-semibold`). |

**Anclas existentes:** `#servicios`, `#productos`, `#impacto`, `#contacto` (es el `<footer>`), `#hero`. **Rota:** `#prototipos` (navbar y menú móvil).

**Riesgos detectados para las metas siguientes:**

- **A1 · Conflicto tilt vs. Tailwind** *(✅ resuelto en 1.9 y 1.10)*: las tarjetas `[data-tilt]` también llevan `hover:-translate-y-1`; el `transform` inline que escribe el JS lo pisa. Resolver en 1.9 / 1.10 / 1.13 (dejar solo uno de los dos efectos).
- **A2 · Clase huérfana** *(✅ eliminada en 1.13)*: `.tilt-inner` existe en CSS pero no se usa en ningún HTML.
- **A3 · Enlace activo demasiado amplio** *(✅ resuelto en 1.5: ahora solo `#site-header a[href^="#"]`)*: el observer marca como activo **cualquier** `<a href="#…">` (CTAs del hero, footer), no solo el menú. Acotar a `header nav a` en 1.15.
- **A4 · Header oculto con menú abierto** *(✅ resuelto en 1.6)*: si se hace scroll con el menú móvil abierto, el header se esconde. Revisar en 1.6.
- **A5 · Clases dinámicas de Tailwind:** el JS añade `text-brand-700` / `font-semibold`; se mantienen en la escala `brand` (1.3).

---

## 📎 Notas de auditoría — Meta 2.1 (contrato HTML ↔ JS del módulo Reservas)

**Alcance:** lectura completa de `productos/reservas/index.html`, `admin.html`, `css/restaurante.css`, `js/app.js`, `js/admin.js` y `js/data.js`, más una validación del contrato (IDs usados por el JS, IDs duplicados, anclas internas y funciones invocadas desde atributos `onclick`). **La auditoría no modificó ningún archivo del módulo.**

**Resultado base (lo que ya estaba sano):** 0 IDs duplicados, 0 anclas internas rotas, 0 IDs que el JS necesite y falten en el HTML, y las 11 funciones invocadas desde el HTML/plantillas existían en `admin.js`.

### Inventario (cifras del momento de la auditoría 2.1)

| Archivo | Tamaño | Rol |
|---|---:|---|
| `index.html` | 21.9 KB · 353 líneas | Vista pública: hero, carta inyectada, nosotros, espacios, formulario, footer y chatbot |
| `admin.html` | 22.1 KB · 343 líneas | Login, sidebar, 3 vistas, KPIs, tablas y 2 modales |
| `css/restaurante.css` | **0 B** | Enlazado por `index.html` (línea 39) pero vacío |
| `js/app.js` | 5.7 KB · 125 líneas | Render de platos, formulario y mensaje de éxito |
| `js/admin.js` | 16.9 KB · 407 líneas | Sesión, navegación, KPIs, tablas, CRUD, modales y gráfico SVG |
| `js/data.js` | 1.5 KB · 43 líneas | `PLATOS_INICIALES` + seed de `rinconcito_platos` |

### Contrato `index.html` ↔ `app.js`

| Elemento | Uso |
|---|---|
| `#grid-platos` | contenedor donde se inyectan las tarjetas |
| `#form-reserva` | `submit` → arma la reserva y la guarda |
| `#res-nombre`, `#res-telefono` | se leen con `.value.trim()` |
| `#res-fecha` | valor + `min` = hoy |
| `#res-hora`, `#res-personas`, `#res-notas` | lectura directa |

### Contrato `admin.html` ↔ `admin.js`

| Bloque | IDs |
|---|---|
| Sesión | `#pantalla-login`, `#app-panel`, `#login-form`, `#login-usuario`, `#login-password`, `#rol-usuario`, `#nombre-usuario`, `#correo-usuario`, `#inicial-usuario`, `#admin-anuncio` |
| Navegación | `#admin-sidebar`, `#admin-overlay`, `#admin-menu-toggle`, `#nav-resumen`, `#nav-platos`, `#nav-reservas` (botones `[data-vista]`), `#vista-resumen`, `#vista-platos`, `#vista-reservas`, `#titulo-seccion` |
| KPIs / gráfico | `#kpi-activas`, `#kpi-platos`, `#kpi-reservas`, `#contenedor-grafico` |
| Tablas | `#tabla-platos-body`, `#tabla-reservas-body` |
| Modal plato | `#modal-plato`, `#form-plato`, `#plato-nombre`, `#plato-precio`, `#plato-categoria`, `#plato-imagen`, `#plato-desc` |
| Modal reserva | `#modal-reserva`, `#form-reserva-admin`, `#admin-res-fecha`, `#admin-res-nombre`, `#admin-res-telefono`, `#admin-res-hora`, `#admin-res-personas` |

> Contrato verificado contra el código vigente (revisión Claude): los IDs de `admin.html` ↔ `admin.js` coinciden. Se actualiza al cerrar 2.11 con las particularidades de la delegación de eventos.

### Funciones globales invocadas desde el HTML

| Función | Dónde se invoca |
|---|---|
| `loginRapido('admin' \| 'vendedor')` | 2 botones del login |
| `cerrarSesion()` | sidebar |
| `cambiarVista('resumen' \| 'platos' \| 'reservas')` | los 3 botones `[data-vista]` del sidebar |
| `abrirModalPlato()` / `cerrarModalPlato()` | vista platos y modal (`onclick`) |
| `abrirModalReserva()` / `cerrarModalReserva()` | vista reservas y modal (`onclick`) |
| `eliminarPlato(id)` | `[data-accion="eliminar-plato"]` |
| `eliminarReserva(id)` | `[data-accion="eliminar-reserva"]` |
| `cambiarEstadoReserva(id, estado)` | evento `change` del `<select data-accion="estado-reserva">` |
| `location.reload()` | `cerrarSesion()` |

> **Hay que conservar IDs, firmas de las funciones globales y los atributos `data-*`.**

### `localStorage`

| Clave | Escribe | Lee | Notas |
|---|---|---|---|
| `rinconcito_platos` | `data.js` (seed), `admin.js` (alta/baja) | `app.js`, `admin.js` | El seed solo corre si la clave **no existe** |
| `rinconcito_reservas` | `app.js` (pública), `admin.js` (alta/estado/baja) | `admin.js` | Sin límite ni validación de esquema |
| `rinconcito_sesion` | `admin.js` (`loginRapido`) | `admin.js` (al cargar) | Guarda `'admin'` o `'vendedor'`; sin caducidad |

### Anclas del HTML público (sin lógica JS)

`#platos`, `#nosotros`, `#espacios`, `#reservas` (destinos de navegación).

### Hallazgos y riesgos (estado al momento de la auditoría; cada meta añade su marca al cerrarse)

#### 🔴 Bloqueantes

- **R1 · El login filtra la contraseña en la URL.** `#login-form` no tenía `submit` handler ni `method`: al pulsar Enter el navegador hacía un **GET** y recargaba `admin.html?login-usuario=…&login-password=…`. Solo funcionaban los botones `loginRapido(...)`; `#login-usuario` y `#login-password` no se leían. → **2.12**.
- **R2 · `restaurante.css` está vacío.** *(🟡 parcial en 2.2: ya contiene tokens, base, keyframes y reduced-motion; la limpieza final sigue en 2.13)* 0 bytes, enlazado desde `index.html`. Sin estilos propios, `@keyframes`, `prefers-reduced-motion` ni foco visible del módulo. → **2.2 / 2.13**.
- **R3 · El chatbot es decorativo.** Ningún `#chat-*` aparecía en `app.js`/`admin.js`: la ventana arrancaba `hidden` sin forma de abrirla, y `#chat-window` tenía `hidden flex-col` sin `flex`. → **2.9**.
- **R4 · El vendedor ve “Resumen”.** `cambiarVista()` reescribía el `className` de los 3 navs y eliminaba el `hidden` que `iniciarSesion()` ponía a `#nav-resumen`. → **2.11 / 2.12**.
- **R5 · Un `localStorage` corrupto desactiva el formulario público.** `JSON.parse` de `rinconcito_platos` sin `try/catch` (`app.js`): la excepción corta el `DOMContentLoaded` y `configurarFormularioReserva()` nunca se ejecuta. Igual con `rinconcito_reservas` al enviar. → **2.13**.
- **R6 · `toFixed` asume número.** *(✅ resuelto: `app.js` normaliza con `Number()` en 2.6; `admin.js` queda cubierto en 2.11)* `plato.precio.toFixed(2)` en `app.js` y `admin.js` lanza `TypeError` si el precio guardado es texto, `null` o falta. → **2.13**.

#### 🟠 Importantes

- **R7 · Dos `tailwind.config` incompatibles.** *(✅ resuelto en 2.2)* `index.html` y `admin.html` definían paletas y fuentes distintas: `hover:bg-ink-800` (chat), `hover:bg-adobe-50` (login) y `font-display` (“Bienvenido”) no existían. → **2.2**.
- **R8 · Faltan los `@keyframes`.** *(✅ resuelto en 2.2)* `animate-[fadeIn_…]`, `animate-[scaleIn_…]` y `animate-[hero-fade-up_…]` no tenían definición: el contenido se veía, sin animación. → **2.2**.
- **R9 · Rutas y peso de imágenes.** *(✅ resuelto en 2.3)* Hero público con ruta absoluta `/productos/reservas/img/cusco-view.jpg` (el admin usaba la relativa) → H6. `.jpe` no estándar en `data.js`. Cuatro imágenes externas de Unsplash en Nosotros/Espacios. `lomo.png` pesaba 832 KB y no había `width/height` ni `loading="lazy"`. → **2.3 / 2.5 / 2.7**.
- **R10 · El admin no es responsive.** `body h-screen overflow-hidden` + sidebar fijo `w-64` dejaban ~104 px útiles a 360 px; tablas de 4-5 columnas y modales con `grid-cols-2/3` no cabían. → **2.11**.
- **R11 · El admin no carga `data.js`.** *(🟡 parcial en 2.3: `admin.html` ya carga `data.js` antes de `admin.js`; queda la recuperación tras borrado total en 2.13)* En un navegador limpio, entrar directo a `admin.html` mostraba 0 platos; y como el seed solo corre si la clave no existe, borrar todos los platos impide recuperar los 4 iniciales. → **2.11 / 2.13**.
- **R12 · Categorías incoherentes.** `data.js` usa `Especialidad`, `Extras`, `Bebida`, `Sopas`; el `<select>` del admin no ofrecía `Extras`. → **2.11**.
- **R13 · Datos sin escapar en `innerHTML`.** *(🟡 parcial en 2.6: las tarjetas públicas escapan `nombre`, `descripcion`, `categoria` e `imagen`; `admin.js` en 2.11; resto de `app.js` en 2.13)* `app.js` y `admin.js` interpolaban `nombre`, `descripcion`, `imagen`, `categoria`, `notas` y `telefono` tal cual: un plato o reserva con `<img onerror=…>` ejecuta script. → **2.13**.
- **R14 · Formularios sin asociación accesible.** `<label>` sin `for`; el chat sin `aria-label`/`aria-expanded`/`aria-live`; botones de icono sin nombre accesible. → **2.4 / 2.8 / 2.9 / 2.11**.
- **R15 · Navegación con `href="#"`.** Los 3 navs del admin usaban `href="#"` + `onclick`: saltaban al inicio, ensuciaban la URL y no tenían `aria-current`. → **2.11**.
- **R16 · Contraste insuficiente en varios puntos.** *(🟡 parcial en 2.5: header y hero usan un scrim oscuro, por lo que `maiz-500` y `cal-50` sobre la foto tienen contraste suficiente; queda el panel admin en 2.11)* `maiz-500` sobre blanco/`cal-50` = 2.40–2.48:1; `green-600` sobre blanco = 3.30:1; `gray-400` sobre blanco = 2.54:1. Sí pasaban: `adobe-500` (5.89), `cal-100` sobre `ink-900` (13.88) y blanco sobre `adobe-500` (5.89). → **2.2 / 2.4 / 2.11**.
- **R17 · Fecha “hoy” en UTC.** *(✅ en 2.8 para el formulario público con `fechaLocalISO()`; el modal del admin se cubre en 2.11)* `new Date().toISOString().split('T')[0]` devuelve el día UTC: en Cusco (UTC-5), después de las 19:00 el mínimo del calendario salta a mañana. → **2.8 / 2.12**.
- **R18 · Footer y navegación móvil.** *(🟡 parcial en 2.4: header fijo con fondo al hacer scroll, menú móvil accesible y acceso staff visible en móvil; queda el footer en 2.10)* Año fijo “2024” (H10); nav `hidden md:flex` sin menú móvil (H5) y el acceso staff dentro de ese nav: en móvil no había forma de llegar al admin. → **2.4 / 2.10**.
- **R19 · Modales sin semántica ni gestión de foco.** Sin `role="dialog"`, `aria-modal`, foco inicial, trampa de foco, cierre con `Esc` ni bloqueo del scroll; al cambiar el estado de una reserva se re-renderizaba la tabla y el foco se perdía. → **2.11**.

#### 🟡 Menores / deuda

- **R20 · KPIs engañosos.** “Ingresos” = `reservas.length * 35` y “últimos 30 días” contaba todas las reservas. → **2.11**.
- **R21 · Gráfico simulado.** Datos fijos, sin redibujar al redimensionar y dibujado también para el vendedor con la vista oculta. → **2.11**.
- **R22 · El éxito destruye el formulario.** *(✅ resuelto en 2.8)* `mostrarMensajeExito()` reemplazaba el `innerHTML` del contenedor y obligaba a recargar para reservar otra vez. → **2.8**.
- **R23 · Sin fallback sin JS.** *(✅ resuelto en 2.6)* `#grid-platos` quedaba vacío y no había `<noscript>`. → **2.6**.
- **R24 · SEO del módulo.** `admin.html` no lleva `noindex` y ninguna de las dos páginas tiene `meta description`. → **2.12 / 2.13**.
- **R25 · Acciones destructivas nativas.** `alert()`/`confirm()` en `eliminarPlato` y `eliminarReserva`, sin deshacer. → **2.12**.
- **R26 · Acoplamiento al orden de scripts.** `admin.js` leía `#form-plato` en el nivel superior y solo funcionaba porque el `<script>` va al final del `<body>`. → **2.13**.
- **R27 · Ruido en `data.js`.** *(✅ en 2.3: comentarios eliminados; el alcance global de `PLATOS_INICIALES` se reevalúa en 2.13)* Comentarios `// <-- Actualizado a tu foto local` y `PLATOS_INICIALES` como global. → **2.3 / 2.13**.

### Prioridad sugerida para la fase

1. **2.2** unifica tokens, paletas y keyframes (R7, R8, R16).
2. **2.3** normaliza imágenes y rutas (R9, R27).
3. **2.4-2.10** atacan navbar móvil, hero, carta, formulario, chatbot y footer (R3, R14, R17, R18, R22, R23).
4. **2.11-2.12** reconstruyen el admin responsive, el login real y las acciones (R1, R4, R10-R12, R15, R19-R21, R24, R25).
5. **2.13-2.14** cierran `restaurante.css`, endurecen el JS y ejecutan el QA de flujo (R2, R5, R6, R13, R26).

---

## 📝 Registro de avance

| Fecha | Meta | Notas |
|-------|------|-------|
| 2026-11-18 | Planificación | Creado `metas.md`. Ningún archivo de código modificado. |
| 2026-11-18 | 1.1 Auditoría | Contrato HTML↔CSS↔JS documentado arriba (A1–A5). Sin cambios de código. |
| 2026-11-18 | 1.2 Tokens | Bloque `:root` añadido al inicio de `styles.css` (color RGB-canales, tipografía fluida, espaciado, radios, sombras, movimiento). Aditivo: sin cambio visual. |
| 2026-11-18 | 1.3 Tailwind | `tailwind.config` de `index.html` ahora lee los tokens (`rgb(var(--brand-X) / <alpha-value>)`). Escala `brand` 50–900 completa (cierra H1), añadido `warm`, fuentes vía `var(--font-*)`. Valores existentes idénticos; solo cambian las clases que antes se ignoraban (200/300/400/800). |
| 2026-11-18 | 1.4 Base CSS | `styles.css`: foco con tokens (se quitó `border-radius: 4px` que deformaba botones redondeados al enfocar), `scroll-padding` desde `--header-h`, `.ds-skip-link`, sección 1b con `.ds-container/.ds-section/.ds-btn(--primary/--secondary/--ghost/--lg)/.ds-badge/.ds-card`, y red de seguridad en `prefers-reduced-motion`. Reset omitido a propósito: el preflight de Tailwind ya lo cubre. Aún sin uso en el HTML. |
| 2026-11-18 | 1.5 Header | `index.html`: skip-link, altura desde `--header-h`, enlaces con `.nav-link` (subrayado animado), CTA “Ver Prototipos” → “Hablemos” (`mailto:`, era redundante con el enlace “Prototipos”) en desktop y móvil; anclas `#prototipos` eliminadas (H2). `styles.css`: estilos `.nav-link` / `.is-active`. `main.js`: enlace activo acotado al header con clase `is-active` + `aria-current` (sin `font-semibold`, evita saltos de ancho); el skip-link usa salto nativo. Pendiente para 1.6: rediseño visual del menú móvil. |
| 2026-11-18 | 1.6 Menú móvil | `index.html`: botón de 44×44 px, panel con padding en contenedor interno (antes quedaba ~2 rem de hueco visible al estar cerrado con movimiento reducido), enlaces `.mobile-link` (48 px de alto) y CTA `ds-btn--lg` a ancho completo. `styles.css`: `.mobile-link`, `#site-header.is-menu-open`, `max-height` del panel acotado a la pantalla con scroll interno. `main.js`: cierre con `Esc` (devuelve foco al botón) y al tocar fuera; el header no se oculta con el menú abierto (A4); cierre con `setTimeout` en lugar de `transitionend` (con `prefers-reduced-motion` el evento nunca se disparaba y el panel no recibía `hidden`). |
| 2026-11-19 | 1.7 Hero | `index.html`: sección con `hero-fullscreen` + `isolate`; contenedor `ds-container`; badge `ds-badge--outline`; título `ds-h1` (tamaño fluido por token); subtítulo `ds-lead`; CTAs `ds-btn--primary/--secondary --lg`; trust bar en `flex-wrap` centrado (antes en móvil quedaba alineada a la izquierda dentro de un bloque centrado). `styles.css`: añadidos `.ds-h1/.ds-h2/.ds-h3/.ds-lead` (reutilizables en 1.9+), `.hero-bg-glow`, `.hero-bg-grid`, `.hero-fullscreen` (alto de pantalla solo ≥ 768 px). **Corrección:** la sección no creaba contexto de apilamiento, así que el fondo decorativo (`-z-10`) y los resplandores del mock quedaban *detrás* del `bg-white` de la propia sección (invisibles); `isolate` los hace visibles. Pendiente de verificar en navegador a 360 px. |
| 2026-11-19 | 1.8 Mock del Hero | `index.html`: el mock ya no es `hidden lg:block`; ahora se ve en todos los tamaños (columna centrada `max-w-sm`/`sm:max-w-md` bajo el texto en móvil/tablet, `max-w-none` en ≥ lg). Rotaciones solo en `lg:`; la tarjeta flotante se ancla a `left-3` en móvil (antes `-left-6` quedaba recortada). Emojis 💡🔒📅 → SVG inline; etiquetas de 10 px → 11 px con mejor contraste; añadidos punto “LIVE” pulsante, caption “Auto · Eco” y barra de ocupación al 87 %. El conjunto es decorativo: `role="img"` + `aria-label`. `styles.css`: `.hero-float` (animación con la propiedad `translate`, sin pisar la rotación). Pendiente verificar en navegador. |
| 2026-11-19 | 1.9 Servicios | `index.html`: sección con `ds-section--alt` + `ds-container`; encabezado con `ds-badge`/`ds-h2`/`ds-lead`; tarjetas en `flex flex-col` (CTA alineado abajo con `self-start`), padding `p-6 sm:p-10`; listas con `.ds-checklist` (cada `<li>` pasó de 8 líneas de HTML a 1); CTAs `ds-btn--primary` / `ds-btn--sky`. `styles.css`: tokens `--sky-*`, `.ds-btn--sky`, `.ds-checklist(--sky)`, y regla `[data-reveal][data-tilt]` con transición explícita (A1: antes la transición de `[data-tilt]` pisaba la del reveal). `main.js`: el tilt incluye `translateY(-4px)` (el “lift” ya no depende de Tailwind). Incidente: un `edit` de `.ds-checklist` cayó primero dentro de `:root` (ancla duplicada); detectado y corregido en el mismo turno. |
| 2026-11-19 | 1.10 Prototipos | `index.html`: sección con `ds-section`/`ds-container`/`ds-badge--neutral`/`ds-h2`/`ds-lead`; las 3 tarjetas pasaron a un único componente `.proto-card` (+ `--sky`, `--terra`) con vista previa mini-UI en lugar del icono (calendario para Reservas, panel con toggles para Domótica, catálogo con carrito para Inkari Art); se quitaron `hover:-translate-y-1`, `transition-all` y los hex sueltos `#c85a3e/#7a2a1a` (A1 cerrado); enlaces con `aria-label` único (“Probar prototipo: …”); CTA final con `ds-btn--secondary`. `tailwind.config`: color `terra` (500/700/900). `styles.css`: tokens `--sky-800`, `--terra-*`; `.ds-badge--neutral`; sección 6b `.proto-card*` y `.pc-cell*`. El texto/enlace de Ecommerce usa `terra-700` (no el `#c85a3e` original) por contraste sobre blanco. Pendiente verificar en navegador. |
| 2026-11-19 | 1.11 Impacto | Revisión de contraste (WCAG AA) sobre fondo oscuro: números del timeline `text-white` sobre `brand-500`/`amber-500` (≈2.1–2.5:1) → `text-ink-900`; testimonio `brand-600→800` con texto blanco (≈3.8:1) → `brand-700→900`, y subtítulo `white/70` (≈3.5:1) → `brand-100`; etiquetas de métricas `text-xs` → `text-sm`; comilla decorativa recta `"` → tipográfica `“`. Componentes: `ds-container`, `ds-badge--dark`, `ds-h2/.ds-h3` + `ds-on-dark`, `ds-lead--on-dark`, CTA de cierre `ds-btn--light`. No se tocó el `<section id="impacto">` de apertura (no estaba en la porción leída) ni los contadores/CTA de talento, que ya cumplían. Pendiente verificar en navegador. |
| 2026-11-19 | 1.12 Footer | `index.html`: `ds-container`; grid `1 → 2 (sm) → 12 cols (lg: 4/2/2/4)` con marca y contacto a ancho completo en `sm`; columnas con `.footer-heading/.footer-list/.footer-link` (área de toque mayor); “Control con Ecommerce” → “E-commerce (Inkari Art)”; `#` vacíos: “Software a Medida” → `#servicios`, “Trabaja con nosotros” → `mailto:talento@…`; emojis 📍✉️📞❤️ → SVG; barra inferior `text-slate-500` (≈4:1) → `slate-400`; año con valor de respaldo `2026` si JS falla. **Pendiente del usuario:** bloque de redes (LinkedIn/Instagram) comentado con `TODO` porque solo tenía `href="#"`; hace falta las URLs reales. El teléfono `+51 999 999 999` parece un marcador de posición: confirmar el real. `styles.css`: sección 6c. |
| 2026-11-19 | 1.13 Micro-interacciones | **Volver arriba:** pasó de utilidades Tailwind a `.back-to-top` (CSS); ahora usa `visibility` (antes, oculto, seguía recibiendo foco con Tab), respeta `safe-area-inset`, `:active` y hover solo con puntero real. **Tilt:** `MAX_TILT` 6° → 4°; se quitó `preserve-3d` (texto borroso durante el tilt) y la clase huérfana `.tilt-inner` (A2); mientras hay hover el transform responde en 0.12 s (con 0.5 s “flotaba” detrás del cursor) y al salir vuelve a 0.5 s; no se inclina una tarjeta aún no revelada. **Spotlight:** color por tarjeta vía `--spot` (módulos Domótica/Ecommerce y la tarjeta cielo ya no brillan en verde). **Reveal:** desplazamiento 24 → 16 px, `will-change` liberado tras revelar, y `<noscript>` para que el contenido no quede invisible sin JS. **Botones:** `:active` (escala .98) y lift solo con `(hover: hover)`. |
| 2026-11-19 | 1.14 Limpieza CSS | `styles.css`: índice del encabezado actualizado (añadidas 6b/6c, quitado “FINAL”); 5 curvas `cubic-bezier(0.22, 1, 0.36, 1)` literales → `var(--ease-out)`; separación en blanco antes de la sección 6; en `prefers-reduced-motion` se eliminó el bloque de `transition: none` que duplicaba la regla global. Los componentes aún sin uso (`.ds-card`, `.ds-card--interactive`, `.ds-btn--ghost`, `.ds-section--dark`) **no se eliminaron**: forman parte del sistema para las Fases 2-4 y se marcaron como “reservado”. `index.html`: `<section id="impacto">` pasó de `py-20 sm:py-28` a `ds-section` (mismo espaciado: 5 → 7 rem; pendiente de 1.11). |
| 2026-11-19 | 1.15 main.js | Revisado completo contra el HTML nuevo: IDs, `data-*` y clases del contrato siguen existiendo; sin referencias rotas. Ajustes mínimos: (1) si un enlace del header recibe foco con Tab estando oculto, el header reaparece, y no se oculta mientras haya foco de teclado dentro (`:focus-visible`; el foco por clic de ratón no lo bloquea); (2) contadores: el HTML trae ahora el valor final (`25+`, `18`, `100%`, `12+`) y el JS lo reinicia a 0 solo si va a animarlo → sin JS ya no se ven ceros; (3) “Volver arriba” mueve el foco al logo al subir (antes el foco se perdía al ocultarse el botón); (4) cabecera del archivo sin “FINAL” ni texto obsoleto. Observado y **no** cambiado: el enlace activo no marca “Contacto” al llegar al final de la página (el footer queda fuera de la banda de observación); sin impacto funcional. |
| 2026-11-19 | 1.16 SEO | `index.html` `<head>`: `theme-color` (#059669), Open Graph (`type`, `site_name`, `locale es_PE`, `title`, `description`), `twitter:card=summary`, y JSON-LD `Organization` (nombre, descripción, email, Cusco/PE, `knowsAbout`). `title` y `description` ya existían y se mantienen (62 y ~125 caracteres). **Pendiente del usuario (bloque `TODO` en el `<head>`):** dominio real para `canonical` y `og:url`; imagen 1200×630 para `og:image` (y pasar a `summary_large_image`); PNG 180×180 para `apple-touch-icon` (iOS no admite SVG ahí; hoy apunta al SVG). Se omitieron a propósito `url`, `logo` y `telephone` del JSON-LD para no inventar datos. |
| 2026-11-19 | 1.17 README | `README.md` reescrito completo (antes quedaba truncado en “Estructura”): propósito, rutas reales de los 4 sitios, árbol de archivos, tabla de módulos con su identidad, stack, sistema de diseño (tokens y componentes `ds-`), cómo ejecutar, claves de `localStorage` y estado del roadmap. Corrige H4: ya no menciona `productos/reservas.html` ni `productos/domotica.html` e incluye ecommerce. Hecho por DeepSeek. **Revisión (Claude):** contrastado contra el código (tokens de `:root`, componentes `ds-`, fuentes, correo, claves `inkari_carrito`/`rinconcito_*`, funcionalidad de cada módulo): correcto. Corregido: (1) el árbol listaba `jpe, png` en `reservas/img/`, que ya no existen; (2) se afirmaba que los `tailwind.config` de *cada* página están alineados con los tokens (solo el hub; Ecommerce y Domótica son Fases 3-4); (3) “fuente única de verdad” sobredimensionaba `styles.css`, que son los tokens del hub. **Pendiente de sincronizar al cerrar la Fase 2:** `admin.css` en el árbol y la sección “Estado del proyecto” (hoy dice que las Fases 2-4 están “planificadas”). (Revisado y aprobado) |
| 2026-11-19 | 1.18 QA Fase 1 | QA real con Chrome headless + axe-core (WCAG 2 A/AA) a 360 / 768 / 1280 px: **0 violaciones**, sin scroll horizontal, sin anclas rotas ni IDs duplicados, los 9 enlaces locales responden y consola sin errores (solo el aviso esperado de Tailwind por CDN). Teclado: el skip-link enfoca `main`, el menú móvil abre/cierra con Espacio/Esc y devuelve el foco al botón, el header se oculta al bajar y “Volver arriba” devuelve el foco al logo. Correcciones aplicadas: botones primarios a `brand-700` (5.48:1) con hover `brand-800`; `ds-btn--sky` a `sky-700` (5.93:1); logo del header a `brand-700`; gradientes de texto sobre blanco oscurecidos (`brand-700 → sky-600`); “Rama 02” a `sky-700`; “Carrito 2” a `terra-700`; `main` con `tabindex="-1"` y sin outline; `.proto-card__link` con 44 px de alto. **Observación:** los enlaces del footer miden 29 px de alto (cumplen el mínimo AA 2.2 de 24 px, no los 44 px recomendados). H4 marcado como resuelto. Hecho por DeepSeek. **Revisión (Claude):** las 8 correcciones están presentes en `index.html` / `styles.css` y no hay código fuera de alcance; contraste de `ds-badge` recalculado (≈ 4.8:1, AA). Las mediciones de runtime (axe, tamaños en px, consola) **no se pudieron reproducir en esta sesión** (sin navegador): se aceptan según el informe del junior; conviene una pasada visual rápida del usuario a 360 px. (Revisado y aprobado) |
| 2026-11-19 | 2.1 Auditoría | Auditoría del módulo Reservas sin tocar código: se leyó `index.html`, `admin.html`, `restaurante.css`, `app.js`, `admin.js` y `data.js`, y se validó el contrato HTML↔JS (**0 IDs faltantes, 0 duplicados, 0 anclas rotas**; las 11 funciones invocadas por `onclick` existían). Documentado en “Notas de auditoría — Meta 2.1”: inventario, contrato de IDs por página, funciones globales, claves `rinconcito_*` y 27 riesgos (R1-R27) con meta objetivo. Hecho por DeepSeek. **Revisión (Claude):** meta solo documental; el contrato de `admin.html`↔`admin.js` y de `index.html`↔`app.js` se verificó contra el código vigente (coincide). Las notas se trasladaron **sin las marcas de estado de metas aún no revisadas** (cada meta añade su marca R·· al cerrarse). Se descartó la frase de la nota original sobre la delegación de eventos “tras 2.11”: se reincorpora al aprobar 2.11. (Revisado y aprobado) |
| 2026-11-19 | 2.2 Tokens | `restaurante.css` pasó de 0 B a la capa de tokens del módulo, con la misma estructura de la Fase 1: 20 colores en canales RGB (`adobe`, `maiz`, `huerto`, `cal`, `ink`), tipografía (Inter/Playfair/Lora), escala de espaciado, radios, sombras, movimiento, `:focus-visible`, `::selection`, `@keyframes` (`fadeIn`, `scaleIn`, `hero-fade-up`) y `prefers-reduced-motion`. `index.html` y `admin.html` comparten ahora la misma paleta en `tailwind.config` mediante `rgb(var(--token) / <alpha-value>)`; `admin.html` enlaza `restaurante.css` y carga Playfair Display. Cierra R7 (`hover:bg-ink-800`, `hover:bg-adobe-50` y `font-display` ya resuelven) y R8; R2 queda parcial hasta la limpieza de 2.13. Verificado en Chrome: colores computados correctos, `bg-adobe-500/10` → `rgba(176,62,41,.1)`, hover del chat a `ink-800`, `animationName: fadeIn` en el panel y 0 errores de consola. Hecho por DeepSeek. **Revisión (Claude):** tokens, `tailwind.config` idénticos en ambas páginas y enlace de hojas verificados contra el código; en alcance y sin código sobrante. Nota para 2.13: tras 2.11 el keyframe `scaleIn` quedó sin uso (el admin usa `adminScaleIn` en `admin.css`). (Revisado y aprobado) |
| 2026-11-19 | 2.3 Assets | Se descargaron las 4 imágenes de Unsplash a `img/` (`nosotros-cocina.jpg` 270 KB, `espacio-salon.jpg` 119 KB, `espacio-terraza.jpg` 87 KB, `espacio-patio.jpg` 126 KB) y el hero pasó a ruta relativa `img/cusco-view.jpg` (optimizado de 403 → 246 KB). Se renombraron `caldo.jpe` y `chicha-moradita.jpe` a `.jpg` y se convirtió `lomo.png` (1536×1024, 812 KB) a `lomo.jpg` (1200×800, 175 KB), eliminando el PNG. Las imágenes del HTML declaran `width`/`height`; las no críticas usan `loading="lazy" decoding="async"` y el hero `fetchpriority="high"`. `data.js` actualiza rutas y añade `normalizarRutasPlatos` (migra `.jpe` → `.jpg` y `img/lomo.png` → `img/lomo.jpg`); `admin.html` carga `data.js` antes de `admin.js`. Cierra R9 y R27; R11 queda parcial. Verificado en Chrome: 9 imágenes con `naturalWidth > 0`, migración correcta y admin con 4 filas e imágenes OK, 0 errores de consola. Hecho por DeepSeek. **Revisión (Claude):** pesos y formatos contrastados en disco (9 archivos, sin `.jpe`/`.png`; 1.16 MB en total) y sin imágenes externas ni rutas absolutas en `index.html`, `admin.html` ni `data.js`. Matiz: las tarjetas de platos inyectadas por JS no llevan `width/height` (el contenedor `aspect-ratio: 4/3` evita el salto de layout). Cierra también **H6**. (Revisado y aprobado) |
| 2026-11-19 | 2.4 Navbar | `index.html`: header de `absolute` a `fixed` con `id="site-header"`; fondo transparente sobre el hero y oscuro (`ink-900/94` + `backdrop-blur` + sombra) al pasar 24 px. Menú móvil completo (`#menu-toggle` / `#mobile-menu`) con enlaces a Carta, Espacios, Nosotros, “Reservar Mesa” y “Acceso Staff”, iconos abrir/cerrar, `aria-expanded`, `aria-controls`, cierre con `Esc` (devuelve el foco), clic fuera, al pulsar un enlace y al pasar a desktop; botones y enlaces de 44 px. El acceso staff ya es visible en móvil. `restaurante.css`: estados `is-scrolled`/`is-menu-open`, `.rn-nav-link` con subrayado maíz, `.rn-mobile-link`, transición del panel y `scroll-padding-top` para las anclas. `app.js`: nueva `configurarNavegacion()` y `html { scroll-behavior: smooth }`. R18 queda parcial (año del footer en 2.10). Verificado en Chrome a 360/1280 px: fondo `rgba(43,31,26,.94)` tras scroll, menú abre/cierra correctamente, ancla `#platos` a 112 px del borde, sin overflow horizontal y 0 errores de consola. Hecho por DeepSeek. **Revisión (Claude):** comportamiento, atributos ARIA, tamaños táctiles y estilos verificados en el código; en alcance, sin código sobrante. Al ser el header oscuro tras el scroll, el logo maíz mantiene contraste suficiente (≈ 6.6:1 sobre `ink-900`). H5 queda parcial (solo `reservas`). (Revisado y aprobado) |
| 2026-11-19 | 2.5 Hero | `index.html`: la sección ahora es `isolate` (el fondo `-z-10` por fin queda detrás del contenido y delante del `bg-ink-900`), con `id="hero"`, `pt-28` para el header fijo y `aria-labelledby`. La imagen pasa a contenedor decorativo (`alt=""`, `aria-hidden`) con `object-position: 50% 40%` y filtro cálido. Overlay nuevo en CSS (`.rn-hero-media::after`): radial + degradado vertical que oscurece la franja del header, refuerza el centro del texto y funde la base con la sección siguiente. Tipografía fluida con `.rn-hero-title` (`clamp(2.6rem, 7.2vw, 6rem)`, `text-wrap: balance`), badge con tokens (`ink-900/55`, `maiz-500`), párrafo `cal-100` y CTAs unificados con iconos, altura mínima de 52 px y ancho completo en móvil. Entrada escalonada con `.rn-hero-enter` y `hero-fade-up`; `prefers-reduced-motion` también anula `animation-delay`. R9 queda cerrado y R16 parcial (header/hero con contraste suficiente; admin en 2.11). Verificado en Chrome a 360/1024/1280 px: imagen visible (`naturalWidth 1180`), título de 41.6/73.7/92.2 px, CTAs de 56–58 px, sin solapamiento con el header, sin overflow horizontal y 0 errores de consola. Hecho por DeepSeek. **Revisión (Claude):** estructura, scrim, tipografía y CTAs verificados en el código; en alcance. Corregido un comentario de CSS desactualizado por la renumeración de secciones (“keyframes en la sección 4” → “9”). (Revisado y aprobado) |
| 2026-11-19 | 2.6 Carta | `app.js`: `renderizarPlatos()` genera ahora `<article class="rn-dish-card">` con imagen en contenedor `aspect-ratio: 4/3`, chip de categoría, nombre, precio, descripción y CTA con icono; entrada escalonada (`fadeIn` con retardo de 70 ms) y estado vacío reutilizable. Se añadió `escaparHTML()` para `nombre`, `descripcion`, `categoria` e `imagen`, y `Number(precio).toFixed(2)` para evitar errores de tipo. `restaurante.css`: nueva sección 4 con `.rn-dish-card` (hover/focus-within eleva la tarjeta), `.rn-dish-media`, `.rn-dish-chip`, `.rn-dish-body`, `.rn-dish-name`, `.rn-dish-price`, `.rn-dish-desc`, `.rn-dish-cta` (44 px) y `.rn-dish-empty`. `index.html`: encabezado con badge “Cocina de leña”, `id="carta-title"`/`aria-labelledby` y `<noscript>` dentro de `#grid-platos`. Cierra R23 y deja R13 parcial (admin en 2.13). Verificado en Chrome: 4 tarjetas con imágenes OK y proporción 4:3, 3 columnas en desktop y 1 en móvil, hover `translateY(-4px)` + zoom de imagen, foco en el botón eleva la tarjeta, estado vacío y fallback sin JS funcionando, HTML malicioso renderizado como texto y 0 errores de consola. Hecho por DeepSeek. **Revisión (Claude):** `renderizarPlatos()`, escape de campos, `Number()` y CSS verificados en el código; en alcance. **Observación para el usuario (no modificada):** el botón “Añadir a la reserva” de cada tarjeta no tiene acción asociada; conectarlo (o convertirlo en enlace a `#reservas`) es una decisión de producto fuera del alcance visual de esta meta. `renderizarPlatos()` sigue leyendo `localStorage` sin `try/catch` (R5, ya planificado en 2.13). (Revisado y aprobado) |
| 2026-11-19 | 2.7 Nosotros y Espacios | `index.html`: `#nosotros` con `aria-labelledby`, `.rn-story-media` (marco maíz desplazado, imagen 4:3 con `shadow-lg` y badge flotante “100% Artesanal”), eyebrow “Cocina con raíces”, lista de 3 features con check y CTA “Conoce nuestra carta” → `#platos`. `#espacios` con `aria-labelledby`, eyebrow “Ambientes” y las 3 tarjetas convertidas en enlaces completos `<a class="rn-space-card" href="#reservas">` con índice 01/02/03, imagen 4:3, título, descripción y CTA con flecha. `restaurante.css`: nueva sección 5 (`.rn-story-*` y `.rn-space-*`) con hover `translateY(-4px)`, zoom de imagen, flecha desplazada y `focus-visible` con outline + elevación. Verificado en Chrome a 1280/360 px: imágenes OK (`naturalWidth 800`), proporción 4:3, hover y foco correctos, sin overflow horizontal y 0 errores de consola. Hecho por DeepSeek. **Revisión (Claude):** composición, enlaces y estilos verificados en el código; los 3 puntos de la lista derivan del texto ya existente (mercados locales, fuego lento, recetas de las abuelas), sin afirmaciones nuevas. En alcance, sin código sobrante. (Revisado y aprobado) |
| 2026-11-19 | 2.8 Formulario | `index.html`: `#reservas` con `aria-labelledby`, tarjeta `.rn-reserve-card` (aside oscuro + panel claro), `<label for>` en todos los campos, `aria-describedby` hacia su error, `autocomplete`, `inputmode`, fecha con `min` y hora con `min="12:00"`/`max="22:30"`, `<form novalidate>` y estado `role="status" aria-live="polite"`. `app.js`: `configurarFormularioReserva()` valida en `blur`/`input` tras el primer intento y en el envío (nombre ≥ 3, teléfono ≥ 6 dígitos, fecha no pasada, hora dentro del horario); pinta `aria-invalid`, `.is-invalid` y mensaje por campo, resume los errores y enfoca el primero. `mostrarMensajeExito()` ya no destruye el formulario: lo oculta, muestra `.rn-reserve-success` con resumen `<dl>` escapado con `escaparHTML` y “Hacer otra reserva” restaura el formulario con `reset()` y devuelve el foco. `fechaLocalISO()` corrige el mínimo en horario local (R17). `restaurante.css`: nueva sección 6 con `.rn-reserve-*`, `.rn-form*`, `.rn-input` (48 px, foco visible), `.rn-field-error`, `.rn-form-status` y éxito; dos columnas desde 1024 px para no comprimir el aside a 768 px. Verificado en Chrome a 360/768/1280 px: envío vacío marca 4 campos y no guarda, fecha pasada y hora 23:45 rechazadas, envío válido guarda en `rinconcito_reservas` y muestra el resumen, “Hacer otra reserva” limpia el formulario, HTML en el nombre se muestra como texto, `min` coincide con la fecha local en `America/Lima`, sin overflow horizontal y 0 errores de consola. Hecho por DeepSeek. **Revisión (Claude):** validaciones, ARIA, flujo de éxito/reinicio y estilos verificados en el código; en alcance. Sigue pendiente (2.13) el `JSON.parse` sin `try/catch` de `rinconcito_reservas` al enviar (R5). (Revisado y aprobado) |
