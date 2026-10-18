import { CONFIG } from './config.js';
import { CATS } from './schema.js';
import { porId, precioDesde } from './data.js';
import { html, esc, money, store, waLink, $, raw } from './util.js';
import { icon } from './icons.js';
import { art } from './art.js';
import { aviso } from './fx.js';

const KEY = 'bh-cart-v2';
const KEY_CLIENTE = 'bh-cliente';

let lineas = store.get(KEY, []);
if (!Array.isArray(lineas)) lineas = [];

const emitir = () => document.dispatchEvent(new CustomEvent('cart:change'));
const guardar = () => { store.set(KEY, lineas); emitir(); };
window.addEventListener('storage', (e) => {
  if (e.key === KEY) { lineas = store.get(KEY, []) || []; emitir(); if (dlg?.open) render(); }
});

const claveLinea = (id, talla, opcion, campos) =>
  [id, talla || '', opcion || '', JSON.stringify(campos || {})].join('|');

// ── Estado del carrito ──────────────────────────────────────────────
export const cart = {
  items() {
    const out = [];
    for (const l of lineas) {
      const p = porId(l.id);
      if (!p) continue;
      let precio = p.precio;
      if (l.opcion) {
        const o = p.opciones.find((x) => x.nombre === l.opcion);
        if (o) precio = Number(o.precio) || 0;
      } else if (p.opciones.length) precio = precioDesde(p);
      out.push({ ...l, p, precio, subtotal: Math.round(precio * l.qty * 100) / 100 });
    }
    return out;
  },
  count() { return lineas.reduce((n, l) => n + l.qty, 0); },
  add(p, { qty = 1, talla = '', opcion = '', campos = {} } = {}) {
    const k = claveLinea(p.id, talla, opcion, campos);
    const ya = lineas.find((l) => l.k === k);
    if (ya) ya.qty = Math.min(99, ya.qty + qty);
    else lineas.push({ k, id: p.id, qty, talla, opcion, campos });
    guardar();
  },
  setQty(k, q) {
    const l = lineas.find((x) => x.k === k);
    if (!l) return;
    if (q <= 0) lineas = lineas.filter((x) => x.k !== k);
    else l.qty = Math.min(99, q);
    guardar();
  },
  remove(k) { lineas = lineas.filter((x) => x.k !== k); guardar(); },
  clear() { lineas = []; guardar(); },

  totales() {
    const it = this.items();
    const subtotal = it.reduce((s, l) => s + l.subtotal, 0);
    const envios = it.map((l) => CATS[l.p.cat].envio);
    const hayFisico = envios.includes('fisico');
    const hayRosas = envios.includes('acordar');
    const baseEnvio = it.filter((l) => CATS[l.p.cat].envio !== 'acordar').reduce((s, l) => s + l.subtotal, 0);
    const { costo, gratisDesde } = CONFIG.envio;
    const envio = hayFisico ? (baseEnvio >= gratisDesde ? 0 : costo) : 0;
    const sorteoOn = CONFIG.sorteo.activo;
    const min = CONFIG.sorteo.minimo;
    return {
      items: it, subtotal, envio, total: subtotal + envio, hayFisico, hayRosas,
      gratisFalta: Math.max(0, gratisDesde - baseEnvio), gratisOk: baseEnvio >= gratisDesde,
      sorteoOn, sorteoOk: sorteoOn && subtotal >= min, sorteoFalta: Math.max(0, min - subtotal),
      adultos: it.some((l) => l.p.edad >= 18),
      baseEnvio,
    };
  },
};

// ── Mensaje de WhatsApp ─────────────────────────────────────────────
function mensaje(c, f) {
  const t = c;
  const L = [];
  L.push('*Pedido BHALLEFFORT*', '');
  L.push(`*Cliente:* ${f.nombre}`);
  if (f.provincia) L.push(`*Provincia:* ${f.provincia}`);
  if (f.direccion) L.push(`*Dirección / ciudad:* ${f.direccion}`);
  if (f.pais) L.push(`*País de destino (rosas):* ${f.pais}`);
  L.push('', '*Productos*');
  t.items.forEach((l, i) => {
    const partes = [l.p.nombre];
    if (l.talla) partes.push(`Talla ${l.talla}`);
    if (l.opcion) partes.push(l.opcion);
    for (const c2 of l.p.campos) if (l.campos[c2.id]) partes.push(`${c2.etiqueta}: ${l.campos[c2.id]}`);
    if (l.campos.nota) partes.push(`Detalle: ${l.campos.nota}`);
    const unidad = l.p.cat === 'rosas' ? (l.qty === 1 ? 'bonche' : 'bonches') : '';
    L.push(`${i + 1}. ${partes.join(' · ')} · ${l.qty}${unidad ? ' ' + unidad : ''} × ${money(l.precio)} = ${money(l.subtotal)}`);
  });
  L.push('', `Subtotal: ${money(t.subtotal)}`);
  if (t.hayFisico) L.push(`Envío (ropa): ${t.envio === 0 ? 'Gratis' : money(t.envio)}`);
  if (t.hayRosas) L.push('Envío de rosas: por acordar contigo');
  L.push(`*Total a pagar: ${money(t.total)}*`);
  if (t.sorteoOk) L.push('', `Sorteo Mensual: sí quiero participar (compra desde ${money(CONFIG.sorteo.minimo)}).`);
  if (t.adultos) L.push('Declaro que soy mayor de 18 años.');
  L.push('', `Entiendo que el pago se hace únicamente a nombre de ${CONFIG.pago.titular}.`);
  return L.join('\n');
}

// ── Interfaz del carrito ────────────────────────────────────────────
let dlg = null;

export function initCart() {
  dlg = document.getElementById('cart-dlg');
  dlg.addEventListener('click', (e) => { if (e.target === dlg) cerrar(); });
  dlg.addEventListener('close', () => document.documentElement.classList.remove('lock'));
  dlg.addEventListener('click', onClick);
  dlg.addEventListener('input', onInput);
  dlg.addEventListener('change', onInput);
  document.addEventListener('cart:change', () => { actualizarContador(); if (dlg.open) render(); });
  actualizarContador();
  arrastrarParaCerrar();
}

export function abrirCarrito() {
  render();
  if (!dlg.open) dlg.showModal();
  document.documentElement.classList.add('lock');
}
export function cerrar() { dlg.close(); }

function actualizarContador() {
  const n = cart.count();
  const el = document.getElementById('cart-count');
  if (!el) return;
  el.textContent = n > 99 ? '99+' : String(n);
  el.dataset.n = String(n);
  document.querySelector('.cart-btn')?.setAttribute('aria-label', `Carrito, ${n} ${n === 1 ? 'producto' : 'productos'}`);
  const fl = document.getElementById('fab-cart');
  if (fl) {
    fl.dataset.n = String(n);
    fl.setAttribute('aria-label', `Ver carrito, ${n} ${n === 1 ? 'producto' : 'productos'}`);
    const b = fl.querySelector('b');
    if (b) b.textContent = n > 99 ? '99+' : String(n);
    fl.tabIndex = n ? 0 : -1;
    fl.setAttribute('aria-hidden', n ? 'false' : 'true');
  }
}

function cliente() { return store.get(KEY_CLIENTE, {}) || {}; }

function render() {
  const t = cart.totales();
  const cli = cliente();
  const body = dlg.querySelector('.drawer-in');
  const scrollPrev = dlg.querySelector('.dr-body')?.scrollTop || 0;
  if (!t.items.length) {
    body.innerHTML = html`
      <div class="dr-head"><h2>Tu carrito</h2>
        <button class="icon-btn" data-act="cerrar" aria-label="Cerrar carrito">${raw(icon('x'))}</button></div>
      <div class="dr-body"><div class="dr-empty">${raw(art('ropa'))}
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos y envía tu pedido por WhatsApp.</p>
        <a class="btn btn-primary" href="#/ropa" data-act="cerrar">Ver productos</a></div></div>`.toString();
    return;
  }
  const falta = t.gratisFalta;
  const barras = [];
  if (t.sorteoOn) {
    const p = Math.min(1, t.subtotal / CONFIG.sorteo.minimo);
    barras.push(t.sorteoOk
      ? html`<div class="bar done" role="status"><b>¡Ya estás participando en el Sorteo Mensual!</b>Tu número del 1 al ${CONFIG.sorteo.numeroMaximo} te lo enviamos por WhatsApp.</div>`
      : html`<div class="bar gold"><span>Te faltan <b>${money(t.sorteoFalta)}</b> para participar en el <b>Sorteo Mensual</b></span>
          <div class="track" role="progressbar" aria-label="Avance hacia el número del sorteo" aria-valuemin="0" aria-valuemax="${CONFIG.sorteo.minimo}" aria-valuenow="${t.subtotal.toFixed(2)}"><i style="--p:${p}"></i></div></div>`);
  }
  if (t.hayFisico) {
    const p = Math.min(1, t.baseEnvio / CONFIG.envio.gratisDesde);
    barras.push(t.gratisOk
      ? html`<div class="bar done" role="status"><b>¡Envío gratis!</b>Tu pedido de ropa supera ${money(CONFIG.envio.gratisDesde)}.</div>`
      : html`<div class="bar"><span>Te faltan <b>${money(falta)}</b> para <b>envío gratis</b></span>
          <div class="track" role="progressbar" aria-label="Avance hacia el envío gratis" aria-valuemin="0" aria-valuemax="${CONFIG.envio.gratisDesde}" aria-valuenow="${t.baseEnvio.toFixed(2)}"><i style="--p:${p}"></i></div></div>`);
  }
  const lineasHtml = t.items.map((l) => {
    const cat = CATS[l.p.cat];
    const v = [];
    if (l.talla) v.push(`Talla ${l.talla}`);
    if (l.opcion) v.push(l.opcion);
    for (const c of l.p.campos) if (l.campos[c.id]) v.push(`${c.etiqueta}: ${l.campos[c.id]}`);
    if (l.campos.nota) v.push(l.campos.nota);
    const thumb = l.p.imagenes[0]
      ? html`<img src="${l.p.imagenes[0]}" alt="" loading="lazy" decoding="async">`
      : html`<b>${l.p.nombre.slice(0, 1)}</b>`;
    return html`<article class="line" data-color="${cat.color}" ${l.p.color ? raw(`style="--c:${esc(l.p.color)}"`) : ''}>
      <div class="line-img" ${!l.p.imagenes[0] ? raw(`style="background:${esc(l.p.color || '#1e6fb8')}"`) : ''}>${thumb}</div>
      <div>
        <h3>${l.p.nombre}</h3>
        ${v.length ? html`<div class="v">${v.join(' · ')}</div>` : ''}
        ${l.p.cat === 'rosas' ? html`<div class="v">Precio por bonche</div>` : ''}
        <div class="line-foot">
          <div class="qty" role="group" aria-label="Cantidad de ${l.p.nombre}">
            <button data-act="menos" data-k="${l.k}" aria-label="Quitar uno">${raw(icon('minus'))}</button>
            <output>${l.qty}</output>
            <button data-act="mas" data-k="${l.k}" aria-label="Agregar uno">${raw(icon('plus'))}</button>
          </div>
          <span class="line-price">${money(l.subtotal)}</span>
          <button class="rm" data-act="quitar" data-k="${l.k}" aria-label="Eliminar ${l.p.nombre}">${raw(icon('trash-2'))}</button>
        </div>
      </div></article>`;
  });
  const prov = CONFIG.provincias.map((p) => html`<option ${cli.provincia === p ? raw('selected') : ''}>${p}</option>`);
  const pais = CONFIG.envio.paisesRosas.map((p) => html`<option ${cli.pais === p ? raw('selected') : ''}>${p}</option>`);
  body.innerHTML = html`
    <div class="dr-head" data-drag><h2>Tu carrito</h2>
      <button class="icon-btn" data-act="cerrar" aria-label="Cerrar carrito">${raw(icon('x'))}</button></div>
    <div class="dr-body">
      ${barras}
      ${lineasHtml}
      <form class="dr-form" id="dr-form" novalidate autocomplete="on">
        <div class="field"><label for="f-nombre">Tu nombre</label>
          <input class="input" id="f-nombre" name="nombre" autocomplete="name" required value="${cli.nombre || ''}" placeholder="Nombre y apellido"><span class="err" data-err="nombre"></span></div>
        ${t.hayFisico ? html`
          <div class="field"><label for="f-prov">Provincia (envío de ropa)</label>
            <select class="input" id="f-prov" name="provincia" required><option value="">Elige tu provincia</option>${prov}</select><span class="err" data-err="provincia"></span></div>
          <div class="field"><label for="f-dir">Ciudad y dirección de entrega</label>
            <textarea class="input" id="f-dir" name="direccion" rows="2" autocomplete="street-address" required placeholder="Ciudad, calle y referencia">${cli.direccion || ''}</textarea><span class="err" data-err="direccion"></span></div>` : ''}
        ${t.hayRosas ? html`
          <div class="field"><label for="f-pais">País de destino de las rosas</label>
            <select class="input" id="f-pais" name="pais" required><option value="">Elige el país</option>${pais}</select>
            <small>El envío de rosas no tiene costo fijo: se acuerda contigo por WhatsApp.</small><span class="err" data-err="pais"></span></div>` : ''}
        ${t.adultos ? html`<label class="age-check"><input type="checkbox" name="edad" required><span>Declaro que soy <b>mayor de 18 años</b> y juego con responsabilidad.</span></label><span class="err" data-err="edad"></span>` : ''}
      </form>
    </div>
    <div class="dr-foot">
      <div class="sum">
        <div><span>Subtotal</span><span class="num">${money(t.subtotal)}</span></div>
        ${t.hayFisico ? html`<div><span>Envío (ropa)</span><span class="num">${t.envio === 0 ? 'Gratis' : money(t.envio)}</span></div>` : ''}
        ${t.hayRosas ? html`<div><span>Envío de rosas</span><span>Por acordar</span></div>` : ''}
        <div class="total"><span>Total</span><span>${money(t.total)}</span></div>
      </div>
      <button class="btn btn-wa btn-lg btn-block" data-act="comprar">${raw(icon('send'))} Comprar por WhatsApp</button>
      <p class="pay-note">${raw(icon('shield-check'))}<span>Paga solo a nombre de <b>${CONFIG.pago.titular}</b>. Si te piden depositar a otro nombre, no lo hagas y escríbenos.</span></p>
    </div>`.toString();
  const nb = dlg.querySelector('.dr-body');
  if (nb) nb.scrollTop = scrollPrev;
}

function onClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  const k = b.dataset.k;
  const l = lineas.find((x) => x.k === k);
  if (act === 'cerrar') cerrar();
  else if (act === 'mas' && l) cart.setQty(k, l.qty + 1);
  else if (act === 'menos' && l) cart.setQty(k, l.qty - 1);
  else if (act === 'quitar') {
    const p = porId(l?.id);
    cart.remove(k);
    aviso(`${p?.nombre || 'Producto'} eliminado`, { texto: 'Deshacer', fn: () => { if (l) { lineas.push(l); guardar(); } } });
  } else if (act === 'comprar') comprar();
}

function onInput(e) {
  const f = e.target.closest('#dr-form');
  if (!f) return;
  const d = Object.fromEntries(new FormData(f));
  store.set(KEY_CLIENTE, { nombre: d.nombre || '', provincia: d.provincia || '', direccion: d.direccion || '', pais: d.pais || '' });
  e.target.removeAttribute('aria-invalid');
  const er = f.querySelector(`[data-err="${e.target.name}"]`);
  if (er) er.textContent = '';
}

function comprar() {
  const f = $('#dr-form', dlg);
  const t = cart.totales();
  const d = Object.fromEntries(new FormData(f));
  const faltas = {};
  if (!d.nombre || d.nombre.trim().length < 3) faltas.nombre = 'Escribe tu nombre.';
  if (t.hayFisico && !d.provincia) faltas.provincia = 'Elige tu provincia.';
  if (t.hayFisico && (!d.direccion || d.direccion.trim().length < 6)) faltas.direccion = 'Escribe tu ciudad y dirección.';
  if (t.hayRosas && !d.pais) faltas.pais = 'Elige el país de destino.';
  if (t.adultos && !d.edad) faltas.edad = 'Debes confirmar que eres mayor de 18 años.';
  f.querySelectorAll('.err').forEach((x) => (x.textContent = ''));
  f.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
  const claves = Object.keys(faltas);
  if (claves.length) {
    for (const c of claves) {
      const er = f.querySelector(`[data-err="${c}"]`);
      if (er) er.textContent = faltas[c];
      f.querySelector(`[name="${c}"]`)?.setAttribute('aria-invalid', 'true');
    }
    const primero = f.querySelector(`[name="${claves[0]}"]`);
    primero?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    primero?.focus({ preventScroll: true });
    return;
  }
  const url = waLink(mensaje(t, {
    nombre: d.nombre.trim(),
    provincia: t.hayFisico ? d.provincia : '',
    direccion: t.hayFisico ? d.direccion.trim() : '',
    pais: t.hayRosas ? d.pais : '',
  }));
  window.open(url, '_blank', 'noopener');
}

// ── Arrastrar para cerrar (móvil) ───────────────────────────────────
// Cierra con cualquier gesto corto y rápido, no solo pasando un umbral.
function arrastrarParaCerrar() {
  let x0 = 0, t0 = 0, dx = 0, id = null, panel = null;
  dlg.addEventListener('pointerdown', (e) => {
    const h = e.target.closest('[data-drag]');
    if (!h || e.pointerType === 'mouse' || e.target.closest('button')) return;
    panel = dlg.querySelector('.drawer-in');
    id = e.pointerId; x0 = e.clientX; t0 = performance.now(); dx = 0;
    h.setPointerCapture(id);
    panel.style.transition = 'none';
  });
  dlg.addEventListener('pointermove', (e) => {
    if (id !== e.pointerId || !panel) return;
    const raw = e.clientX - x0;
    dx = raw > 0 ? raw : raw * 0.15; // fricción al arrastrar hacia el otro lado
    panel.style.transform = `translateX(${dx}px)`;
  });
  const fin = (e) => {
    if (id !== e.pointerId || !panel) return;
    const v = dx / Math.max(1, performance.now() - t0);
    panel.style.transition = '';
    panel.style.transform = '';
    if (dx > 110 || v > 0.5) cerrar();
    id = null; panel = null;
  };
  dlg.addEventListener('pointerup', fin);
  dlg.addEventListener('pointercancel', fin);
}
