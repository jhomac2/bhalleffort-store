import { CONFIG } from './config.js';

// ── HTML seguro ─────────────────────────────────────────────────────
// Todo valor interpolado se escapa, salvo el resultado de otro html``.
class Safe {
  constructor(v) { this.v = v; }
  toString() { return this.v; }
}
const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => MAP[c]);
const one = (v) => {
  if (v instanceof Safe) return v.v;
  if (Array.isArray(v)) return v.map(one).join('');
  if (v === false || v == null) return '';
  return esc(v);
};
export const html = (strings, ...vals) => {
  let out = strings[0];
  for (let i = 0; i < vals.length; i++) out += one(vals[i]) + strings[i + 1];
  return new Safe(out);
};
export const raw = (s) => new Safe(String(s));

// ── DOM ─────────────────────────────────────────────────────────────
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ── Almacenamiento (puede fallar en modo privado) ───────────────────
export const store = {
  get(k, d = null) {
    try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; }
  },
  set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; }
  },
  del(k) { try { localStorage.removeItem(k); } catch { /* nada */ } },
};

// ── Formato ─────────────────────────────────────────────────────────
export const money = (n) => '$' + (Math.round(Number(n) * 100) / 100).toFixed(2);
export const norm = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;

// ── WhatsApp ────────────────────────────────────────────────────────
export const waLink = (msg = '') =>
  `https://wa.me/${CONFIG.whatsapp}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
export const waNumeroBonito = () => {
  const n = CONFIG.whatsapp;
  return n.startsWith('593') ? `+593 ${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}` : '+' + n;
};

// ── Preferencias del dispositivo ────────────────────────────────────
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const canHover = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

// ── Horario ─────────────────────────────────────────────────────────
const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
export const DIAS_ES = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves',
  viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};
export function ahoraEcuador() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CONFIG.zonaHoraria, weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const h = Number(get('hour')) % 24;
  const m = Number(get('minute'));
  return { dia: DIAS[wd], h, m, min: h * 60 + m };
}
export function estadoLocal() {
  const { dia, min } = ahoraEcuador();
  const [a, c] = CONFIG.horario[dia];
  const abierto = min >= a * 60 && min < c * 60;
  return { abierto, dia, abre: a, cierra: c };
}
export const hora12 = (h) => {
  const s = h >= 12 ? 'p. m.' : 'a. m.';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:00 ${s}`;
};
export function resumenHorario() {
  const h = CONFIG.horario;
  const sem = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const igual = sem.every((d) => h[d][0] === h.lunes[0] && h[d][1] === h.lunes[1]);
  const f = (a) => `${a[0]}:00 – ${a[1]}:00`;
  return igual
    ? `Lunes a sábado ${f(h.lunes)} · Domingo ${f(h.domingo)}`
    : sem.map((d) => `${DIAS_ES[d]} ${f(h[d])}`).join(' · ') + ` · Domingo ${f(h.domingo)}`;
}

// ── Utilidades varias ───────────────────────────────────────────────
export const uid = (() => { let n = 0; return (p = 'u') => `${p}${++n}`; })();
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
