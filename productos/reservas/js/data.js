/* =========================================================
   data.js — Datos base de "El Rinconcito Cusqueño"
   ========================================================= */

const PLATOS_INICIALES = [
  {
    id: 'p1',
    nombre: 'Cuy Chactado',
    descripcion: 'Tierno cuy frito a la leña, acompañado de papas doradas y ensalada fresca con hierbas de la zona.',
    precio: 48.00,
    categoria: 'Especialidad',
    imagen: 'img/cuy-chactado.webp'
  },
  {
    id: 'p2',
    nombre: 'Lomo Saltado',
    descripcion: 'Jugosos trozos de res salteados al wok con cebolla, tomate y ají amarillo. Servido con papas fritas y arroz.',
    precio: 38.00,
    categoria: 'Extras',
    imagen: 'img/lomo.jpg'
  },
  {
    id: 'p3',
    nombre: 'Chicha Morada',
    descripcion: 'Refrescante bebida tradicional a base de maíz morado, piña, canela y clavo.',
    precio: 12.00,
    categoria: 'Bebida',
    imagen: 'img/chicha-moradita.jpg'
  },
  {
    id: 'p4',
    nombre: 'Caldo Criollo',
    descripcion: 'Reconfortante caldo de res con hierbas andinas, fideo cabello de ángel y un toque de limón.',
    precio: 25.00,
    categoria: 'Sopas',
    imagen: 'img/caldo.jpg'
  }
];

const CLAVE_PLATOS = 'rinconcito_platos';

/* Normaliza rutas de assets guardadas por versiones anteriores:
   .jpe → .jpg  y  img/lomo.png → img/lomo.jpg. */
function normalizarRutasPlatos(platos) {
  let cambios = false;

  platos.forEach((plato) => {
    if (!plato || typeof plato.imagen !== 'string') return;

    const normalizada = plato.imagen
      .replace(/\.jpe$/i, '.jpg')
      .replace(/^img\/lomo\.png$/i, 'img/lomo.jpg');

    if (normalizada !== plato.imagen) {
      plato.imagen = normalizada;
      cambios = true;
    }
  });

  return cambios;
}

/* Guarda los platos iniciales si no existen y migra las rutas antiguas. */
const platosGuardados = localStorage.getItem(CLAVE_PLATOS);

if (!platosGuardados) {
  localStorage.setItem(CLAVE_PLATOS, JSON.stringify(PLATOS_INICIALES));
} else {
  try {
    const platos = JSON.parse(platosGuardados);
    if (Array.isArray(platos) && normalizarRutasPlatos(platos)) {
      localStorage.setItem(CLAVE_PLATOS, JSON.stringify(platos));
    }
  } catch (error) {
    console.warn('No se pudieron normalizar los platos guardados:', error);
  }
}
