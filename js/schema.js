// Estructura de categorías de la tienda. La usan el sitio y el panel /admin/.
// "envio": fisico = cobra envío según reglas · digital = sin envío · acordar = se acuerda por WhatsApp

export const CATS = {
  ropa: {
    slug: 'ropa',
    nombre: 'Ropa',
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
    slug: 'digital',
    nombre: 'Streaming y Digital',
    bajada: 'IA, programas y entretenimiento',
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
    bajada: 'Por bonche, a Ecuador, Perú y Colombia',
    color: 'rose',
    envio: 'acordar',
    media: '3 / 4',
    subs: [],
  },
  clases: {
    slug: 'clases',
    nombre: 'Acompañamiento pedagógico',
    bajada: 'Apoyo escolar para EGB',
    color: 'green',
    envio: 'digital',
    media: '16 / 10',
    subs: [],
  },
};

export const CAT_ORDER = ['ropa', 'recargas', 'digital', 'rosas', 'clases'];

export function subNombre(cat, sub) {
  const c = CATS[cat];
  if (!c) return '';
  const f = c.subs.find((s) => s[0] === sub);
  return f ? f[1] : '';
}
