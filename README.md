# devToolsCusco — Hub tecnológico y prototipos

Hub tecnológico y aceleradora de talento del Cusco. Digitalizamos PyMEs turísticas
con **software a medida** e **infraestructura inteligente (domótica)**.

El repositorio reúne una **presentación corporativa** y una **vitrina interactiva** de
tres prototipos funcionales, todos construidos sin dependencias de build.

## 🎯 Propósito

Conectar a clientes (hoteles boutique, lodges, restaurantes) con los prototipos de:

- 🍽️ **Sistema de Reservas** → [`productos/reservas/index.html`](productos/reservas/index.html)
- 🛍️ **E-commerce artesanal** → [`productos/ecommerce/index.html`](productos/ecommerce/index.html)
- 🏠 **Panel Domótico** → [`productos/domotica/index.html`](productos/domotica/index.html)

Cada módulo tiene una identidad visual propia y comparte la misma base de estructura,
espaciado, componentes y reglas de accesibilidad.

## 📁 Estructura del proyecto

```
devToolsCusco/
├── index.html                     ← Hub principal (presentación + vitrina)
├── metas.md                       ← Hoja de ruta del rediseño y registro de avance
├── README.md
├── assets/
│   ├── css/styles.css             ← Tokens de diseño, componentes ds- y estilos del hub
│   ├── js/main.js                 ← Menú móvil, header, contadores, reveal, tilt, volver arriba
│   └── img/                       ← cusco-view.jpg, favicon.svg
└── productos/
    ├── reservas/
    │   ├── index.html             ← Sitio público del restaurante
    │   ├── admin.html             ← Panel de administración (demo)
    │   ├── css/restaurante.css
    │   ├── js/{app,admin,data}.js
    │   └── img/                   ← Platos y vistas (jpg, webp)
    ├── ecommerce/
    │   ├── index.html             ← Tienda Inkari Art
    │   ├── css/inkari.css
    │   └── js/{app,data}.js
    └── domotica/
        ├── index.html             ← Suite domótica Inkari Hotel
        ├── css/domotica.css
        └── js/app.js
```

## 🧩 Módulos

| Módulo | Página | Identidad | Funcionalidad principal |
|---|---|---|---|
| **Hub** | `index.html` | Verde esmeralda + tinta · Sora + Inter | Hero, servicios, vitrina de prototipos, impacto social, contacto |
| **Reservas** | `productos/reservas/index.html` | Criollo cálido (adobe, maíz, huerto) · Playfair Display + Lora + Inter | Carta generada por JS, espacios, formulario de reservas, chatbot visual |
| **Admin de Reservas** | `productos/reservas/admin.html` | Misma identidad criolla | Acceso demo (dueño/vendedor), resumen, gestión de platos y reservas |
| **E-commerce** | `productos/ecommerce/index.html` | Artesanal cusqueña (crema, tierra, terracota, dorado) · Playfair Display + Inter | Catálogo, carrito lateral con cantidades, subtotal y toast |
| **Domótica** | `productos/domotica/index.html` | Oscuro tecnológico (negro, cian neón) · Outfit + Inter | Panel interactivo de luces, climatización y seguridad; sección de suites |

> Los datos de los prototipos son **simulados y locales** (ver “Persistencia”).
> No hay backend, autenticación real ni pasarela de pagos.

## 🛠️ Stack

- **HTML5 semántico**
- **Tailwind CSS vía CDN**, con `tailwind.config` inline en cada página
- **CSS propio** para tokens, componentes y animaciones (`assets/css/styles.css`)
- **JavaScript vanilla** (`assets/js/main.js` y los `js/` de cada módulo)
- **Google Fonts**: Sora + Inter en el hub; Playfair Display, Lora, Outfit e Inter en los módulos
- **Cero dependencias de build** — el proyecto es 100 % portátil

## 🎨 Sistema de diseño

Los **design tokens** del hub se definen en `:root` dentro de `assets/css/styles.css`
(base del sistema de diseño):

- **Color:** escala de marca `--brand-50…900`, tinta (`--ink-*`), acentos (`--sky-*`,
  `--terra-*`, `--warm`) y estados (éxito, aviso, error). Los colores se guardan como
  **canales RGB** para poder usarlos con `rgb(var(--brand-500) / 0.2)` y con el
  `<alpha-value>` de Tailwind.
- **Tipografía:** familias display + cuerpo y escala fluida con `clamp()`
  (`--text-h1`, `--text-h2`, `--text-h3`, `--text-lg`).
- **Espaciado y layout:** escala de 4 px (`--space-1…24`), `--container`, `--gutter`,
  `--section-y` y `--header-h`.
- **Forma y profundidad:** radios (`--radius-*`), sombras (`--shadow-*`) y `--shadow-glow`.
- **Movimiento:** `--ease-out` y duraciones `--dur-fast/base/slow`, con respeto a
  `prefers-reduced-motion`.

**Componentes reutilizables** (prefijo `ds-` en `styles.css`): contenedor y sección,
botones (`ds-btn--primary/--secondary/--ghost/--sky/--light`), badges, tarjetas,
checklists y utilidades tipográficas (`ds-h1`, `ds-h2`, `ds-h3`, `ds-lead`).

**Identidades por módulo:** cada página conserva su paleta y tipografía, pero comparte
estructura, espaciado, formas y componentes con el hub. Hoy solo el hub consume los
tokens de `styles.css` (su `tailwind.config` incluye la escala `brand` completa); cada
módulo define los suyos en su propia hoja (Reservas ya lo hace; Ecommerce y Domótica se
alinean en las Fases 3 y 4).

### Reglas de calidad

- Enfoque **mobile-first**; revisión a 360 px, 768 px y 1280 px.
- Contraste **AA**, foco visible, `alt` en imágenes y `aria-*` en menús y paneles.
- Imágenes con `loading="lazy"`, dimensiones y rutas **relativas**.
- Sin enlaces `#` vacíos ni anclas rotas.
- Se mantiene la lógica JS existente salvo que una meta indique lo contrario.

## 🚀 Cómo ejecutar

No requiere instalación ni compilación.

```bash
# Opción 1: abrir index.html directamente en el navegador
# Opción 2 (recomendada): servir desde la raíz del proyecto
python -m http.server 8000
# Luego abrir http://localhost:8000
```

Servir desde la raíz mantiene las rutas de los módulos igual que en producción.
También funciona cualquier servidor estático (Live Server, `npx serve`, etc.).

## 💾 Persistencia (solo demo)

Los prototipos guardan su estado en `localStorage` del navegador:

| Clave | Módulo | Contenido |
|---|---|---|
| `rinconcito_sesion` | Reservas · admin | Rol de la sesión demo (`admin` / vendedor) |
| `rinconcito_platos` | Reservas | Platos creados o modificados desde el panel |
| `rinconcito_reservas` | Reservas | Reservas creadas desde el sitio público |
| `inkari_carrito` | E-commerce | Ítems y cantidades del carrito |

Para reiniciar los datos de demostración, basta con borrar esas claves desde las
herramientas de desarrollo del navegador.

## 🗺️ Estado del proyecto

La hoja de ruta completa vive en [`metas.md`](metas.md), con el registro de avance meta
por meta.

- **Fase 1 — Hub principal:** cerrada (tokens, header, hero, secciones, footer,
  micro-interacciones, SEO, README y QA a 360 / 768 / 1280 px).
- **Fases 2–4 — Reservas, E-commerce y Domótica:** planificadas; incluyen menús móviles,
  limpieza de CSS, corrección de rutas de imágenes y mejoras de accesibilidad.

## 📬 Contacto

- **Correo:** hola@devtoolscusco.pe
- **Ubicación:** Cusco, Perú
