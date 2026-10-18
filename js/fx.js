// Efectos de interfaz: inclinación 3D, aparición al hacer scroll, volteo de fotos.
import { canHover, reducedMotion, clamp } from './util.js';

// ── Inclinación 3D con suavizado ────────────────────────────────────
// Un solo oyente delegado. Solo con puntero fino (ratón/trackpad) y sin
// "reducir movimiento". Escribe transform directamente en el elemento
// (no en variables CSS heredadas) para no recalcular estilos de los hijos.
export function initTilt() {
  if (!canHover() || reducedMotion()) return;
  const S = new Map(); // el -> estado
  let activo = null;
  let raf = 0;

  const estado = (el) => {
    let s = S.get(el);
    if (!s) {
      s = { rx: 0, ry: 0, tx: 0, ty: 0, max: Number(el.dataset.tilt) || 7, glare: el.querySelector('.tile-glare'), rect: null, vivo: false };
      S.set(el, s);
    }
    return s;
  };
  const loop = () => {
    raf = 0;
    let sigue = false;
    for (const [el, s] of S) {
      if (!s.vivo) continue;
      s.rx += (s.tx - s.rx) * 0.16;
      s.ry += (s.ty - s.ry) * 0.16;
      const quieto = Math.abs(s.rx - s.tx) < 0.02 && Math.abs(s.ry - s.ty) < 0.02;
      if (s.tx === 0 && s.ty === 0 && quieto) {
        el.style.transform = '';
        s.vivo = false;
        continue;
      }
      el.style.transform = `perspective(1000px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;
      sigue = true;
    }
    if (sigue) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    const el = e.target.closest?.('[data-tilt]');
    if (!el || el === activo) return;
    if (activo) soltar(activo);
    activo = el;
    const s = estado(el);
    s.rect = el.getBoundingClientRect();
    s.vivo = true;
    kick();
  });
  document.addEventListener('pointermove', (e) => {
    if (!activo || (e.pointerType !== 'mouse' && e.pointerType !== 'pen')) return;
    const s = estado(activo);
    const r = s.rect;
    if (!r) return;
    const px = clamp((e.clientX - r.left) / r.width, 0, 1);
    const py = clamp((e.clientY - r.top) / r.height, 0, 1);
    s.ty = (px - 0.5) * 2 * s.max;
    s.tx = -(py - 0.5) * 2 * s.max;
    if (s.glare) { s.glare.style.setProperty('--gx', px * 100 + '%'); s.glare.style.setProperty('--gy', py * 100 + '%'); }
    kick();
  }, { passive: true });
  document.addEventListener('pointerout', (e) => {
    if (!activo) return;
    if (e.relatedTarget && activo.contains(e.relatedTarget)) return;
    soltar(activo);
    activo = null;
  });
  window.addEventListener('scroll', () => { if (activo) { const s = estado(activo); s.rect = activo.getBoundingClientRect(); } }, { passive: true });

  function soltar(el) {
    const s = estado(el);
    s.tx = 0; s.ty = 0;
    kick();
  }
}

// ── Aparición al hacer scroll ───────────────────────────────────────
let io = null;
export function revelar(root = document) {
  const els = [...root.querySelectorAll('.reveal:not(.in)')];
  if (!els.length) return;
  if (!('IntersectionObserver' in window) || reducedMotion()) {
    els.forEach((e) => e.classList.add('in'));
    return;
  }
  io ||= new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
  els.forEach((e) => io.observe(e));
}

// ── Volteo de fotos (frente/espalda) ────────────────────────────────
export function voltear(btn) {
  const wrap = btn.closest('[data-flipwrap]');
  const flip = wrap?.querySelector('.flip');
  if (!flip) return;
  const back = flip.querySelector('.face.back img[data-src]');
  if (back) { back.src = back.dataset.src; back.removeAttribute('data-src'); }
  const on = flip.classList.toggle('is-flipped');
  btn.setAttribute('aria-pressed', String(on));
  btn.setAttribute('aria-label', on ? 'Ver foto frontal' : 'Ver otra foto');
}

// ── Vuelo al carrito ────────────────────────────────────────────────
export function volarAlCarrito(origen, imgSrc, inicial = '') {
  const dest = document.querySelector('.cart-btn');
  if (!origen || !dest || reducedMotion()) return;
  const a = origen.getBoundingClientRect();
  const b = dest.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'fly';
  el.innerHTML = imgSrc ? `<img alt="" src="${imgSrc}">` : `<span>${inicial}</span>`;
  document.body.append(el);
  const x0 = a.left + a.width / 2 - 27, y0 = a.top + a.height / 2 - 27;
  const x1 = b.left + b.width / 2 - 27, y1 = b.top + b.height / 2 - 27;
  el.style.left = '0'; el.style.top = '0';
  const mid = { x: (x0 + x1) / 2, y: Math.min(y0, y1) - 90 };
  const anim = el.animate([
    { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1 },
    { transform: `translate(${mid.x}px, ${mid.y}px) scale(0.8)`, opacity: 1, offset: 0.5 },
    { transform: `translate(${x1}px, ${y1}px) scale(0.28)`, opacity: 0.4 },
  ], { duration: 620, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' });
  anim.onfinish = () => {
    el.remove();
    dest.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
  };
}

// ── Avisos ──────────────────────────────────────────────────────────
export function aviso(texto, accion) {
  let cont = document.getElementById('toasts');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'toasts'; cont.className = 'toasts';
    cont.setAttribute('role', 'status'); cont.setAttribute('aria-live', 'polite');
    document.body.append(cont);
  }
  const t = document.createElement('div');
  t.className = 'toast'; t.dataset.s = 'in';
  t.innerHTML = `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg><span></span>`;
  t.querySelector('span').textContent = texto;
  if (accion) {
    const b = document.createElement('button');
    b.textContent = accion.texto;
    b.addEventListener('click', () => { accion.fn(); cerrar(); });
    t.append(b);
  }
  while (cont.children.length >= 2) cont.firstElementChild.remove();
  cont.append(t);
  requestAnimationFrame(() => requestAnimationFrame(() => { t.dataset.s = 'on'; }));
  const timer = setTimeout(cerrar, 2800);
  function cerrar() {
    clearTimeout(timer);
    t.dataset.s = 'out';
    setTimeout(() => t.remove(), 200);
  }
}
