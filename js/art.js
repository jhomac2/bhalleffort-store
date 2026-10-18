// Ilustraciones brillantes tipo "juguete 3D" para las categorías.
// Se usan en las tarjetas y como imagen de respaldo del héroe cuando no hay WebGL.
import { uid } from './util.js';

const lg = (id, a, b, x1 = 0, y1 = 0, x2 = 1, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const sombra = (rx = 34) => `<ellipse cx="60" cy="112" rx="${rx}" ry="5" fill="#0F2547" opacity=".16"/>`;
const wrap = (inner, defs = '', cls = '') =>
  `<svg class="art ${cls}" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><defs>${defs}</defs>${inner}</svg>`;

const F = {
  ropa(cls) {
    const a = uid('g');
    return wrap(
      `${sombra(36)}
       <path d="M42 14 L19 27 L6 50 L26 61 L33 54 L33 104 H87 V54 L94 61 L114 50 L101 27 L78 14 C72 26 48 26 42 14Z" fill="url(#${a})"/>
       <path d="M42 14 C48 27 72 27 78 14 C73 21 47 21 42 14Z" fill="#0F2547" opacity=".28"/>
       <path d="M22 30 L43 17 C46 23 51 26 56 27 L31 54 L14 48Z" fill="#fff" opacity=".28"/>
       <rect x="50" y="56" width="20" height="12" rx="4" fill="#E3A82B"/>
       <path d="M33 54 L33 104 M87 54 L87 104" stroke="#0F2547" stroke-opacity=".12" stroke-width="2"/>`,
      lg(a, '#63B1F0', '#1E6FB8'), cls);
  },
  recargas(cls) {
    const a = uid('g'), b = uid('g'), c = uid('g');
    return wrap(
      `${sombra(24)}
       <rect x="32" y="8" width="56" height="102" rx="13" fill="url(#${a})"/>
       <rect x="37.5" y="15" width="45" height="88" rx="9" fill="url(#${b})"/>
       <rect x="52" y="18.5" width="16" height="3.6" rx="1.8" fill="#000" opacity=".45"/>
       <path d="M65 28 L46 64 H58 L53 94 L76 54 H63 Z" fill="url(#${c})"/>
       <path d="M36 14 H70 L46 110 H36Z" fill="#fff" opacity=".12"/>`,
      lg(a, '#5ADCE6', '#0E8F9A') + lg(b, '#143A6B', '#0A1A36', 0, 0, 0, 1) + lg(c, '#FFE18A', '#E3A82B'), cls);
  },
  digital(cls) {
    const a = uid('g'), b = uid('g');
    return wrap(
      `${sombra(40)}
       <rect x="9" y="20" width="102" height="70" rx="15" fill="url(#${a})"/>
       <rect x="15" y="26" width="90" height="58" rx="10" fill="url(#${b})"/>
       <path d="M51 41 V69 L77 55Z" fill="#fff" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>
       <rect x="42" y="94" width="36" height="7" rx="3.5" fill="#5238B8"/>
       <rect x="53" y="89" width="14" height="7" fill="#6C4CE0"/>
       <path d="M14 24 H62 L30 88 H14Z" fill="#fff" opacity=".14"/>`,
      lg(a, '#9B83F2', '#5C3FD2') + lg(b, '#2E1B7A', '#190F4A', 0, 0, 0, 1), cls);
  },
  rosas(cls) {
    const a = uid('g'), b = uid('g');
    return wrap(
      `${sombra(22)}
       <path d="M60 62 C57 82 63 96 60 112" stroke="#1F8F5F" stroke-width="5.5" fill="none" stroke-linecap="round"/>
       <path d="M60 94 C73 85 84 87 90 77 C88 93 74 100 60 98Z" fill="#2FB67C"/>
       <path d="M60 82 C47 76 38 79 32 69 C36 85 49 90 60 87Z" fill="#1F8F5F"/>
       <path d="M30 42 C28 18 92 18 90 42 C88 64 72 72 60 72 C48 72 32 64 30 42Z" fill="url(#${a})"/>
       <path d="M42 40 C42 26 78 26 78 40 C78 54 68 62 60 62 C52 62 42 54 42 40Z" fill="url(#${b})"/>
       <path d="M51 39 C51 31 69 31 69 39 C69 47 64 52 60 52 C56 52 51 47 51 39Z" fill="#C92A62"/>
       <path d="M55.5 41 C57 36 64 36 64 41.5 C64 46 58 47 57 43.5" fill="none" stroke="#7E1240" stroke-width="2.4" stroke-linecap="round"/>
       <path d="M33 34 C36 24 50 21 58 22 C46 26 38 33 36 44Z" fill="#fff" opacity=".3"/>`,
      lg(a, '#F27AA2', '#C92A62') + lg(b, '#FF9DBE', '#E8457C'), cls);
  },
  clases(cls) {
    const a = uid('g');
    return wrap(
      `${sombra(34)}
       <rect x="18" y="12" width="70" height="94" rx="9" fill="url(#${a})"/>
       <rect x="18" y="12" width="13" height="94" rx="6.5" fill="#0B6847"/>
       <rect x="43" y="30" width="36" height="24" rx="5" fill="#fff" opacity=".92"/>
       <text x="61" y="48" text-anchor="middle" font-size="15" font-weight="800" fill="#0F7F58" font-family="Bricolage Grotesque, system-ui, sans-serif">ABC</text>
       <rect x="43" y="64" width="36" height="4" rx="2" fill="#fff" opacity=".5"/>
       <rect x="43" y="73" width="26" height="4" rx="2" fill="#fff" opacity=".5"/>
       <path d="M22 20 H60 L30 100 H22Z" fill="#fff" opacity=".14"/>
       <g transform="rotate(32 98 74)">
         <rect x="93" y="30" width="11" height="62" rx="2.5" fill="#E3A82B"/>
         <rect x="93" y="25" width="11" height="9" rx="3" fill="#E8457C"/>
         <path d="M93 92 L98.5 108 L104 92Z" fill="#F4D8A8"/>
         <path d="M96.5 102 L98.5 108 L100.5 102Z" fill="#0F2547"/>
       </g>`,
      lg(a, '#3FC893', '#0F7F58'), cls);
  },
  sorteo(cls) {
    const a = uid('g'), b = uid('g');
    return wrap(
      `${sombra(38)}
       <rect x="20" y="54" width="80" height="54" rx="9" fill="url(#${a})"/>
       <rect x="13" y="40" width="94" height="21" rx="8" fill="url(#${b})"/>
       <rect x="53" y="40" width="14" height="68" fill="#E64B3C"/>
       <path d="M60 40 C42 14 24 26 38 40Z" fill="#F2553B"/>
       <path d="M60 40 C78 14 96 26 82 40Z" fill="#F2553B"/>
       <circle cx="60" cy="40" r="7" fill="#D93A1F"/>
       <path d="M24 58 H40 L28 106 H24Z" fill="#fff" opacity=".22"/>`,
      lg(a, '#FFD66B', '#E3A82B') + lg(b, '#FFE08C', '#EDB432'), cls);
  },
  promos(cls) {
    const a = uid('g');
    return wrap(
      `${sombra(36)}
       <path fill-rule="evenodd" d="M8 60 L38 22 A9 9 0 0 1 45 19 H98 A11 11 0 0 1 109 30 V90 A11 11 0 0 1 98 101 H45 A9 9 0 0 1 38 98 Z M29 60 a6.5 6.5 0 1 0 13 0 a6.5 6.5 0 1 0 -13 0Z" fill="url(#${a})"/>
       <text x="76" y="78" text-anchor="middle" font-size="54" font-weight="800" fill="#fff" font-family="Bricolage Grotesque, system-ui, sans-serif">%</text>
       <path d="M36 60 C24 44 14 34 12 14" stroke="#0F2547" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".55"/>
       <path d="M46 22 H100 L56 98 H46Z" fill="#fff" opacity=".14"/>`,
      lg(a, '#FF8A6B', '#D93A1F'), cls);
  },
  local(cls) {
    const a = uid('g');
    return wrap(
      `${sombra(36)}
       <path d="M60 8 C40 8 26 23 26 42 C26 66 60 106 60 106 C60 106 94 66 94 42 C94 23 80 8 60 8Z" fill="url(#${a})"/>
       <circle cx="60" cy="42" r="14" fill="#fff"/>
       <path d="M34 30 C38 18 50 12 60 12 C48 18 42 28 40 40Z" fill="#fff" opacity=".28"/>`,
      lg(a, '#5AA9EA', '#1E6FB8'), cls);
  },
};

export const art = (name, cls = '') => (F[name] ? F[name](cls) : '');
export const ART_NAMES = Object.keys(F);
