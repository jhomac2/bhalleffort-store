import { CATS } from './schema.js';
import { norm } from './util.js';
import { CONFIG } from './config.js';

let LISTA = [];
let listo = null;

function normalizar(p) {
  return {
    ...p,
    id: String(p.id),
    precio: Number(p.precio) || 0,
    precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
    imagenes: Array.isArray(p.imagenes) ? p.imagenes.filter(Boolean) : [],
    opciones: Array.isArray(p.opciones) ? p.opciones : [],
    campos: Array.isArray(p.campos) ? p.campos : [],
    tallas: Array.isArray(p.tallas) ? p.tallas : [],
  };
}

export function cargar() {
  if (!listo) {
    listo = fetch('productos.json', { cache: 'no-cache' })
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((arr) => {
        LISTA = arr.filter((p) => p && p.visible !== false && CATS[p.cat]).map(normalizar);
        return LISTA;
      });
  }
  return listo;
}

export const todos = () => LISTA;
export const porId = (id) => LISTA.find((p) => p.id === String(id));

// ── Fechas y promociones ────────────────────────────────────────────
function hoyEC() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: CONFIG.zonaHoraria }).format(new Date()); // AAAA-MM-DD
}
export function promoActiva(p) {
  if (!p.oferta || !p.precio_antes || p.precio_antes <= p.precio) return false;
  if (p.promo_hasta && hoyEC() > p.promo_hasta) return false;
  return true;
}
export const descuentoPct = (p) =>
  promoActiva(p) ? Math.round((1 - p.precio / p.precio_antes) * 100) : 0;

export function precioDesde(p) {
  if (p.opciones.length) return Math.min(...p.opciones.map((o) => Number(o.precio) || 0));
  return p.precio;
}
export const tieneVariantes = (p) =>
  p.opciones.length > 0 || p.tallas.length > 1 || p.campos.length > 0;

// ── Consultas ───────────────────────────────────────────────────────
export const promos = () => LISTA.filter(promoActiva);
export const porCategoria = (cat, sub) =>
  LISTA.filter((p) => p.cat === cat && (!sub || p.sub === sub));

export function destacados(n = 8, cat = 'ropa') {
  const base = LISTA.filter((p) => p.cat === cat && !p.agotado);
  return [...base.filter((p) => p.nuevo), ...base.filter((p) => !p.nuevo)].slice(0, n);
}

export function buscar(q) {
  const tokens = norm(q).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const res = [];
  for (const p of LISTA) {
    const cat = CATS[p.cat];
    const sub = cat.subs.find((s) => s[0] === p.sub)?.[1] || '';
    const campoNombre = norm(p.nombre);
    const campoResto = norm([p.descripcion, p.grupo, p.para, p.operador, cat.nombre, sub].join(' '));
    let score = 0;
    let ok = true;
    for (const t of tokens) {
      if (campoNombre.startsWith(t)) score += 6;
      else if (campoNombre.includes(t)) score += 4;
      else if (campoResto.includes(t)) score += 1;
      else { ok = false; break; }
    }
    if (ok) res.push([score, p]);
  }
  return res.sort((a, b) => b[0] - a[0]).map((r) => r[1]);
}

// ── Imágenes ────────────────────────────────────────────────────────
export const imgPrincipal = (p) => p.imagenes[0] || '';
export const imgSecundaria = (p) => p.imagenes[1] || '';
