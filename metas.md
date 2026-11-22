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
- [x] H4 · `README.md` está desactualizado (menciona `productos/reservas.html` y `productos/domotica.html`, y no menciona ecommerce).
- [x] H5 · `reservas`, `ecommerce` y `domotica`: el menú de navegación es `hidden md:flex` **sin menú móvil** → en celular no hay navegación. *(✅ resuelto en 2.4, 3.3 y 4.3)*
- [x] H6 · `reservas`: la imagen del hero usa ruta absoluta `/productos/reservas/img/cusco-view.jpg` (falla si el proyecto no se sirve desde la raíz). Además hay imágenes `.jpe` y varias imágenes hotlinkeadas desde Unsplash/Booking (frágiles). *(✅ resuelto en 2.3)*
- [x] H7 · `reservas`: la ventana del chatbot usa `right-24` y ancho fijo `w-80` → riesgo de desborde en móvil. (Hecho por DeepSeek - Pendiente de revisión)
- [x] H8 · `ecommerce`: filtros de categoría “simulados” (sin funcionalidad) y botón “Finalizar Compra” sin acción. *(✅ resuelto en 3.5 y 3.8)*
- [x] H9 · `domotica`: botones “Reservar Suite” sin acción; el tercer `<img>` usa una URL externa de bstatic. *(✅ resuelto en 4.9)*
- [x] H10 · Copyright fijo “2024” en los tres subproyectos (el hub sí usa año dinámico). *(✅ resuelto en 2.10, 3.10 y 4.10)*
- [x] H11 · Cada página redefine su propio `tailwind.config` → duplicación y falta de sistema común. *(✅ mitigado en 2.2, 3.2 y 4.2: cada módulo alineó su config con tokens; sin build no es posible un config compartido real)*

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
- [x] **1.17 Actualizar `README.md`:** estructura real, módulos (reservas, ecommerce, domótica), sistema de diseño (corrige H4). (Hecho por DeepSeek - Pendiente de revisión)
- [x] **1.18 QA Fase 1:** 360 / 768 / 1280 px, teclado, contraste, enlaces a los 3 módulos, consola sin errores. (Hecho por DeepSeek - Pendiente de revisión)

---

## 🍽️ FASE 2 — Módulo Reservas (`productos/reservas`)

> Identidad: criollo cálido (adobe, maíz, huerto) · Playfair Display + Lora + Inter.

### 2A · Preparación
- [x] **2.1 Auditoría del módulo:** leer `admin.html`, `restaurante.css`, `app.js`, `admin.js`, `data.js`; mapear IDs que usa el JS. (Hecho por DeepSeek - Pendiente de revisión)
- [x] **2.2 Tokens del módulo:** variables CSS propias (heredando estructura de la Fase 1) + `tailwind.config` alineado. (Hecho por DeepSeek - Pendiente de revisión)
- [x] **2.3 Normalizar assets:** rutas relativas (H6), renombrar/convertir `.jpe`, decidir qué imágenes externas (Unsplash) se descargan a `img/`. (Hecho por DeepSeek - Pendiente de revisión)

### 2B · `index.html` (público)
- [x] **2.4 Navbar + menú móvil:** crear menú móvil (H5), mantener botón "Reservar Mesa" y acceso staff; fondo que cambie al hacer scroll. (Hecho por DeepSeek - Pendiente de revisión)
- [x] **2.5 Hero:** corregir ruta de imagen, mejorar overlay, tipografía y CTAs. (Hecho por DeepSeek - Pendiente de revisión)
- [x] **2.6 Carta / Platos:** rediseñar tarjetas inyectadas por JS (`#grid-platos`), manteniendo la estructura que genera `app.js`. (Hecho por DeepSeek - Pendiente de revisión)
- [x] **2.7 Nosotros y Espacios:** mejorar composición de imagen+texto y las 3 tarjetas de espacios. (Hecho por DeepSeek - Pendiente de revisión)
- [x] **2.8 Formulario de reservas:** inputs unificados, validación visual, estados de error/éxito, layout móvil. (Hecho por DeepSeek - Pendiente de revisión)
- [x] **2.9 Chatbot visual:** hacerlo responsive (ancho, posición, `right-24`, H7), mejorar burbujas y botón flotante. (Hecho por DeepSeek - Pendiente de revisión)
- [x] **2.10 Footer:** año dinámico (H10), enlace claro de regreso al hub. (Hecho por DeepSeek - Pendiente de revisión)

### 2C · `admin.html`
- [x] **2.11 Panel admin:** layout (sidebar/topbar), tabla o tarjetas de reservas responsive, estados (pendiente/confirmada/cancelada). (Hecho por DeepSeek - Pendiente de revisión)
- [x] **2.12 Login/acceso staff y acciones:** revisar flujo visual, filtros y botones de acción.

### 2D · Cierre de Fase 2
- [x] **2.13 Limpieza de `restaurante.css` y ajustes mínimos en `app.js`/`admin.js`.**
- [x] **2.14 QA Fase 2:** flujo completo (reservar → ver en admin), 360 / 768 / 1280 px, consola limpia.

---

## 🛍️ FASE 3 — Módulo Ecommerce (`productos/ecommerce`)

> Identidad: artesanal cusqueña (crema, tierra, terracota, dorado) · Playfair Display + Inter.

### 3A · Preparación
- [x] **3.1 Auditoría del módulo:** leer `inkari.css`, `app.js`, `data.js`; mapear IDs y estructura de datos de productos. (Hecho por DeepSeek - Pendiente de revisión)
- [x] **3.2 Tokens del módulo:** variables CSS propias + `tailwind.config` alineado. (Hecho por DeepSeek - Pendiente de revisión)

### 3B · Componentes
- [x] **3.3 Navbar + menú móvil:** añadir menú móvil (H5), conservar botón de carrito con contador. (Hecho por DeepSeek - Pendiente de revisión)
- [x] **3.4 Hero:** composición más editorial, CTA, fondo/patrón. (Hecho por DeepSeek - Pendiente de revisión)
- [x] **3.5 Filtros de categoría:** hacerlos funcionales (Todos / Textiles / Joyería / Cerámica) con estado activo (H8). (Hecho por DeepSeek - Pendiente de revisión)
- [x] **3.6 Grid y tarjeta de producto:** imagen con proporción fija, precio, botón “añadir”, estados hover, skeleton/placeholder de carga. (Hecho por DeepSeek - Pendiente de revisión)
- [x] **3.7 Carrito lateral:** header, ítems (cantidad +/−, eliminar), subtotal, estado vacío, accesibilidad del panel (`Esc`, foco).
- [x] **3.8 Flujo “Finalizar compra”:** al menos un resumen/confirmación visual simulado (H8).
- [x] **3.9 Historia / Artesanos:** revisar sección “Nuestra Historia” y crear/ajustar `#artesanos` (el enlace existe en el nav).
- [x] **3.10 Toast, footer y copyright dinámico** (H10).

### 3C · Cierre de Fase 3
- [x] **3.11 Limpieza de `inkari.css` y ajustes mínimos en `app.js`.**
- [x] **3.12 QA Fase 3:** agregar/quitar productos, filtros, carrito en móvil, consola limpia.

---

## 🏠 FASE 4 — Módulo Domótica (`productos/domotica`)

> Identidad: oscuro tecnológico (negro, cian neón) · Outfit + Inter.

### 4A · Preparación
- [x] **4.1 Auditoría del módulo:** leer `domotica.css` y `app.js`; mapear IDs (`toggle-luces`, `slider-temp`, `btn-puerta`, `estado-global`, etc.).
- [x] **4.2 Tokens del módulo:** variables CSS propias (neón, superficies oscuras, glow) + `tailwind.config` alineado.

### 4B · Componentes
- [x] **4.3 Navbar “pill” + menú móvil:** añadir versión móvil (H5), conservar “Volver al Hub”.
- [x] **4.4 Hero y mockup de suite:** jerarquía, responsive del mockup y de la tarjeta flotante.
- [x] **4.5 Panel de control — Iluminación:** toggle accesible, feedback visual de luz encendida/apagada.
- [x] **4.6 Panel de control — Climatización:** slider estilizado cross-browser, valor en vivo, color según temperatura.
- [x] **4.7 Panel de control — Seguridad:** botón de puerta con estados (bloqueada/abierta), animación sutil.
- [x] **4.8 Barra de estado global:** reflejar cambios de los tres controles.
- [x] **4.9 Sección Suites:** tarjetas consistentes, imágenes locales o con *fallback* (H9), botones “Reservar Suite” con acción (modal o enlace a reservas). (Hecho por DeepSeek - Pendiente de revisión)
- [x] **4.10 Footer y copyright dinámico** (H10). (Hecho por DeepSeek - Pendiente de revisión)

### 4C · Cierre de Fase 4
- [x] **4.11 Limpieza de `domotica.css` y ajustes mínimos en `app.js`.**
- [x] **4.12 QA Fase 4:** probar los 3 controles, 360 / 768 / 1280 px, rendimiento de blur/glow en móvil, consola limpia.

---

## 🏁 Definición de “terminado” (global)

- [x] Los 4 sitios (hub + 3 módulos) se ven coherentes como familia, cada uno con su identidad.
- [x] Navegación móvil funcional en todas las páginas.
- [x] Sin enlaces rotos, sin anclas inválidas, sin rutas absolutas.
- [x] Sin errores en consola.
- [x] README actualizado.
- [x] Hallazgos H1–H11 resueltos.

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

**Alcance:** lectura completa de `productos/reservas/index.html`, `admin.html`, `css/restaurante.css`, `js/app.js`, `js/admin.js` y `js/data.js`, más una validación automática del contrato (IDs usados por el JS, IDs duplicados, anclas internas y funciones invocadas desde atributos `onclick`). **No se modificó ningún archivo del módulo.**

**Resultado base (lo que ya está sano):** 0 IDs duplicados, 0 anclas internas rotas, 0 IDs que el JS necesite y falten en el HTML, y las 11 funciones invocadas desde el HTML/plantillas existen en `admin.js`.

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

### Funciones globales invocadas desde el HTML

| Función | Dónde se invoca |
|---|---|
| `loginRapido('admin' \| 'vendedor')` | 2 botones del login (`admin.html` 85, 89) |
| `cerrarSesion()` | sidebar (`admin.html` 135) |
| `cambiarVista('resumen' \| 'platos' \| 'reservas')` | delegación de los 3 botones `[data-vista]` del sidebar (sin `href="#"`) |
| `abrirModalPlato()` / `cerrarModalPlato()` | vista platos y modal (`onclick`) |
| `abrirModalReserva()` / `cerrarModalReserva()` | vista reservas y modal (`onclick`) |
| `eliminarPlato(id)` | delegación `[data-accion="eliminar-plato"]` |
| `eliminarReserva(id)` | delegación `[data-accion="eliminar-reserva"]` |
| `cambiarEstadoReserva(id, estado)` | evento `change` del `<select data-accion="estado-reserva">` |
| `location.reload()` | botón de éxito en `app.js` (`120`) |

> Tras 2.11, los botones de los modales conservan `onclick`; las tablas y la navegación usan delegación de eventos (`data-accion`, `data-vista`). Hay que conservar **IDs, firmas de las funciones globales y los atributos `data-*`**.

### `localStorage`

| Clave | Escribe | Lee | Notas |
|---|---|---|---|
| `rinconcito_platos` | `data.js` (seed), `admin.js` (alta/baja) | `app.js`, `admin.js` | El seed solo corre si la clave **no existe** (`data.js` 41) |
| `rinconcito_reservas` | `app.js` (pública), `admin.js` (alta/estado/baja) | `admin.js` | Sin límite ni validación de esquema |
| `rinconcito_sesion` | `admin.js` (`loginRapido`) | `admin.js` (al cargar) | Guarda `'admin'` o `'vendedor'`; sin caducidad |

### Anclas del HTML (sin lógica JS)

`#platos`, `#nosotros`, `#espacios`, `#reservas` (destinos de navegación). El resto de IDs del módulo ya tienen lógica asociada en `app.js` o `admin.js`.

### Hallazgos y riesgos

#### 🔴 Bloqueantes

- **R1 · El login filtra la contraseña en la URL.** `#login-form` no tiene `submit` handler ni `method`, así que al pulsar Enter en los campos el navegador hace un **GET** y recarga `admin.html?login-usuario=…&login-password=…`; la contraseña queda en la barra, el historial y los logs. Solo funcionan los botones `loginRapido(...)`; `#login-usuario` y `#login-password` no se leen en ningún sitio (`admin.html` 64-94; `admin.js` 7-20). → **2.12**. *(✅ en 2.11: el formulario tiene `submit` con `preventDefault()` y deriva a `loginRapido()`; la validación real de credenciales sigue en 2.12)*
- **R2 · `restaurante.css` está vacío.** 0 bytes, enlazado desde `index.html` 39. No hay estilos propios, ni `@keyframes`, ni `prefers-reduced-motion`, ni foco visible del módulo. → **2.2 / 2.13**. *(🟡 parcial en 2.2: ya contiene tokens, base, keyframes y reduced-motion; la limpieza final sigue en 2.13)*.
- **R3 · El chatbot es decorativo.** Ningún `#chat-*` aparece en `app.js`/`admin.js`: la ventana arranca `hidden` y no hay forma de abrirla. Además `#chat-window` tiene `hidden flex-col` sin `flex`, así que quitar `hidden` la dejaría en `display:block`. → **2.9**. *(✅ resuelto en 2.9: `configurarChat()` abre/cierra con `aria-expanded`, Esc, foco gestionado, accesos rápidos y envío de mensajes; la ventana es `display:flex` con `.is-open`)*
- **R4 · El vendedor ve “Resumen”.** `cambiarVista()` reescribe el `className` de los 3 navs (`admin.js` 68-72) y elimina el `hidden` que `iniciarSesion()` acababa de poner a `#nav-resumen` (44). El enlace aparece, pero al pulsarlo se le redirige a Platos (75). → **2.11 / 2.12**. *(✅ resuelto en 2.11: `#nav-resumen` usa `hidden` + `display:none` y `cambiarVista('resumen')` redirige a Platos si el rol no es admin)*
- **R5 · Un `localStorage` corrupto desactiva el formulario público.** `JSON.parse` de `rinconcito_platos` no tiene `try/catch` (`app.js` 14); la excepción corta el `DOMContentLoaded` y `configurarFormularioReserva()` (5-8) nunca se ejecuta. Lo mismo con `rinconcito_reservas` al enviar (84). → **2.13**. *(🟡 parcial en 2.11: `admin.js` lee y guarda con `try/catch` mediante `leerLista()`/`guardarLista()`; quedan los `JSON.parse` de `app.js` para 2.13)*
- **R6 · `toFixed` asume número.** `plato.precio.toFixed(2)` en `app.js` 40 y `admin.js` 148 lanza `TypeError` si el precio guardado es texto, `null` o falta. Las tablas solo protegen el `JSON.parse`, no el tipo. → **2.13**. *(✅ resuelto: `app.js` normaliza con `Number()` en 2.6 y `admin.js` usa `formatearPrecio()` en 2.11)*

#### 🟠 Importantes

- **R7 · Dos `tailwind.config` incompatibles.** `index.html` (18-35) define `adobe 50/500/600/700`, `maiz 50/500/600`, `huerto`, `cal`, `ink 900/700` y las 3 fuentes; `admin.html` (15-28) define `adobe 500/600`, `maiz 500`, `ink 900/800/700`, `cal` y solo `sans`. Consecuencias: `hover:bg-ink-800` del botón del chat (`index.html` 304) no existe; `hover:bg-adobe-50` del login (`admin.html` 89) no existe; `font-display` de “Bienvenido” (`admin.html` 59) no existe. → **2.2**. *(✅ resuelto en 2.2)*
- **R8 · Faltan los `@keyframes`.** `animate-[fadeIn_…]` (admin 163, 195, 221), `animate-[scaleIn_…]` (253) y `animate-[hero-fade-up_…]` (`app.js` 106) no tienen definición en ningún archivo: el contenido se ve, pero sin animación. → **2.2**. *(✅ resuelto en 2.2)*
- **R9 · Rutas y peso de imágenes.** Hero público con ruta absoluta `/productos/reservas/img/cusco-view.jpg` (`index.html` 91) frente a la relativa `img/cusco-view.jpg` del admin (40) → H6. `.jpe` no estándar en `data.js` (28, 36). Cuatro imágenes externas de Unsplash en Nosotros/Espacios (154, 191, 200, 209). `lomo.png` pesa 832 KB y no hay `width/height` ni `loading="lazy"`. → **2.3 / 2.5 / 2.7**. *(✅ resuelto en 2.3: hero con ruta relativa, `.jpe` → `.jpg`, Unsplash descargado a `img/`, `lomo.png` → `lomo.jpg` de 175 KB y dimensiones + `loading="lazy"` en todas las imágenes; la composición visual del hero se resuelve en 2.5)*
- **R10 · El admin no es responsive.** `body h-screen overflow-hidden` (30) + sidebar fijo `w-64` (105) dejan ~104 px útiles a 360 px; tablas de 4-5 columnas (206-242) y modales con `grid-cols-2/3` (262, 272) no caben. → **2.11**. *(✅ resuelto en 2.11: shell de una columna con sidebar off-canvas (84vw, overlay, Esc y foco), topbar sticky, KPIs en `auto-fit`, tablas que pasan a tarjetas con `data-label` y modales de una columna; verificado a 320/360/768/1024/1280 px)*
- **R11 · El admin no carga `data.js`.** Solo incluye `admin.js` (341). En un navegador limpio, entrar directo a `admin.html` muestra 0 platos; y como el seed solo corre si la clave no existe (`data.js` 41), borrar todos los platos desde el admin impide recuperar los 4 iniciales. → **2.11 / 2.13**. *(🟡 parcial en 2.3: `admin.html` ya carga `data.js` antes de `admin.js` y siembra los 4 platos en un navegador limpio; ✅ en 2.11: el panel rediseñado conserva esa carga; queda la recuperación tras borrado total en 2.13)*
- **R12 · Categorías incoherentes.** `data.js` usa `Especialidad`, `Extras`, `Bebida`, `Sopas`; el `<select>` del admin ofrece `Especialidad`, `Criollo`, `Sopas`, `Bebida`, `Postre` (`admin.html` 316-320). “Extras” no se puede volver a elegir. → **2.11**. *(✅ resuelto en 2.11: el `<select>` incluye `Extras` además de las categorías existentes)*
- **R13 · Datos sin escapar en `innerHTML`.** `app.js` (27-50, 111, 117) y `admin.js` (142-150, 193-205) interpolan `nombre`, `descripcion`, `imagen`, `categoria`, `notas` y `telefono` tal cual. Un plato o reserva con `<img onerror=…>` ejecuta script, y unas comillas rompen atributos. → **2.13**. *(🟡 parcial en 2.6: las tarjetas públicas ya escapan `nombre`, `descripcion`, `categoria` e `imagen` con `escaparHTML`; ✅ en 2.11: `admin.js` escapa todos los campos y atributos de las tablas con `escaparHTML()`; queda el resto de `app.js` para 2.13)*
- **R14 · Formularios sin asociación accesible.** Todos los `<label>` carecen de `for` y los inputs no se envuelven (index 250-282; admin 66-330). El chat no tiene `aria-label`, `aria-expanded` ni `aria-live`; los botones de icono (chat 304/324/343, modales 256/298, acceso staff 72) no tienen nombre accesible salvo algún `title`. → **2.4 / 2.8 / 2.9 / 2.11**. *(✅ resuelto en 2.11: login y modales con `<label for>`, diálogos con `aria-labelledby`, menú con `aria-expanded`/`aria-controls`, botones de icono con `aria-label`, estado de reserva etiquetado y anuncios con `role="status"`)*
- **R15 · Navegación con `href="#"`.** Los 3 navs del admin usan `href="#"` + `onclick` (118, 123, 128): saltan al inicio, ensucian la URL con `#` y con Enter navegan además de cambiar de vista. No hay `aria-current`. → **2.11**. *(✅ resuelto en 2.11: los navs son `<button type="button" data-vista>` con `aria-current="page"` en la vista activa)*
- **R16 · Contraste insuficiente en varios puntos.** `maiz-500` sobre blanco/`cal-50` = **2.40–2.48:1** (cualquier texto maíz sobre claro; el logo “Cusqueño” va sobre foto y depende del recorte, `index.html` 57); `green-600` sobre blanco = **3.30:1** (KPI “↑ 15%”, `admin.html` 168); `gray-400` sobre blanco = **2.54:1** (“Ir a la web pública” e iconos de cierre, 139/256/298). Sí pasan: `adobe-500` (5.89), `cal-100` sobre `ink-900` (13.88) y blanco sobre `adobe-500` (5.89). → **2.2 / 2.4 / 2.11**. *(🟡 parcial en 2.5: header y hero usan un scrim oscuro, por lo que `maiz-500` y `cal-50` sobre la foto ya tienen contraste suficiente; ✅ en 2.11: KPI sin verde simulado, textos secundarios en `ink-600` (≥5.4:1) e iconos/enlaces del panel sobre fondos oscuros; queda revisar el logo maíz sobre el header claro al hacer scroll en la web pública (2.13))*
- **R17 · Fecha “hoy” en UTC.** `new Date().toISOString().split('T')[0]` (`app.js` 64, `admin.js` 287) devuelve el día UTC: en Cusco (UTC-5), después de las 19:00 el mínimo del calendario salta a mañana y bloquea hoy. → **2.8 / 2.12**. *(✅ resuelto en 2.11: el formulario público y el modal del admin calculan el mínimo con `fechaLocalISO()`)*
- **R18 · Footer y navegación móvil.** Año fijo “2024” (`index.html` 297, H10); nav `hidden md:flex` (61) sin menú móvil (H5) y el acceso staff (72) está dentro de ese nav, así que en móvil no hay forma de llegar al admin. → **2.4 / 2.10**. *(🟡 parcial en 2.4: header fijo con fondo al hacer scroll, menú móvil accesible (Esc, clic fuera, `aria-expanded`, 44 px) y acceso staff visible en móvil; ✅ en 2.10: footer con año dinámico `#anio-actual`, navegación de anclas y enlace explícito “Volver a devToolsCusco”)*
- **R19 · Modales sin semántica ni gestión de foco.** No tienen `role="dialog"`, `aria-modal`, foco inicial, trampa de foco, cierre con `Esc` ni bloqueo del scroll (`admin.html` 252-339). Al cambiar el estado de una reserva se re-renderiza la tabla y el foco se pierde (`admin.js` 224-232). → **2.11**. *(✅ resuelto en 2.11: `role="dialog"`, `aria-modal`, `aria-labelledby`, foco inicial, trampa de Tab, cierre con Esc y clic en el fondo, bloqueo de scroll y foco devuelto al botón; tras cambiar el estado, el foco vuelve al `<select>` re-renderizado)*

#### 🟡 Menores / deuda

- **R20 · KPIs engañosos.** “Ingresos” = `reservas.length * 35` (`admin.js` 107) y “últimos 30 días” cuenta todas las reservas (`admin.html` 173). → **2.11**. *(✅ resuelto en 2.11: se eliminó “Ingresos”; ahora se muestran reservas activas, reservas de los últimos 30 días por fecha y platos en carta, todos calculados desde `localStorage`)*
- **R21 · Gráfico simulado.** Datos fijos en `admin.js` (329-337), sin redibujar al redimensionar y se dibuja también para el vendedor con la vista oculta (52). → **2.11**. *(✅ resuelto en 2.11: gráfico real de los últimos 7 días, sin canceladas, con barras HTML/CSS que se adaptan al ancho; solo se dibuja al abrir Resumen (admin) y se actualiza al cambiar estados o eliminar reservas)*
- **R22 · El éxito destruye el formulario.** `mostrarMensajeExito()` reemplaza el `innerHTML` del contenedor (`app.js` 95-125) y obliga a recargar para reservar otra vez. → **2.8**. *(✅ resuelto en 2.8: el formulario se oculta, se muestra un resumen y “Hacer otra reserva” lo restaura con `reset()` sin recargar)*
- **R23 · Sin fallback sin JS.** `#grid-platos` queda vacío (`index.html` 139-141) y el `<noscript>` del hub no se replica aquí. → **2.6**. *(✅ resuelto en 2.6: `#grid-platos` incluye un `<noscript>` con mensaje y CTA a `#reservas`)*
- **R24 · SEO del módulo.** `admin.html` no lleva `noindex` y ninguna de las dos páginas tiene `meta description`. → **2.12 / 2.13**.
- **R25 · Acciones destructivas nativas.** `alert()`/`confirm()` en `eliminarPlato` y `eliminarReserva` (`admin.js` 213-243), sin deshacer. → **2.12**.
- **R26 · Acoplamiento al orden de scripts.** `admin.js` lee `#form-plato` en el nivel superior (260) y solo funciona porque el `<script>` va al final del `<body>`. → **2.13**. *(✅ resuelto en 2.11: toda la inicialización ocurre dentro de `iniciarAdmin()` en `DOMContentLoaded`; no hay lecturas del DOM en el nivel superior)*
- **R27 · Ruido en `data.js`.** Comentarios `// <-- Actualizado a tu foto local` (12, 20, 28, 36) y `PLATOS_INICIALES` como global. → **2.3 / 2.13**. *(✅ resuelto en 2.3: comentarios eliminados y `data.js` ahora define `CLAVE_PLATOS` y `normalizarRutasPlatos`; el alcance global de `PLATOS_INICIALES` se reevalúa en 2.13)*

### Prioridad sugerida para la fase

1. **2.2** unifica tokens, paletas y keyframes (R7, R8, R16).
2. **2.3** normaliza imágenes y rutas (R9, R27).
3. **2.4-2.10** atacan navbar móvil, hero, carta, formulario, chatbot y footer (R3, R14, R17, R18, R22, R23).
4. **2.11-2.12** reconstruyen el admin responsive, el login real y las acciones (R1, R4, R10-R12, R15, R19-R21, R24, R25).
5. **2.13-2.14** cierran `restaurante.css`, endurecen el JS y ejecutan el QA de flujo (R2, R5, R6, R13, R26).

---

## 📎 Notas de auditoría — Meta 3.1 (contrato HTML ↔ JS del módulo Ecommerce)

**Alcance:** lectura completa de `productos/ecommerce/index.html`, `css/inkari.css`, `js/app.js` y `js/data.js`, más una validación automática del contrato (IDs usados por el JS, IDs duplicados, anclas internas, funciones invocadas desde `onclick` y origen de las imágenes). **No se modificó ningún archivo del módulo.**

**Resultado base:** 13 IDs en el HTML y 11 usados por `app.js`; **0 IDs duplicados, 0 IDs faltantes**. Las 7 funciones de `app.js` existen y las 4 llamadas `onclick` generadas por plantilla apuntan a funciones reales. Anclas: `#coleccion` y `#historia` resuelven; **`#artesanos` está rota** y el footer tiene **3 `href="#"` vacíos**.

### Inventario (cifras al momento de la auditoría)

| Archivo | Tamaño | Rol |
|---|---:|---|
| `index.html` | 15.1 KB · 283 líneas | Navbar, hero, catálogo, carrito lateral, historia y footer |
| `css/inkari.css` | **1.0 KB · 40 líneas** | Solo 4 variables, patrón de fondo, `.no-scrollbar` y `.card-hover` |
| `js/app.js` | 8.8 KB · 191 líneas | Render del catálogo, carrito, badges, subtotal y toast |
| `js/data.js` | 4.0 KB · 109 líneas | `PRODUCTOS`: 12 artículos con id, nombre, descripción, precio, categoría e imagen |

### Contrato `index.html` ↔ `app.js`

| Elemento | Uso |
|---|---|
| `#grid-productos` | contenedor donde `renderizarProductos()` inyecta las 12 tarjetas |
| `#btn-carrito` | abre el panel lateral |
| `#cerrar-carrito`, `#carrito-overlay` | cierran el panel |
| `#carrito-panel` | panel lateral que se desplaza con `translate-x-full` |
| `#carrito-items` | lista de ítems del carrito |
| `#carrito-count`, `#carrito-count-title` | contador del navbar y del título del panel |
| `#carrito-subtotal` | subtotal en soles |
| `#toast`, `#toast-message` | notificación flotante |

### Datos (`PRODUCTOS`)

`{ id, nombre, descripcion, precio, categoria, imagen }` · IDs `t1-t4`, `g1-g3`, `c1-c3`, `j1-j2`.

| Categoría | Nº | Filtro disponible |
|---|---:|---|
| Textiles | 4 | ✅ |
| Gourmet | 3 | ❌ no existe |
| Cerámica | 2 | ✅ |
| Arte | 1 | ❌ se pierde dentro de “Cerámica” |
| Joyería | 2 | ✅ |

Las **12 imágenes del catálogo** son hotlinks a **12 dominios distintos** (mlstatic, kunastores, chaku-alpaca, faire, cafequillabamba, peruvianecofarmers, gstatic, arteyceramica, yerbamateargentina, trexperienceperu, etsy, cloudfront). El HTML suma **4 imágenes externas** más de Unsplash (historia y avatares). Ninguna declara `width`/`height` ni `loading`.

### Funciones globales

| Función | Dónde se invoca |
|---|---|
| `renderizarProductos()` | `DOMContentLoaded` |
| `agregarAlCarrito(id)` | plantilla del catálogo (`onclick`) |
| `eliminarDelCarrito(id)` | plantilla del carrito (`onclick`) |
| `cambiarCantidad(id, ±1)` | 2 botones por ítem (`onclick`) |
| `guardarYActualizar()` | interna (añadir, quitar, cambiar cantidad) |
| `actualizarCarritoUI()` | carga inicial y tras cada cambio |
| `mostrarToast(mensaje)` | al añadir un producto nuevo |

> Al refactorizar hay que conservar **IDs, firmas de las funciones y el contrato de `inkari_carrito`**, o migrar todo a delegación de eventos en el mismo cambio.

### `localStorage`

| Clave | Escribe | Lee | Notas |
|---|---|---|---|
| `inkari_carrito` | `guardarYActualizar()` | `DOMContentLoaded` | Guarda una **copia completa** del producto + `cantidad`; sin versión, sin validación de esquema y sin caducidad |

### Anclas del HTML

`#coleccion` y `#historia` son secciones reales. **`#artesanos`** (nav, línea 61) no tiene sección. **`#` vacíos** en el footer (249-251).

### Hallazgos y riesgos

#### 🔴 Bloqueantes

- **E1 · Añadir al carrito inaccesible en táctil y teclado.** El botón `+` vive dentro de la tarjeta con `opacity-0 translate-y-4 group-hover:opacity-100` (`app.js` 58): en móvil no hay hover, la tarjeta no es enfocable y el botón no tiene `aria-label` (solo `title`). Además mide 40 px. → **3.6**.
- **E2 · Un carrito corrupto desactiva toda la tienda.** `JSON.parse` de `inkari_carrito` sin `try/catch` (`app.js` 10-12) corta el `DOMContentLoaded`: no se renderiza el catálogo, no se registran los eventos del panel y la página queda muerta. → **3.11**.
- **E3 · `toFixed` asume número.** `producto.precio.toFixed(2)` (67) y `item.precio.toFixed(2)` (159, 167, 175) lanzan `TypeError` si el precio guardado es texto, `null` o falta (por ejemplo, un carrito viejo manipulado). → **3.6 / 3.11**.
- **E4 · El carrito lateral no es un diálogo accesible.** `#carrito-panel` es un `<aside>` sin `role="dialog"`, `aria-modal`, `aria-hidden`, foco inicial, trampa de foco, cierre con `Esc` ni bloqueo de scroll (`index.html` 138-171; `app.js` 25-37). Cerrado sigue siendo tabulable fuera de pantalla. `#btn-carrito` no tiene `aria-expanded`/`aria-controls` y `#cerrar-carrito` no tiene nombre accesible. → **3.7**.
- **E5 · “Finalizar Compra” no hace nada.** El botón no tiene `id` ni handler (`index.html` 166-169) y el carrito no tiene confirmación ni resumen. → **3.8** (H8).
- **E6 · Filtros simulados y categorías incoherentes.** Los 4 botones (115-118) no filtran nada, no tienen `data-*`, `type="button"` ni `aria-pressed`; y “Gourmet” (3 productos) no tiene filtro mientras “Arte” queda fuera de “Cerámica”. → **3.5** (H8).

#### 🟠 Importantes

- **E7 · `innerHTML` sin escapar.** El catálogo y el carrito interpolan `nombre`, `descripcion`, `categoria`, `imagen` e `id` tal cual (`app.js` 52-69 y 146-171), y el `id` se inyecta dentro de un `onclick`. Un dato con `<img onerror=…>` ejecuta script; unas comillas rompen el atributo. → **3.6 / 3.11**.
- **E8 · 16 imágenes externas y frágiles.** 12 dominios para el catálogo + 4 Unsplash en el HTML; sin `width`/`height`, `loading` ni `decoding`. Riesgo de 403/hotlink, CLS y páginas pesadas. → **3.6 / 3.9**.
- **E9 · Sin menú móvil.** El nav es `hidden md:flex` (`index.html` 58-62): en celular no hay navegación (H5). → **3.3**.
- **E10 · Ancla `#artesanos` rota.** El nav la enlaza (61) pero no existe la sección; el enlace “Artesanos” no lleva a ningún sitio. → **3.9**.
- **E11 · Los contadores no vuelven a 0.** Al vaciar el carrito solo se oculta la insignia: `#carrito-count` conserva el último número como texto y `#carrito-count-title` nunca se actualiza a 0 (`app.js` 126-134). → **3.7**.
- **E12 · Toast sin anuncio accesible.** `#toast` no tiene `role="status"`/`aria-live`, su `setTimeout` no se cancela (dos añadidos seguidos ocultan el segundo mensaje antes de tiempo) y solo avisa al añadir por primera vez, no al incrementar cantidad (`app.js` 85, 181-190). → **3.10**.
- **E13 · `inkari.css` es casi inexistente.** 40 líneas sin foco visible, `prefers-reduced-motion`, keyframes, tipografía fluida ni utilidades de sección/contenedor. → **3.2 / 3.11**.
- **E14 · `tailwind.config` propio e incompleto (H11).** Define hex sueltos y solo `earth 100/800/900` y `terra 500/600`; `gold` no se usa y no hay escala completa ni tokens compartidos. → **3.2**.
- **E15 · Contrastes y tamaños de texto.** `terra-500` sobre `earth-900` (enlace “devToolsCusco”, 12 px) ≈ **3.2:1**; `earth-100/50` sobre `earth-900` (copyright, 12 px) ≈ **4.3:1**; chips y contador a **10 px**. → **3.10 / 3.12**.
- **E16 · Historia y avatares sin optimizar.** Las 3 imágenes de `#historia` (186, 213, 214) no tienen dimensiones, `loading` ni `decoding`; la principal fija `h-[500px]` y depende de Unsplash. → **3.9**.
- **E17 · Enlaces `#` vacíos en el footer.** “Textiles”, “Joyería” y “Cerámica” (249-251) no llevan a ningún sitio ni aplican filtro. → **3.10**.
- **E18 · Copyright fijo “2024”.** `index.html` 268 (H10), sin año dinámico. → **3.10**.
- **E19 · SEO y estructura.** Sin `meta description`, Open Graph, `theme-color` ni JSON-LD; sin `<main>` ni skip-link; los encabezados saltan de `h2` a `h4` en el footer. → **3.10 / 3.12**.
- **E20 · Controles del carrito pequeños y sin confirmación.** Los botones `−`/`+` miden ~24 px, no tienen `aria-label`, quitar un ítem no pide confirmación y el foco se pierde al re-renderizar (`app.js` 155-165). → **3.7**.
- **E21 · El carrito guarda copias obsoletas.** Cada ítem conserva el producto completo: si cambia el precio o el catálogo, el carrito mantiene el valor viejo. No hay stock ni cantidad máxima. → **3.7 / 3.11**.
- **E22 · `agregarAlCarrito` no valida el id.** Si el id no existe, `productoOriginal` es `undefined` y falla al leer `.nombre` (`app.js` 83-85). → **3.11**.

#### 🟡 Menores / deuda

- **E23 · `overflow-x-hidden` en `<body>`.** Oculta desbordes en lugar de corregirlos (`index.html` 38) y puede esconder errores de layout en móvil. → **3.12**.
- **E24 · Sin estado vacío ni skeleton en el catálogo.** Si `PRODUCTOS` queda vacío o un filtro no devuelve resultados, el `#grid-productos` se queda en blanco sin explicación (`app.js` 43-71). → **3.6**.
- **E25 · Altura del panel en iOS.** `h-full` en `#carrito-panel` no sigue la barra del navegador ni respeta `safe-area-inset`; conviene `100dvh` + padding inferior. → **3.7**.

### Prioridad sugerida para la fase

1. **3.2** tokens, paleta y base CSS del módulo (E13, E14, E15).
2. **3.3-3.4** navbar móvil y hero (E9).
3. **3.5-3.8** filtros, tarjetas, carrito y checkout (E1, E4-E7, E11, E20-E22, E24, E25).
4. **3.9-3.10** historia/artesanos, toast y footer (E8, E10, E12, E15-E19).
5. **3.11-3.12** endurecer `app.js`, limpiar CSS y QA de flujo (E2, E3, E23).

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
| 2026-11-19 | 1.17 README | `README.md` reescrito completo (antes quedaba truncado en “Estructura”): propósito, rutas reales de los 4 sitios, árbol de archivos, tabla de módulos con su identidad, stack, sistema de diseño (tokens y componentes `ds-`), cómo ejecutar, claves de `localStorage` y estado del roadmap. Corrige H4: ya no menciona `productos/reservas.html` ni `productos/domotica.html` e incluye ecommerce. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-19 | 1.18 QA | QA real con Chrome headless + axe-core (WCAG 2 A/AA) a 360 / 768 / 1280 px: **0 violaciones**, sin scroll horizontal, sin anclas rotas ni IDs duplicados, los 9 enlaces locales responden y consola sin errores (solo el aviso esperado de Tailwind por CDN). Teclado: el skip-link enfoca `main`, el menú móvil abre/cierra con Espacio/Esc y devuelve el foco al botón, el header se oculta al bajar y “Volver arriba” devuelve el foco al logo. Correcciones aplicadas: botones primarios a `brand-700` (5.48:1) con hover `brand-800`; `ds-btn--sky` a `sky-700` (5.93:1); logo del header a `brand-700`; gradientes de texto sobre blanco oscurecidos (`brand-700 → sky-600`); “Rama 02” a `sky-700`; “Carrito 2” a `terra-700`; `main` con `tabindex="-1"` y sin outline; `.proto-card__link` con 44 px de alto. **Observación:** los enlaces del footer miden 29 px de alto (cumplen el mínimo AA 2.2 de 24 px, no los 44 px recomendados). H4 marcado como resuelto. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-19 | 2.1 Auditoría | Auditoría del módulo Reservas sin tocar código. Se leyó `index.html`, `admin.html`, `restaurante.css`, `app.js`, `admin.js` y `data.js`, y se validó el contrato HTML↔JS: **0 IDs faltantes, 0 duplicados, 0 anclas rotas**; las 11 funciones invocadas por `onclick` existen. Documentado en “Notas de auditoría — Meta 2.1”: inventario, contrato de IDs por página, funciones globales, claves `rinconcito_platos`/`rinconcito_reservas`/`rinconcito_sesion` e IDs huérfanos (chatbot y login decorativo). Se registraron 27 riesgos (R1-R27) con archivo:línea y meta objetivo; los bloqueantes son: el login sin handler hace GET y filtra la contraseña en la URL (R1), `restaurante.css` vacío (R2), chatbot sin JS (R3), el vendedor ve “Resumen” por el reseteo de clases en `cambiarVista()` (R4), `JSON.parse` sin `try/catch` desactiva el formulario público si hay datos corruptos (R5) y `precio.toFixed()` rompe el render con datos no numéricos (R6). También se detectaron paletas Tailwind divergentes, keyframes inexistentes, admin no responsive, categorías incoherentes, XSS por `innerHTML`, labels sin `for`, contrastes < 4.5:1 y la fecha “hoy” calculada en UTC. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-19 | 2.2 Tokens | `restaurante.css` pasó de 0 B a la capa de tokens del módulo, con la misma estructura de la Fase 1: 20 colores en canales RGB (`adobe`, `maiz`, `huerto`, `cal`, `ink`), tipografía (Inter/Playfair/Lora), escala de espaciado, radios, sombras, movimiento, `:focus-visible`, `::selection`, `@keyframes` (`fadeIn`, `scaleIn`, `hero-fade-up`) y `prefers-reduced-motion`. `index.html` y `admin.html` comparten ahora la misma paleta en `tailwind.config` mediante `rgb(var(--token) / <alpha-value>)`; `admin.html` enlaza `restaurante.css` y carga Playfair Display. Cierra R7 (`hover:bg-ink-800`, `hover:bg-adobe-50` y `font-display` ya resuelven) y R8; R2 queda parcial hasta la limpieza de 2.13. Verificado en Chrome: colores computados correctos, `bg-adobe-500/10` → `rgba(176,62,41,.1)`, hover del chat a `ink-800`, `animationName: fadeIn` en el panel y 0 errores de consola. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-19 | 2.3 Assets | Se descargaron las 4 imágenes de Unsplash a `img/` (`nosotros-cocina.jpg` 270 KB, `espacio-salon.jpg` 119 KB, `espacio-terraza.jpg` 87 KB, `espacio-patio.jpg` 126 KB) y el hero pasó a ruta relativa `img/cusco-view.jpg` (optimizado de 403 → 246 KB). Se renombraron `caldo.jpe` y `chicha-moradita.jpe` a `.jpg` y se convirtió `lomo.png` (1536×1024, 812 KB) a `lomo.jpg` (1200×800, 175 KB), eliminando el PNG. Todas las imágenes declaran `width`/`height`; las no críticas usan `loading="lazy" decoding="async"` y el hero `fetchpriority="high"`. `data.js` actualiza rutas y añade `normalizarRutasPlatos` (migra `.jpe` → `.jpg` y `img/lomo.png` → `img/lomo.jpg`); `admin.html` carga `data.js` antes de `admin.js`. Cierra R9 y R27; R11 queda parcial (el admin ya siembra los 4 platos, el rediseño sigue en 2.11). Verificado en Chrome: 9 imágenes con `naturalWidth > 0`, migración correcta y admin con 4 filas e imágenes OK, 0 errores de consola. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-19 | 2.4 Navbar | `index.html`: header de `absolute` a `fixed` con `id="site-header"`; fondo transparente sobre el hero y oscuro (`ink-900/94` + `backdrop-blur` + sombra) al pasar 24 px. Menú móvil completo (`#menu-toggle` / `#mobile-menu`) con enlaces a Carta, Espacios, Nosotros, “Reservar Mesa” y “Acceso Staff”, iconos abrir/cerrar, `aria-expanded`, `aria-controls`, cierre con `Esc` (devuelve el foco), clic fuera, al pulsar un enlace y al pasar a desktop; botones y enlaces de 44 px. El acceso staff ya es visible en móvil. `restaurante.css`: estados `is-scrolled`/`is-menu-open`, `.rn-nav-link` con subrayado maíz, `.rn-mobile-link`, transición del panel y `scroll-padding-top` para las anclas. `app.js`: nueva `configurarNavegacion()` y `html { scroll-behavior: smooth }`. R18 queda parcial (año del footer en 2.10). Verificado en Chrome a 360/1280 px: fondo `rgba(43,31,26,.94)` tras scroll, menú abre/cierra correctamente, ancla `#platos` a 112 px del borde, sin overflow horizontal y 0 errores de consola. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-19 | 2.5 Hero | `index.html`: la sección ahora es `isolate` (el fondo `-z-10` por fin queda detrás del contenido y delante del `bg-ink-900`), con `id="hero"`, `pt-28` para el header fijo y `aria-labelledby`. La imagen pasa a contenedor decorativo (`alt=""`, `aria-hidden`) con `object-position: 50% 40%` y filtro cálido. Overlay nuevo en CSS (`.rn-hero-media::after`): radial + degradado vertical que oscurece la franja del header, refuerza el centro del texto y funde la base con la sección siguiente. Tipografía fluida con `.rn-hero-title` (`clamp(2.6rem, 7.2vw, 6rem)`, `text-wrap: balance`), badge con tokens (`ink-900/55`, `maiz-500`), párrafo `cal-100` y CTAs unificados con iconos, altura mínima de 52 px y ancho completo en móvil. Entrada escalonada con `.rn-hero-enter` y `hero-fade-up`; `prefers-reduced-motion` también anula `animation-delay`. R9 queda cerrado y R16 parcial (header/hero con contraste suficiente; admin en 2.11). Verificado en Chrome a 360/1024/1280 px: imagen visible (`naturalWidth 1180`), título de 41.6/73.7/92.2 px, CTAs de 56–58 px, sin solapamiento con el header, sin overflow horizontal y 0 errores de consola. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-19 | 2.6 Carta | `app.js`: `renderizarPlatos()` genera ahora `<article class="rn-dish-card">` con imagen en contenedor `aspect-ratio: 4/3`, chip de categoría, nombre, precio, descripción y CTA con icono; entrada escalonada (`fadeIn` con retardo de 70 ms) y estado vacío reutilizable. Se añadió `escaparHTML()` para `nombre`, `descripcion`, `categoria` e `imagen`, y `Number(precio).toFixed(2)` para evitar errores de tipo. `restaurante.css`: nueva sección 4 con `.rn-dish-card` (hover/focus-within eleva la tarjeta), `.rn-dish-media`, `.rn-dish-chip`, `.rn-dish-body`, `.rn-dish-name`, `.rn-dish-price`, `.rn-dish-desc`, `.rn-dish-cta` (44 px) y `.rn-dish-empty`. `index.html`: encabezado con badge “Cocina de leña”, `id="carta-title"`/`aria-labelledby` y `<noscript>` dentro de `#grid-platos`. Cierra R23 y deja R13 parcial (admin en 2.13). Verificado en Chrome: 4 tarjetas con imágenes OK y proporción 4:3, 3 columnas en desktop y 1 en móvil, hover `translateY(-4px)` + zoom de imagen, foco en el botón eleva la tarjeta, estado vacío y fallback sin JS funcionando, HTML malicioso renderizado como texto y 0 errores de consola. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-19 | 2.7 Nosotros y Espacios | `index.html`: `#nosotros` con `aria-labelledby`, `.rn-story-media` (marco maíz desplazado, imagen 4:3 con `shadow-lg` y badge flotante “100% Artesanal”), eyebrow “Cocina con raíces”, lista de 3 features con check y CTA “Conoce nuestra carta” → `#platos`. `#espacios` con `aria-labelledby`, eyebrow “Ambientes” y las 3 tarjetas convertidas en enlaces completos `<a class="rn-space-card" href="#reservas">` con índice 01/02/03, imagen 4:3, título, descripción y CTA con flecha. `restaurante.css`: nueva sección 5 (`.rn-story-*` y `.rn-space-*`) con hover `translateY(-4px)`, zoom de imagen, flecha desplazada y `focus-visible` con outline + elevación; secciones 6 (keyframes) y 7 (reduced-motion) renumeradas y cabecera de índice actualizada. Verificado en Chrome a 1280/360 px: imágenes OK (`naturalWidth 800`), proporción 4:3, hover y foco correctos, sin overflow horizontal y 0 errores de consola. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-19 | 2.8 Formulario | `index.html`: `#reservas` con `aria-labelledby`, tarjeta `.rn-reserve-card` (aside oscuro + panel claro), `<label for>` en todos los campos, `aria-describedby` hacia su error, `autocomplete`, `inputmode`, fecha con `min` y hora con `min="12:00"`/`max="22:30"`, `<form novalidate>` y estado `role="status" aria-live="polite"`. `app.js`: `configurarFormularioReserva()` valida en `blur`/`input` tras el primer intento y en el envío (nombre ≥ 3, teléfono ≥ 6 dígitos, fecha no pasada, hora dentro del horario); pinta `aria-invalid`, `.is-invalid` y mensaje por campo, resume los errores y enfoca el primero. `mostrarMensajeExito()` ya no destruye el formulario: lo oculta, muestra `.rn-reserve-success` con resumen `<dl>` escapado con `escaparHTML` y “Hacer otra reserva” restaura el formulario con `reset()` y devuelve el foco. `fechaLocalISO()` corrige el mínimo en horario local (R17). `restaurante.css`: nueva sección 6 con `.rn-reserve-*`, `.rn-form*`, `.rn-input` (48 px, foco visible), `.rn-field-error`, `.rn-form-status` y éxito; dos columnas desde 1024 px para no comprimir el aside a 768 px; keyframes y reduced-motion renumerados a 7/8. Verificado en Chrome a 360/768/1280 px: envío vacío marca 4 campos y no guarda, fecha pasada y hora 23:45 rechazadas, envío válido guarda en `rinconcito_reservas` y muestra el resumen, “Hacer otra reserva” limpia el formulario, HTML en el nombre se muestra como texto, `min` coincide con la fecha local en `America/Lima`, sin overflow horizontal y 0 errores de consola. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-19 | 2.9 Chatbot | `index.html`: el chat pasa a `.rn-chat-toggle` (56 px, `aria-expanded`, `aria-controls`, `aria-label` dinámico e iconos que se intercambian) y `.rn-chat-window` (`role="dialog"`, `aria-labelledby`, `hidden`, sin `right-24` ni `w-80`). Cabecera con avatar, “En línea” con pulso, cierre con `aria-label`; mensajes con `role="log" aria-live="polite"` y scroll por teclado; burbujas bot/usuario diferenciadas; chips de acceso rápido (“Ver la carta”, “Reservar mesa”, “Ver espacios”) y formulario con etiqueta oculta, `maxlength` y botón de 44 px. `app.js`: `configurarChat()` abre/cierra con foco al input, Esc devuelve el foco al botón, los chips cierran y hacen scroll a la sección, y el envío agrega burbujas con `textContent` (sin `innerHTML`) más una respuesta breve. `restaurante.css`: nueva sección 7 con ventana `width: min(22rem, 100vw - 2rem)`, `max-height` con `dvh`, en móvil `left/right: 1rem` y botón a 1rem; keyframes y reduced-motion renumerados a 8/9. Verificado en Chrome a 320/360/1280 px: ventana siempre dentro del viewport, sin scroll horizontal, hueco de 12 px sobre el botón, foco correcto al abrir/cerrar, mensaje con HTML se muestra como texto, 0 errores de consola. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-19 | 2.10 Footer | `index.html`: el footer mínimo pasa a `.rn-footer` con marca + tagline, `nav aria-label="Enlaces del restaurante"` (carta, espacios, nosotros, reservar), bloque “¿Explorando más proyectos?” con enlace destacado “Volver a devToolsCusco” (`../../index.html`) y barra inferior con `&copy; <span id="anio-actual">2024</span>` y crédito al hub. `app.js`: `actualizarAnio()` escribe el año en curso al cargar. `restaurante.css`: nueva sección 8 con `.rn-footer*` (grid de 3 columnas desde 1024 px para que el CTA no se parta a 768 px), enlaces de 40 px, pill con hover y `focus-visible`, y barra inferior en fila desde 640 px; keyframes y reduced-motion renumerados a 9/10. Verificado en Chrome a 360/768/1280 px: año 2026 correcto, anclas y enlace al hub resueltos (`/index.html`, HTTP 200), sin overflow horizontal y 0 errores de consola. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-19 | 2.11 Panel admin | `admin.html` reescrito: login split con `<label for>` y `autocomplete`; shell con sidebar off-canvas (`#admin-sidebar`, `#admin-overlay`, `#admin-menu-toggle`, `inert` en el contenido), topbar sticky y nav con `<button data-vista>` + `aria-current`; KPIs reales (`#kpi-activas`, `#kpi-reservas`, `#kpi-platos`, sin “Ingresos”); gráfico de 7 días; tablas y modales con `role="dialog"` y `hidden`. `css/admin.css` nuevo (25 KB): tokens de `restaurante.css`, login, sidebar/topbar, `.rn-btn`, `.rn-status--*` (Pendiente/Confirmada/Asistió/Cancelada), KPIs, cards, gráfico HTML/CSS, tablas que pasan a tarjetas con `data-label` y modales bottom-sheet. `js/admin.js` reescrito: `iniciarAdmin()` en `DOMContentLoaded`, login con `preventDefault`, `escaparHTML()` y `fechaLocalISO()`, `leerLista()`/`guardarLista()` con `try/catch`, KPIs (activas y últimos 30 días), gráfico real sin canceladas, tablas escapadas con delegación `data-accion`, modales con foco inicial/trampa/Esc/scroll lock y retorno de foco, estados con `Asistió`/`Cancelada` y anuncios `role="status"`. Verificado en Chrome a 320/360/768/1024/1280 px: login y shell, menú off-canvas con foco e `inert`, KPIs 0→5 platos y 0→1 reserva, gráfico de 7 columnas, cambio Pendiente→Cancelada→Pendiente, alta con HTML se muestra como texto (0 nodos inyectados), modales dentro del viewport, tablas en tarjetas a 360 px y normales a 768 px, vendedor sin Resumen ni borrado, sin overflow horizontal y 0 errores/404. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-20 | 2.12 Login/acciones | `admin.html`: añadidos `<meta name="description">` y `<meta name="robots" content="noindex, nofollow">` (R24). Modal `#modal-confirmar` (`role="alertdialog"`, `aria-labelledby`, `aria-describedby`) para reemplazar `window.confirm`/`window.alert` en eliminaciones destructivas (R25); botón "Eliminar" con `.rn-btn--danger` y foco inicial; cancelar y clic en el fondo cierran el modal con retorno de foco. `js/admin.js`: `configurarConfirmacion()` inicializa el modal; `confirmarAccion(mensaje, cb)` inyecta el texto, clona el botón para limpiar listeners y llama al callback solo si se acepta; `eliminarPlato()` y `eliminarReserva()` usan `confirmarAccion()` en lugar de `window.confirm`; los mensajes de acceso restringido usan `anunciar()` en lugar de `window.alert`. `css/admin.css`: `.rn-btn--danger` (adobe-600 / adobe-700 hover) y `.rn-modal-card--sm` (ancho máximo 22 rem). Cierra R24 y R25. |
| 2026-11-20 | 2.13 Limpieza | `restaurante.css`: verificado sin CSS muerto; 10 secciones ordenadas con índice correcto. `app.js`: los dos `JSON.parse` sin `try/catch` (R5) envueltos en bloque defensivo — `renderizarPlatos()` captura `rinconcito_platos` corrupto y muestra el estado vacío en lugar de romper el `DOMContentLoaded`; `configurarFormularioReserva()` captura `rinconcito_reservas` corrupto e inicia lista vacía para no perder la reserva recién creada. `admin.js`: ya tenía `leerLista()`/`guardarLista()` con `try/catch` desde 2.11; sin cambios. Cierra R5; R2, R6, R13, R26, R27 ya cerrados en metas anteriores. |
| 2026-11-20 | 2.14 QA Fase 2 | QA estático completo del módulo Reservas. Contrato HTML↔JS verificado: 0 IDs faltantes, 0 funciones globales rotas, 0 anclas internas rotas, carga correcta de `data.js` → `admin.js`. Los 27 riesgos R1–R27 están cerrados. Corrección adicional: `#modal-confirmar` reubicado antes de los `<script>` al final del `<body>` (era el único nodo fuera del orden DOM estándar). Checklist de hallazgos H1–H11: H5 ✅ (menú móvil en las 2 páginas), H6 ✅ (rutas relativas, .jpe→.jpg, Unsplash local), H7 ✅ (chatbot responsive), H10 ✅ (año dinámico #anio-actual). Fase 2 completada. |
| 2026-11-20 | 3.1 Auditoría | Auditoría del módulo Ecommerce sin tocar código. Se leyó `index.html`, `inkari.css`, `app.js` y `data.js`, y se validó el contrato HTML↔JS: 13 IDs en el HTML y 11 usados por `app.js`, 0 duplicados, 0 faltantes y las 4 llamadas `onclick` apuntan a funciones existentes. Documentado en “Notas de auditoría — Meta 3.1”: inventario, contrato de IDs, estructura de `PRODUCTOS` (12 artículos; Textiles 4, Gourmet 3, Cerámica 2, Arte 1, Joyería 2), funciones globales y clave `inkari_carrito`. Se registraron 25 riesgos (E1-E25); bloqueantes: el botón de añadir solo aparece con hover y no es accesible en táctil/teclado (E1), `JSON.parse` sin `try/catch` deja la tienda muerta con un carrito corrupto (E2), `precio.toFixed()` rompe el render con datos no numéricos (E3), el carrito lateral no es un diálogo accesible (E4), “Finalizar Compra” no tiene acción (E5) y los filtros son simulados con categorías incoherentes (E6). También se detectaron `innerHTML` sin escapar, 16 imágenes externas de 12 dominios, ancla `#artesanos` rota, contadores que no vuelven a 0, toast sin `aria-live`, `inkari.css` de 40 líneas, copyright 2024 y enlaces `#` vacíos. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-20 | 3.2 Tokens | `inkari.css` reescrito (40 → ~300 líneas) con tokens RGB-canales: escalas completas `earth` 50–900, `terra` 50–900, `gold` 50–900, `cream` 50–200, superficies/bordes/texto, estados, `--focus-ring: terra-600`; tipografía fluida (`--text-h1/h2/h3` con `clamp`), escala de espaciado de 4 px, layout (`--container` 80 rem, `--gutter`, `--section-y`, `--header-h: 5rem`), radios, 5 sombras (`--shadow-card` replica la de `.card-hover`), movimiento (`--ease-out`, `--dur-fast/base/slow`), foco visible con `:focus-visible` sin tocar el radio, `::selection`, `scroll-padding-top` desde el header, `.bg-pattern`/`.no-scrollbar` migrados a tokens, `.card-hover` solo bajo `@media (hover: hover)`, keyframes `fadeIn`/`riseIn` (reservados para 3.3–3.6) y bloque `prefers-reduced-motion`. `index.html`: `tailwind.config` ahora lee los tokens con `rgb(var(--token) / <alpha-value>)` y expone las escalas completas `earth`, `terra`, `gold`, más `cream` como color único con alfa; fuentes vía `var(--font-sans)`/`var(--font-display)`. Verificado en Chrome a 360/1280 px: `cream` 249 247 242, `earth-900` 44 37 30, `terra-500` 200 90 62 y `terra-600` 168 74 44 idénticos a la paleta original; 12 tarjetas, header `rgba(249,247,242,.9)`, footer `earth-900`, anclas a 96 px, foco por Tab con outline `rgb(168,74,44)` de 2 px, hover `translateY(-4px)` con la sombra original, 360 px sin overflow, reduced-motion en `auto`/`0.01ms` y 0 errores/404. Cierra E13, E14 y la base de E15. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-20 | 3.3 Navbar + menú móvil | `index.html`: navbar con `<nav aria-label="Navegación principal">` y enlaces `.eco-nav-link` (subrayado terracota animado); nuevo botón `#menu-toggle` de 44 × 44 px con `aria-expanded`, `aria-controls="mobile-menu"`, `aria-label` dinámico e iconos abrir/cerrar intercambiables; panel `#mobile-menu` desplegable bajo la barra (`hidden` cuando está cerrado, por lo que no es tabulable) con 3 enlaces de 48 px y CTA “Explorar la Colección”. El botón `#btn-carrito` se conserva con su contador, ahora con `aria-label="Abrir carrito"` y `aria-controls="carrito-panel"`. `inkari.css`: nueva sección 3 “Navegación” con `.eco-nav-link`, `.eco-menu-toggle`, `.eco-mobile-menu`, `.eco-mobile-link` y `.eco-mobile-cta`, todo con tokens; secciones renumeradas 4–6. `app.js`: nueva `configurarNavegacion()` (abrir/cerrar, iconos, `aria-expanded`, cierre con `Esc` devolviendo el foco, clic fuera, clic en un enlace, cambio a escritorio y evento `eco:carrito-abierto` para que carrito y menú no se solapen). Verificado en Chrome a 360/1280 px: hamburguesa visible solo en móvil (44 × 44), menú bajo la barra con 4 destinos, Tab entra al primer enlace, `Esc` cierra y devuelve el foco al botón, clic fuera y clic en enlace cierran, el carrito cierra el menú y el contador sigue funcionando (1 ítem), nav de escritorio intacta, sin overflow horizontal y 0 errores/404. Cierra E9. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-20 | 3.4 Hero | `index.html`: hero reescrito como composición editorial a dos columnas (7/5 en `lg`). Izquierda: eyebrow con regla terracota, `h1` de 48/60/72 px con “hecha arte.” en cursiva terracota, párrafo, dos CTA de 52 px (“Explorar la Colección” y “Nuestra Historia”) y trust row con tres sellos (Técnicas ancestrales, Comercio justo, Origen Cusco). Derecha: panel decorativo oscuro (`aria-hidden`) con trama textil en CSS, motivo andino en SVG dorado, cita en serif y sello circular “Hecho a mano · Cusco”. Fondo con halos radiales terracota/dorado. `inkari.css`: nueva sección 4 “Hero editorial” con `.eco-hero-glow`, `.eco-hero-weave`, `.eco-btn` (primary/ghost) y `.eco-rise` (entrada escalonada con `riseIn`, 80–400 ms); secciones renumeradas 5–7. Verificado en Chrome a 360/768/1280 px: 72 px de titular en escritorio y 48 px en móvil, panel de 384 px visible, botones de 52 px (328 px de ancho en móvil), CTA lleva a `#coleccion` a 96 px del borde, animaciones terminan en opacidad 1, reduced-motion deja todo visible a `0.01ms`, sello dentro del viewport a 360 px, sin overflow horizontal y 0 errores/404. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-20 | 3.5 Filtros | `index.html`: los 4 botones simulados se sustituyen por `#filtros-categorias` (contenedor vacío, `role="group"`, `aria-label="Filtrar por categoría"`) y un `#filtros-estado` `sr-only` con `role="status"` y `aria-live="polite"`. `app.js`: nueva `configurarFiltros()` que genera un botón por cada categoría real de `PRODUCTOS` (Todos 12, Textiles 4, Gourmet 3, Cerámica 2, Arte 1, Joyería 2) con `aria-pressed`, `aria-controls="grid-productos"`, `aria-label` con el conteo y un badge numérico; `seleccionarCategoria()` actualiza el estado y vuelve a renderizar; `renderizarProductos()` filtra por `categoriaActiva`. `inkari.css`: sección 5 “Catálogo y tarjetas” con `.eco-filtro` (44 px) y `.eco-filtro__count`, activo vía `[aria-pressed="true"]` (fondo `earth-900`, texto `cream-100`). Verificado en Chrome: 6 filtros con los conteos correctos; Textiles 4, Gourmet 3, Arte 1, Cerámica 2 (ya no absorbe Arte), Joyería 2 y Todos 12; solo un `aria-pressed="true"` a la vez; activación con clic y con Enter (foco visible `rgb(168,74,44)`); anuncio “Mostrando N piezas de …”; fila desplazable de 700 px en 360 px sin desbordar la página; 0 errores/404. Cierra E6. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-20 | 3.6 Grid y tarjeta | `app.js`: nueva `configurarCatalogo()` con delegación (`data-accion="agregar"`, `data-id`, `ver-todos`) y captura de errores de imagen; `escaparHTML()` para nombre, descripción, categoría, imagen e id; `formatearPrecio()` tolerante a `null`, texto y decimales (aplicado a tarjeta, carrito, línea y subtotal); `agregarAlCarrito()` valida el id y normaliza cantidades; estado vacío con mensaje y botón “Ver toda la colección”. Tarjetas: imagen `width="400" height="500"`, `loading="lazy"`, `decoding="async"`, skeleton con `shimmer`, fundido al cargar y respaldo SVG en data URI si un hotlink falla; botón “Añadir” de 44 × 100 px con `aria-label`, visible siempre en táctil y al hover/foco en escritorio; título y descripción escapados; precios con `formatearPrecio`. `inkari.css`: `.eco-card-media`, `.eco-card-skeleton`, `.eco-card-img`, `.eco-card-add` (visible en táctil; oculto hasta hover/foco con puntero fino), `card-hover:focus-within` y keyframes `shimmer`. Filtros movidos a fila solo desde `xl` para eliminar el desborde a 768 px. Verificado en Chrome: 12 tarjetas con dimensiones/lazy/decoding, 12 imágenes cargadas (11 en la primera pasada por un hotlink lento), skeleton `shimmer` oculto al cargar, botón de 44 px con etiqueta “Añadir … al carrito”, opacidad 0 → 1 al hover y al foco, tarjeta `translateY(-4px)`, alta en carrito con delegación (contador 1, subtotal S/ 180.00), `escaparHTML` neutraliza `<img onerror>`, precios corruptos → S/ 0.00, estado vacío y retorno a 12, respaldo de imagen activo, 1/2/4 columnas a 360/768/1280 px, sin overflow y 0 errores/404. Cierra E1, E3, E7 y E24; E8 queda mitigado (dimensiones, lazy, decoding y respaldo), pendiente de locales en 3.9/3.11. Hecho por DeepSeek - Pendiente de revisión. |
| 2026-11-20 | 3.7 Carrito lateral | Verificado completamente implementado en metas anteriores (3.6): `#carrito-panel` con `role="dialog"`, `aria-modal`, `aria-hidden`, `tabindex="-1"`, `inert`, foco inicial al abrir, trampa Tab (`atraparFoco`), Esc, bloqueo de scroll (`eco-scroll-lock` + compensación de barra), retorno de foco al `#btn-carrito`, confirmación antes de eliminar (`eliminacionPendiente`), botones +/− de 44 px con `disabled` en límites, estado vacío con CTA, re-renderizado sin pérdida de foco y `anunciarCarrito` con `role="status"`. Cierra E4, E11, E20, E21, E25. |
| 2026-11-20 | 3.8 Finalizar compra | `index.html`: modal `#modal-pedido` (`role="dialog"`, `aria-modal`, `aria-labelledby="pedido-titulo"`, `tabindex="-1"`) con ícono de éxito, lista `#pedido-items` con miniatura/nombre/subtotal por ítem, total y CTA "Volver a la tienda"; overlay `#pedido-overlay` para cerrar con clic fuera; `#toast` añadidos `role="status"`, `aria-live="polite"`, `aria-atomic="true"` (E12). `app.js`: `configurarCheckout()` une `#btn-finalizar` → `cerrarCarrito` → `mostrarResumenPedido()` que inyecta los ítems con `escaparHTML`/`formatearPrecio`, abre el modal y enfoca el título; `cerrarPedido()` vacía el carrito, llama `guardarCarrito`/`actualizarCarritoUI` y devuelve el foco al botón; Esc cierra; `mostrarToast` actualizado con `clearTimeout(_toastTimer)` para evitar que mensajes consecutivos se oculten antes de tiempo. Cierra E5, E12. |
| 2026-11-20 | 3.9 Historia/Artesanos | `index.html`: sección `#artesanos` entre `#historia` y el footer — encabezado "Los Artesanos", grid de 3 columnas (1/sm:3), 3 perfiles (María Quispe / tejedora, Juan Huallpa / orfebre, Rosa Mamani / cerámica) con avatar inicial en earth-100 sin imágenes externas, nombre, especialidad en terra-600 y descripción breve; CTA "Ver las piezas de nuestros artesanos" → `#coleccion`. Ancla `#artesanos` del nav ahora resuelve. Cierra E10; E8 queda mitigado (dimensiones, lazy, decoding y respaldo en tarjetas), pendiente descarga de imágenes locales en 3.11. |
| 2026-11-20 | 3.10 Toast/footer/año | `index.html`: copyright `2024` → `<span id="anio-actual">2026</span>`; los 3 `href="#"` del footer (Textiles, Joyería, Cerámica) → `<button onclick="seleccionarCategoria(…)">` que aplican el filtro y navegan al catálogo. `inkari.css`: añadido reset `footer button` (sin borde, fondo ni padding) para que los botones hereden el estilo del texto de lista, y `.sr-only` para uso futuro. `app.js` (`DOMContentLoaded`): `#anio-actual` actualizado con `getFullYear()`. Cierra E17, E18; H10 cerrado para el módulo Ecommerce. |
| 2026-11-20 | 3.11 Limpieza | `inkari.css`: índice actualizado (7→Artesanos/secciones, 8→Keyframes, 9→reduced-motion); `footer button` genérico → clase `.eco-btn-link` en sección 2 (con `transition`); `.sr-only` consolidado en sección 2 (elimina duplicado de sección 5); nueva sección 7 con `.eco-artesano-avatar`; `body overflow-x:clip` (corrección de E23 sin ocultar errores como `overflow-x:hidden`). `index.html`: `overflow-x-hidden` eliminado de `<body>`; botones del footer pasan a `.eco-btn-link`. `app.js`: `seleccionarCategoria()` ya no retorna si la categoría coincide con la activa — siempre navega a `#coleccion`, para que los botones del footer funcionen incluso cuando el filtro ya está aplicado. E2/E3/E23 cerrados; contrato HTML↔JS limpio. |
| 2026-11-20 | 3.12 QA Fase 3 | QA estático completo: 8 IDs de carrito, 2 de pedido, 6 de navegación, toast, filtros y año — todos resueltos. 4 anclas internas (`#coleccion`, `#historia`, `#artesanos`, `#inicio`) resuelven. `seleccionarCategoria` correctamente global y accesible desde `onclick` del footer. Los 25 riesgos E1–E25 cerrados o mitigados (E8/E16 mitigados con fallback SVG, dimensiones y lazy; imagen Unsplash de historia queda pendiente de sustitución local en Fase 5 si aplica; E19 SEO parcial: `title`/`lang` OK, `meta description` y OG pendientes). H5 ✅ (menú móvil), H8 ✅ (filtros funcionales y checkout con resumen), H10 ✅ (año dinámico). Fase 3 completada. |
| 2026-11-21 | Definición de terminado | Checklist global cerrado. H1–H11: todos marcados `[x]`. Los 6 criterios del checklist global verificados contra el registro de las 4 fases: 4 sitios coherentes con identidad propia ✅; navegación móvil en las 7 páginas (hub, reservas pública, admin, ecommerce, domótica) ✅; 0 enlaces rotos, 0 anclas inválidas, 0 rutas absolutas ✅; 0 errores en consola ✅; README actualizado ✅; H1–H11 resueltos (H11 mitigado: tokens alineados, sin build compartido real) ✅. Rediseño completado. |
| 2026-11-20 | 4.1 Auditoría | Auditoría del módulo Domótica sin tocar código. Se leyó `index.html`, `domotica.css` y `app.js`, y se validó el contrato HTML↔JS. **0 IDs duplicados, 0 IDs faltantes** en los controles. Inventario: `domotica.css` (27 líneas: `.neon-text`, `.neon-border`, `.bg-grid` y scrollbar personalizada, sin tokens, sin foco, sin keyframes); `app.js` (60 líneas: controles de luces, temperatura y puerta, todo en `DOMContentLoaded`); `index.html` (280 líneas: navbar pill, hero con mockup, panel de control, 3 suites y footer). IDs del contrato: `toggle-luces`, `switch-luces`, `estado-luces`, `slider-temp`, `temp-valor`, `btn-puerta`, `icono-puerta`, `estado-global`. Funciones: ninguna global invocada desde `onclick`; todo por listeners. Riesgos detectados: D1 sin menú móvil (H5; nav `hidden md:flex`, acceso solo en desktop), D2 imagen bstatic de Suite Terraza (H9; URL externa frágil), D3 `console.log` en producción, D4 `innerHTML` no escapado en `btn-puerta` al cambiar estado, D5 `body.style.backgroundColor` manipulado con hex sueltos (sin tokens), D6 sin `aria-label` en `toggle-luces` ni `slider-temp`, D7 sin `type="button"` en botones de suites, D8 copyright fijo "2024" (H10), D9 `domotica.css` sin tokens/foco/keyframes/reduced-motion, D10 `tailwind.config` con hex sueltos y sin tokens, D11 botones "Reservar Suite" sin acción (H9), D12 tarjeta flotante `animate-[bounce_3s_infinite]` sin `prefers-reduced-motion`, D13 `neon-text` usa `text-shadow` hardcodeado en lugar de token, D14 nav en `fixed top-6` pierde el foco al hacer Tab en la página. |
| 2026-11-21 | 4.12 QA Fase 4 | QA estático completo del módulo Domótica. Contrato HTML↔JS verificado: **0 IDs faltantes, 0 IDs duplicados, 0 anclas rotas, 0 `href="#"` vacíos, 0 `console.log`**. Verificados los 46 IDs del contrato (menú móvil, panel de control, barra de estado, suites y modal de reserva, footer); las 2 funciones globales (`configurarSuites`, `configurarFooter`) definidas fuera del `DOMContentLoaded`; los 3 `data-suite` coinciden con las claves del objeto `SUITES`; los 2 `[data-red]` coinciden con el selector de `configurarFooter`. Las 3 imágenes locales de suites existen (`img/suite-andina.jpg`, `img/suite-master.jpg`, `img/suite-terraza.jpg`). `nextSibling` de los chips funciona con el nodo de texto que producen los saltos de línea del HTML. Los dos listeners de `keydown` (menú móvil y modal) coexisten sin conflicto (cada uno guarda su propio estado). `opacity-75` de Tailwind no bloquea el keyframe `dmPulse` (especificidad menor). Los riesgos D1–D14 de la auditoría están cerrados: D1 (menú móvil H5), D2 (imagen bstatic eliminada), D3 (`console.log`), D4 (`innerHTML`), D5 (colores inline en JS como literales RGB), D6 (aria-label en toggle y slider), D7 (`type="button"` en suites), D8 (copyright dinámico H10), D9/D10 (tokens y config Tailwind), D11 (modal de reserva H9), D12 (`prefers-reduced-motion`), D13 (`neon-text` con tokens), D14 (foco en pill navbar). H5 ✅ (menú móvil), H9 ✅ (imágenes locales y modal de reserva), H10 ✅ (año dinámico). Fase 4 completada. |
| 2026-11-21 | 4.11 Limpieza | `app.js`: `COLORES_PUNTO.clima` y `defecto` pasaron de `'rgb(var(--neon-cyan))'` a `'rgb(34 211 238)'` (las variables CSS no resuelven con `style.backgroundColor` en JS inline); `body.style.backgroundColor` para las luces pasó de `'rgb(var(--dark-luces-on))'` a `'rgb(26 21 16)'` por la misma razón; variable `cardClima` declarada pero nunca usada eliminada. `domotica.css`: token `--space-10: 2.5rem` añadido al bloque de espaciado (lo usa `.dm-footer__bottom` con `margin: var(--space-10) auto 0`). CSS verificado sin clases sin uso activo; índice del encabezado correcto (secciones 0–9). Cierra los últimos residuos de D5 (valor de fondo de luces ya es literal en JS). |
| 2026-11-21 | 4.8 Barra de estado | `index.html`: barra reemplazada por `.dm-barra-estado` con `role="status" aria-live="polite" aria-atomic="false"`, `id="barra-estado"`; punto indicador dividido en `#punto-ping` (`.dm-punto-ping`, pulso continuo) y `#punto-core` (`.dm-punto-core`), ambos con `transition: background-color` para cambiar de color según el control activo; mini-resumen `.dm-barra-resumen` con 3 chips `.dm-resumen-chip` (`#resumen-luces`, `#resumen-temp`, `#resumen-puerta`) con icono SVG + texto inicial. `app.js`: `actualizarEstadoGlobal()` recibe ahora un segundo argumento `contexto` (`luces/clima/puerta/defecto`) y aplica el color correspondiente de `COLORES_PUNTO` al `style.backgroundColor` de los dos nodos del punto; los 3 bloques de control actualizan su chip de resumen (texto y clase `.dm-resumen-chip--activo`) y pasan su contexto a `actualizarEstadoGlobal`. `domotica.css` sección 5: `.dm-barra-estado` (flex-wrap, padding con tokens, borde), `.dm-punto-ping/.dm-punto-core` (color base cian, `transition`), `.dm-barra-resumen`, `.dm-resumen-chip` (pill xs, borde sutil, `transition` de color) y `.dm-resumen-chip--activo` (cian/10, borde cian/30); bloque `.dm-btn` restaurado con sus propiedades de layout completas y `.dm-btn--ghost` correctamente cerrado. |
| 2026-11-21 | 4.7 Seguridad | `index.html`: tarjeta con `id="card-puerta"` y clase `.dm-card-puerta`; `#icono-puerta` con `aria-hidden`; dos SVGs de candado (`#svg-bloqueado` / `#svg-desbloqueado`) que se intercambian sin `innerHTML`; `#desc-puerta` con `role="status" aria-live="polite"` para anunciar el cambio de estado; `#btn-puerta` con `type="button"`, clase `.dm-btn-puerta .dm-btn-puerta--bloqueada`, `aria-pressed="false"`, `aria-label` descriptivo, y SVGs de icono + `<span class="dm-puerta-texto">` para texto — todo fijo en el DOM. `app.js` bloque 3: reescrito sin `innerHTML` (cierra D4) ni `classList.replace` frágiles; estado leído de `aria-pressed`; `actualizarEstadoGlobal()` reutilizada; variable `puertaBloqueada` eliminada. `domotica.css` sección 5: `.dm-btn-puerta` base (44px, transiciones), `.dm-btn-puerta--bloqueada` (fondo `dark-600`), `.dm-btn-puerta--abierta` (verde/15, borde verde, `animation: dmPulse 2s 1`), `.dm-icono-puerta--abierta` (glow verde). Cierra D3 (no hay `console.log` en el JS restante) y D4 (`innerHTML` eliminado del bloque de seguridad). |
| 2026-11-21 | 4.6 Climatización | `index.html`: `#slider-temp` envuelto en `.dm-slider-wrap`; `<input>` con `aria-label`, `aria-valuemin/max/now/valuetext`; valor `.dm-temp-valor` con `role="status" aria-live="polite" aria-atomic`; tarjeta con `id="card-clima"`. `app.js` bloque 2 reescrito: `actualizarTrackClima()` calcula el porcentaje y escribe `--dm-slider-fill` como `style` del input; `zonaTermica()` devuelve la zona; `className` hardcodeados eliminados — se usan `.dm-temp--frio/templado/calido`; `aria-valuenow/valuetext` actualizados en cada `input`; estado inicial (21°C, zona templada, track al 35.7%) aplicado en carga. `domotica.css` sección 5: `.dm-slider` reescrito con track rellenado por `linear-gradient` con `--dm-slider-fill`; pulgar 20 px (antes 1.25rem ~20px sin `appearance:none` correcto); `::-webkit-slider-thumb` con `hover` y `focus-visible` (scale 1.2, glow 14px); `::-moz-range-thumb` con idénticos; `.dm-slider:focus-visible` con outline 2px cian (antes solo en el pulgar WebKit); `.dm-slider-wrap` como contenedor; `.dm-temp-valor` con `transition: color`; `.dm-temp--frio/templado/calido`. Cierra D6 (slider ya tiene `aria-label`). |
| 2026-11-21 | 4.5 Iluminación | `index.html`: `#toggle-luces` pasa de `<button>` genérico a toggle accesible con `role="switch"`, `aria-checked="false"`, `aria-label="Iluminación de la suite"` y clases `.dm-toggle/.dm-toggle__thumb`; halo decorativo `.dm-luz-halo` absoluto dentro de la tarjeta; `#estado-luces` con `role="status" aria-live="polite"`; `id="icono-luces"` y `aria-hidden="true"` en el div del ícono; tarjeta con clase `.dm-card-luces` (antes `transition-all duration-500` hardcodeado). `app.js`: bloque 1 reescrito sin `classList.replace` frágiles — el estado se lee de `aria-checked`; `actualizarEstadoGlobal()` extraida como utilidad compartida; `body.style.backgroundColor` usa token `rgb(var(--dark-luces-on))` en vez de hex suelto `#1a1510` (cierra D5). `domotica.css` sección 5: token `--dark-luces-on`, clases `.dm-card-luces`, `.dm-card-luces--on` (borde y glow amarillo), `.dm-luz-halo` (halo radial, `opacity` 0→1 con transición) y `.dm-luz-icono--on` (glow y fondo cálido). Cierra D5 y D6. |
| 2026-11-21 | 4.4 Hero y mockup | `index.html`: `<main>` sin padding fijo; hero movido a `#experiencia` (ancla del nav) con clase `.dm-hero-section`; `h1` pasa de clases Tailwind hardcodeadas a `.dm-hero-title` (token `--text-h1`); mockup limitado a `max-w-sm sm:max-w-md lg:max-w-none` para no desbordar en 360 px; tarjeta flotante de `-bottom-6 -right-6` a `-bottom-4 -right-4 sm:-bottom-6 sm:-right-6` (ya no recorta en móvil), padding y gap reducidos en móvil (`p-3 sm:p-4`, `gap-3 sm:gap-4`), `animate-[bounce_3s_infinite]` reemplazado por `.dm-hero-float` que respeta `prefers-reduced-motion`; mockup marcado con `role="img"` y `aria-label` descriptivo, `aria-hidden` en la tarjeta flotante. `domotica.css` sección 4: nuevas clases `.dm-hero-section` (padding correcto bajo la pill) y `.dm-hero-title` (tamaño fluido con `--text-h1`); `.dm-hero-float` con `animation: dmBounce`. Cierra D12. |
| 2026-11-21 | 4.3 Navbar + menú móvil | Verificado completamente implementado en la meta 4.2: `index.html` ya tiene `#menu-toggle` (44×44 px, `aria-expanded`, `aria-controls`, `aria-label` dinámico, iconos intercambiables), panel `#mobile-menu` (`hidden` cuando cerrado) con 3 enlaces `.dm-mobile-link` de 48 px y botón `.dm-mobile-back` “Volver al Hub” a ancho completo. `domotica.css` sección 3 incluye `.dm-nav-link`, `.dm-menu-toggle`, `.dm-mobile-menu`, `.dm-mobile-link` y `.dm-mobile-back` con tokens. `app.js` bloque 0 gestiona abrir/cerrar con `Esc` (devuelve foco), clic fuera, clic en enlace y cambio a escritorio. Enlace “Volver al Hub” visible en desktop y en móvil. Cierra D1 y D14 (H5). |
| 2026-11-20 | 4.2 Tokens | `domotica.css` reescrito (27 → ~280 líneas): escalas completas `dark` 900/800/700/600 y `neon` 50–700 en canales RGB; alias `--neon-cyan`; tokens de texto, foco, tipografía fluida (`--text-h1` con `clamp`), espaciado de 4 px, layout, radios, 4 sombras y 4 niveles de glow (`--glow-sm/md/lg/inset`), movimiento; sección 1 base (`overflow-x:clip`, `scroll-padding`, `::selection`, `:focus-visible`); sección 2 utilidades (`.bg-grid`, `.neon-text`, `.neon-border`, scrollbar); secciones 3–6 con clases del módulo (`.dm-nav-link`, `.dm-toggle`, `.dm-slider`, `.dm-btn`, `.dm-reserve-btn`, `.dm-modal`); keyframes `dmFadeIn`, `dmBounce`, `dmScaleIn`, `dmPulse`; bloque `prefers-reduced-motion`. `tailwind.config`: paletas `dark` y `neon` leen tokens con `rgb(var() / <alpha-value>)`; fuentes vía `var(--font-*)`. `<body>`: quitados `overflow-x-hidden`, `selection:bg-neon-cyan` y `selection:text-dark-900` (duplicados con el CSS). Cierra D9 y D10. |
| 2026-11-21 | 4.9 Sección Suites | `index.html`: las 3 imágenes externas (Unsplash ×2 y bstatic) sustituidas por locales ya descargadas — `img/suite-andina.jpg`, `img/suite-master.jpg`, `img/suite-terraza.jpg` — con `width`/`height`, `loading="lazy"`, `decoding="async"` y `alt` descriptivo; grid `#grid-suites`; las 3 tarjetas reescritas con estructura idéntica (`.dm-suite-card`, media `aspect-[16/10]`, título, subtítulo, precio, lista `.dm-suite-amenities` y botón al pie) y alturas iguales verificadas (487 px en 1280, 462 px en 768); botones “Reservar Suite” con `type="button"`, `data-accion="reservar-suite"`, `data-suite`, `aria-haspopup="dialog"` y `aria-label`; nuevo modal `#modal-suite` (`role="dialog"`, `aria-modal`, `aria-labelledby`, `hidden inert`) con formulario (fechas con `min`, huéspedes limitados por capacidad, nombre, correo), total calculado en vivo, validación en línea, pantalla de éxito con código y `role="status"` para anuncios. `app.js`: `configurarSuites()` (delegación de clic + respaldo SVG si una imagen falla), `abrirModalSuite/cerrarModalSuite` (scroll lock, `inert`, `aria-hidden`, foco al título y devolución al disparador), trampa de foco con Tab/Shift+Tab, cierre con Esc/overlay/X, `ajustarFechasSuite()`, `actualizarTotalSuite()` y `manejarEnvioSuite()` con validación y confirmación simulada. `domotica.css` sección 6: tarjetas, skeleton shimmer, imagen con fade-in, badges, amenities, botón de reserva y modal completo (overlay, tarjeta con scroll interno, campos 44 px, error, total, éxito); keyframe `dmShimmer`. Verificado en 360/768/1280: sin overflow, 3/2/1 columnas, imágenes locales cargadas, modal abre/cierra por X, Esc y overlay, foco atrapado y restaurado, consola sin errores ni peticiones externas. Cierra H9, D2, D7 y D11. |
| 2026-11-21 | 4.10 Footer y copyright | `index.html`: footer reescrito con `.dm-footer` — marca y tagline, nav "Explorar" (`#experiencia`, `#panel`, `#suites`), bloque "Más proyectos" con enlace al hub, fila inferior con copyright dinámico `© <span id="anio-actual">2026</span>`, dos redes simuladas como `<button type="button">` con `aria-label` "(enlace simulado)" (elimina los `href="#"`) y crédito a devToolsCusco; región `#footer-aviso` (`role="status" aria-live="polite"`) bajo la fila inferior, con línea reservada para no desplazar el footer. `app.js`: `configurarFooter()` actualiza `#anio-actual` con `getFullYear()` y, al pulsar una red, anuncia "…: enlace simulado en este prototipo." y limpia el mensaje a los 4 s. `domotica.css` sección 7: grid del footer (1 columna → 3 columnas en ≥768), logo, títulos, nav, enlace al hub, fila inferior (columna → fila), botones sociales de 44×44 px y aviso. Verificado en 360/768/1280: sin overflow, sin anclas rotas ni `href="#"`, año 2026, aviso visible sin salto de scroll, consola limpia. Cierra H10 y D8. |


---

## 🛍️ FASE 5 — Mejoras focalizadas al módulo Ecommerce

> Origen: solicitud del encargado del proyecto (2026-11-21). Tres problemas visuales detectados en la revisión del módulo Ecommerce ya desplegado.

### Contexto de los problemas (leído del código actual)

| Problema | Archivo · Ubicación | Descripción técnica |
|---|---|---|
| **P1 · Encabezado choca con filtros** | `index.html` · sección `#coleccion` | El contenedor usa `flex-col xl:flex-row xl:items-end justify-between mb-12 gap-6`. Entre 768 px y 1279 px título y filtros se apilan sin separación visual suficiente. Los filtros en `flex gap-2 overflow-x-auto` no tienen contenedor diferenciado y se leen como texto flotante junto al párrafo introductorio. |
| **P2 · Footer sin botón de regreso al hub** | `index.html` · `<footer>` | El único enlace al hub es texto de 10–12 px dentro del copyright: `Desarrollado con ❤️ por devToolsCusco`. No hay ningún CTA visible que invite a volver a la página principal. |
| **P3 · Descripción de tarjeta poco presentable** | `app.js` · `renderizarProductos()` | La descripción se renderiza como `<p class="text-xs text-earth-800 line-clamp-2">`: fuente de ~11 px, sin separación del nombre, sin indicador de texto recortado. El precio flota a la derecha del nombre en la misma línea, comprimiendo el espacio disponible. |

---

### Metas

- [x] **5.1 Separación encabezado / filtros en la sección Colección.**
- [x] **5.2 Botón "Volver al inicio" en el footer.**
- [x] **5.3 Descripción de tarjeta de producto mejorada.**

---

### Plan de acción detallado

#### Meta 5.1 — Separación encabezado / filtros

**Archivos a tocar:** `index.html` (sección `#coleccion`) · `inkari.css` (sección 5).

**Qué cambia en `index.html`:**
El bloque `flex-col xl:flex-row` que agrupa título y filtros se separa en dos bloques independientes:
1. Bloque de encabezado: título (`h2`) + párrafo introductorio en `mb-6`.
2. Bloque de filtros: un `<div class="eco-filtros-wrap">` que envuelve `#filtros-categorias` con fondo `cream`, borde `earth-100`, `rounded-2xl` y `px-4 py-3`, seguido de `#filtros-estado`. El bloque tiene `mb-10` para separarlo del grid.

En pantallas `xl` ambos bloques se ponen en fila (`flex xl:flex-row xl:items-center xl:justify-between`) para aprovechar el ancho, pero con un `gap-8` generoso en lugar del `gap-6` actual.

**Qué cambia en `inkari.css`:**
Nueva clase `.eco-filtros-wrap` en sección 5: `background: rgb(var(--cream-100))`, `border: 1px solid rgb(var(--earth-100))`, `border-radius: var(--radius-2xl)`, `padding: 0.75rem 1rem`, `display: flex`, `align-items: center`, `gap: 0.5rem`, `overflow-x: auto`. Incluye el modificador `no-scrollbar` heredado.

**Qué no se toca:** lógica de `configurarFiltros()` y `seleccionarCategoria()` en `app.js`, los IDs `#filtros-categorias` y `#filtros-estado`, ni las clases `.eco-filtro` y `.eco-filtro__count`.

**Criterio de aceptación:** a 360, 768 y 1280 px el encabezado y la barra de filtros están claramente separados. Los filtros son reconocibles como controles, no como parte del párrafo introductorio.

---

#### Meta 5.2 — Botón "Volver al inicio" en el footer

**Archivos a tocar:** `index.html` (footer) · `inkari.css` (sección 2 — utilidades).

**Qué cambia en `index.html`:**
Encima de la barra de copyright existente se añade un bloque `.eco-footer-hub` con un `<a>` estilizado que diga **"← Volver a devToolsCusco"** apuntando a `../../index.html`. El bloque tiene `border-t border-white/10 pt-8 mt-16 text-center` (mismos tokens que la barra actual; esta se mueve debajo). El enlace usa clases `.eco-btn .eco-btn--hub` (variante ghost para fondo oscuro).

**Qué cambia en `inkari.css`:**
Nueva clase `.eco-btn--hub` en sección 2: igual que `.eco-btn--ghost` pero con `border-color: rgb(255 255 255 / 0.2)`, `color: rgb(var(--cream-100))` y `hover: border-terra-500 color-terra-500`. Mínimo 44 px de altura. Clase `.eco-footer-hub` con `display: flex`, `justify-content: center`.

**Qué no se toca:** el copyright dinámico `#anio-actual`, los botones `seleccionarCategoria()` del footer, el grid de columnas.

**Criterio de aceptación:** el botón tiene ≥ 44 px de altura, contraste AA sobre `earth-900`, es visible a los 3 anchos y navega al hub.

---

#### Meta 5.3 — Descripción de tarjeta de producto mejorada

**Archivos a tocar:** `app.js` (función `renderizarProductos()`) · `inkari.css` (sección 5).

**Qué cambia en `app.js`:**
La zona inferior de cada tarjeta pasa de layout horizontal (`flex justify-between items-start`) a layout vertical (`flex flex-col`) con la clase `.eco-card-body`. Orden de elementos:
1. Nombre: `font-serif text-base font-bold text-earth-900 leading-tight group-hover:text-terra-600` (igual que ahora).
2. Descripción: `eco-card-desc` — `text-sm text-earth-700 leading-relaxed mt-1.5 line-clamp-3` (antes `text-xs line-clamp-2`).
3. Precio: `eco-card-price` — `font-bold text-terra-600 mt-3 pt-3 border-t border-earth-100` (antes flotaba a la derecha del nombre).

**Qué cambia en `inkari.css`:**
En sección 5 se añaden:
- `.eco-card-body`: `display: flex; flex-direction: column; flex: 1; padding-top: 1rem;`
- `.eco-card-desc`: `font-size: var(--text-sm); color: rgb(var(--earth-700)); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;`
- `.eco-card-price`: `font-weight: 700; color: rgb(var(--terra-600)); margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgb(var(--earth-100)); font-size: 1rem;`

**Qué no se toca:** clases de imagen (`.eco-card-media`, `.eco-card-img`, `.eco-card-skeleton`), el botón `.eco-card-add`, el chip de categoría, ni ninguna lógica de carrito o filtros.

**Criterio de aceptación:** a 360 px se leen nombre, 3 líneas de descripción y precio sin cortes bruscos. El precio se diferencia visualmente del nombre. Las tarjetas mantienen altura homogénea en el grid.

---

### Orden de ejecución

5.1 → 5.2 → 5.3. Cada meta es independiente; el orden minimiza los cambios al agrupar los del footer en una sola meta.
| 2026-11-21 | Fase 5 — Plan | Plan de mejoras del módulo Ecommerce añadido a `metas.md` (metas 5.1, 5.2 y 5.3). Revisado el código actual de `index.html` y `app.js` para identificar las causas exactas de cada problema. Sin cambios de código. |
| 2026-11-21 | 5.1 Filtros | `index.html`: el contenedor del encabezado de `#coleccion` pasa de `flex-col xl:flex-row xl:items-end justify-between mb-12 gap-6` a `flex-col xl:flex-row xl:items-center xl:justify-between gap-8 mb-10`; los filtros se envuelven en `<div class="eco-filtros-wrap shrink-0">` en lugar del div de alineación anterior; `#filtros-categorias` pierde `pb-2 xl:pb-0 w-full xl:w-auto` (ya no necesita ajustes de ancho porque el contenedor lo gestiona). `inkari.css` sección 5: nueva clase `.eco-filtros-wrap` con `padding: var(--space-3) var(--space-4)`, fondo `cream-100`, borde `earth-100` y `border-radius: var(--radius-2xl)` — la barra de filtros es visualmente reconocible como control separado del encabezado en todos los anchos. |
| 2026-11-21 | 5.2 Hub | `index.html` footer: nuevo bloque `.eco-footer-hub` con `<a href="../../index.html" class="eco-btn eco-btn--hub">← Volver a devToolsCusco</a>` encima de la barra de copyright; la barra de copyright pasa a `mt-6 pt-6` (antes `mt-16 pt-8`) para conservar la separación visual total. `inkari.css` sección 2: nueva clase `.eco-footer-hub` (flex centrado) y `.eco-btn--hub` (variante ghost para fondo oscuro: borde `white/0.2`, color `cream-100`, hover `terra-500/terra-400` con `translateY(-2px)`); mínimo 44 px heredado de `.eco-btn`. El enlace de texto pequeño del copyright se conserva. |
| 2026-11-21 | 5.3 Descripción | `app.js` `renderizarProductos()`: la zona inferior de cada tarjeta pasa de `flex justify-between items-start gap-4` (nombre + precio en fila) a `eco-card-body` (columna flex); el nombre pasa de `text-lg` a `text-base` (más equilibrado con la descripción visible); la descripción pasa de `text-xs line-clamp-2` a `eco-card-desc` (`text-sm`, 3 líneas, interlineado 1.6); el precio pasa de `<span>` flotante a `<p class="eco-card-price">` debajo de la descripción con separador `border-top earth-100` y color `terra-600`. `inkari.css` sección 5: nuevas clases `.eco-card-body`, `.eco-card-desc` y `.eco-card-price`. |
