// Estructura de categorías de la tienda. La usan el sitio y el panel /admin/.
// "envio": fisico = cobra envío según reglas · digital = sin envío · acordar = se acuerda por WhatsApp

export const CATS = {
  ropa: {
    slug: 'ropa',
    nombre: 'Ropa',
    banner: 'img/banners/ropa.webp',
    bajada: 'Hombre, mujer, niños y más',
    color: 'blue',
    envio: 'fisico',
    media: '3 / 4',
    subs: [
      ['hombre', 'Hombre'],
      ['mujer', 'Mujer'],
      ['ninos', 'Niños y Niñas'],
      ['varios', 'Varios'],
    ],
  },
  recargas: {
    slug: 'recargas',
    nombre: 'Recargas',
    banner: 'img/banners/recargas.webp',
    bajada: 'Celulares, videojuegos y Ecuabet',
    color: 'teal',
    envio: 'digital',
    media: '16 / 10',
    subs: [
      ['celulares', 'Celulares'],
      ['videojuegos', 'Videojuegos'],
      ['ecuabet', 'Ecuabet +18'],
    ],
  },
  digital: {
    slug: 'streaming',
    nombre: 'Streaming',
    banner: 'img/banners/streaming.webp',
    bajada: 'Cuentas, IA y programas al instante',
    color: 'violet',
    envio: 'digital',
    media: '16 / 9',
    subs: [
      ['ia', 'IA'],
      ['programas', 'Programas y Licencias'],
      ['video', 'Video y Entretenimiento'],
    ],
  },
  rosas: {
    slug: 'rosas',
    nombre: 'Rosas',
    banner: 'img/banners/rosas.webp',
    bajada: 'Por bonche, a Ecuador, Perú y Colombia',
    color: 'rose',
    envio: 'acordar',
    media: '3 / 4',
    subs: [],
  },
  clases: {
    slug: 'estudiantil',
    nombre: 'Acompañamiento estudiantil',
    banner: 'img/banners/estudiantil.webp',
    bajada: 'Apoyo escolar para EGB',
    color: 'green',
    envio: 'digital',
    media: '16 / 10',
    subs: [],
  },
};

export const CAT_ORDER = ['ropa', 'recargas', 'digital', 'rosas', 'clases'];

// Las claves internas (digital, clases) no cambian para no tocar productos.json.
// Lo que ve el cliente (nombre y dirección web) es el "slug" y el "nombre".
export const catPorSlug = (s) => CAT_ORDER.find((k) => CATS[k].slug === s || k === s) || null;
export const ruta = (k) => `#/${CATS[k]?.slug || k}`;

// Banners de las páginas que no son categoría
export const BANNERS_EXTRA = {
  inicio: { nombre: 'Inicio (primera lámina)', banner: 'img/banners/inicio.webp' },
  promociones: { nombre: 'Promociones', banner: 'img/banners/promociones.webp' },
  sorteo: { nombre: 'Sorteo mensual', banner: 'img/banners/sorteo.webp' },
  vende: { nombre: 'Vende con nosotros', banner: 'img/banners/vende.webp' },
};
// Lista completa de banners (la usa el panel para mostrar dónde cambiar cada uno)
export const BANNERS = [
  ...CAT_ORDER.map((k) => ({ k: CATS[k].slug, nombre: CATS[k].nombre, ruta: CATS[k].banner })),
  ...Object.entries(BANNERS_EXTRA).map(([k, v]) => ({ k, nombre: v.nombre, ruta: v.banner })),
];

export function subNombre(cat, sub) {
  const c = CATS[cat];
  if (!c) return '';
  const f = c.subs.find((s) => s[0] === sub);
  return f ? f[1] : '';
}

// Icono de línea de cada sección (nombres de js/icons.js)
export const ICONO = {
  ropa: 'shirt', recargas: 'smartphone', digital: 'clapperboard', rosas: 'flower-2',
  clases: 'graduation-cap', promos: 'badge-percent', sorteo: 'ticket', vende: 'store',
};
