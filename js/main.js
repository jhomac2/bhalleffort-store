// Arranque de BHALLEFFORT: cabecera, menú, buscador, rutas, cookies, pie y bot.
import { CONFIG } from './config.js';
import { CATS, CAT_ORDER, ruta } from './schema.js';
import { cargar, buscar, porId, precioDesde } from './data.js';
import {
  html, raw, money, $, $$, store, waLink, waNumeroBonito, resumenHorario, reducedMotion,
} from './util.js';
import { icon, brand } from './icons.js';
import { art } from './art.js';
import { cart, initCart, abrirCarrito } from './cart.js';
import { initTilt, revelar, voltear, volarAlCarrito, aviso } from './fx.js';
import { resolver, initMapa, canonico } from './views.js';
import { LEGAL, LEGAL_ORDER } from './legal.js';
import { cargarAjustes } from './ajustes.js';

const KEY_COOKIES = 'bh-cookies-ok';
const root = document.documentElement;
const main = $('#main');
let heroCtl = null;
let logoImg = null;

// ── Paleta editable desde config.js ─────────────────────────────────
(() => {
  const p = CONFIG.paleta;
  if (!p) return;
  const set = (k, v) => v && root.style.setProperty(k, v);
  set('--bg', p.fondo); set('--bg-2', p.fondo2); set('--yellow', p.acento); set('--pink', p.rosa);
})();

// ── Logo: si existe img/logo.webp se usa; si no, un monograma ───────
function cargarLogo() {
  return new Promise((ok) => {
    const im = new Image();
    const t = setTimeout(() => ok(null), 2500);
    im.onload = () => { clearTimeout(t); ok(im); };
    im.onerror = () => { clearTimeout(t); ok(null); };
    im.src = CONFIG.marca.logo;
  });
}
function aplicarLogo(im) {
  logoImg = im;
  if (!im) return;
  $$('.brand-mark').forEach((m) => {
    m.classList.add('has-logo');
    m.innerHTML = `<img class="brand-logo" src="${CONFIG.marca.logo}" alt="" width="40" height="40">`;
  });
  const fav = $('link[rel="icon"]');
  if (fav) { fav.href = CONFIG.marca.logo; fav.type = 'image/webp'; }
}
function logoEnMoneda() {
  const c = $('#fb-coin');
  if (c && logoImg) c.innerHTML = `<img src="${CONFIG.marca.logo}" alt="">`;
}

// ── Cabecera ────────────────────────────────────────────────────────
// Nombres cortos para la barra superior (los completos salen en cada página)
const NOMBRE_CORTO = { clases: 'Estudiantil' };
const NAV = CAT_ORDER.map((k) => ({ href: ruta(k), t: NOMBRE_CORTO[k] || CATS[k].nombre, key: CATS[k].slug }));
function pintarCabecera() {
  const nav = [
    ...NAV.map((n) => html`<a class="nav-a" href="${n.href}" data-nav="${n.key}">${n.t === 'Acompañamiento pedagógico' ? 'Clases' : n.t === 'Streaming y Digital' ? 'Digital' : n.t}</a>`),
    html`<a class="nav-a" href="#/promociones" data-nav="promociones">Promociones <span class="nav-dot"></span></a>`,
    CONFIG.sorteo.activo ? html`<a class="nav-a" href="#/sorteo" data-nav="sorteo">Sorteo <span class="nav-dot gold"></span></a>` : '',
  ];
  $('#hdr').innerHTML = html`<div class="container hdr-in">
    <a class="brand" href="#/"><span class="brand-mark" aria-hidden="true">B</span><span class="brand-name">${CONFIG.marca.nombre}</span><span class="sr-only">, ir al inicio</span></a>
    <nav class="nav" aria-label="Principal">${nav}</nav>
    <div class="hdr-tools">
      <div class="search">
        <label class="search-field">${raw(icon('search'))}<span class="sr-only">Buscar productos</span>
          <input type="search" id="q" placeholder="Buscar productos" autocomplete="off" enterkeyhint="search" role="combobox" aria-expanded="false" aria-controls="s-pop" aria-autocomplete="list"></label>
        <div class="search-pop" id="s-pop" role="listbox" data-open="false" aria-label="Resultados"></div>
      </div>
      <button class="icon-btn search-toggle" id="s-toggle" aria-label="Buscar" aria-expanded="false" aria-controls="msearch">${raw(icon('search'))}</button>
      <button class="icon-btn cart-btn" aria-label="Carrito, 0 productos" aria-haspopup="dialog">${raw(icon('shopping-cart'))}<span class="cart-count" id="cart-count" data-n="0">0</span></button>
      <button class="icon-btn menu-btn" id="menu-open" aria-label="Abrir menú" aria-haspopup="dialog">${raw(icon('menu'))}</button>
    </div></div>`.toString();
  $('#msearch').innerHTML = html`<label class="search-field">${raw(icon('search'))}<span class="sr-only">Buscar productos</span>
      <input type="search" id="mq" placeholder="Buscar productos" autocomplete="off" enterkeyhint="search" role="combobox" aria-expanded="false" aria-controls="ms-pop" aria-autocomplete="list"></label>
    <div class="search-pop" id="ms-pop" role="listbox" data-open="false" aria-label="Resultados"></div>`.toString();
}

// ── Buscador en vivo ────────────────────────────────────────────────
function enlazarBuscador(input, pop, alElegir) {
  let sel = -1;
  let timer = 0;
  const items = () => $$('.s-item', pop);
  const abrir = (v) => { pop.dataset.open = String(v); input.setAttribute('aria-expanded', String(v)); };
  const marcar = (i) => {
    const l = items();
    sel = l.length ? (i + l.length) % l.length : -1;
    l.forEach((x, k) => x.setAttribute('aria-selected', String(k === sel)));
    if (sel >= 0) l[sel].scrollIntoView({ block: 'nearest' });
  };
  function pintar() {
    const q = input.value.trim();
    sel = -1;
    if (q.length < 2) { abrir(false); pop.innerHTML = ''; return; }
    const res = buscar(q);
    const top = res.slice(0, 6);
    pop.innerHTML = (top.length
      ? html`${top.map((p) => html`<a class="s-item" role="option" aria-selected="false" href="#/p/${p.id}">
            ${p.imagenes[0] ? html`<img src="${p.imagenes[0]}" alt="" loading="lazy" width="48" height="48">` : html`<span class="s-thumb" style="background:${/^#[0-9a-f]{3,8}$/i.test(p.color || '') ? p.color : '#7a3cf0'}">${p.nombre.slice(0, 1)}</span>`}
            <span><b>${p.nombre}</b><small>${CATS[p.cat].nombre}</small></span><span class="s-price">${money(precioDesde(p))}</span></a>`)}
          ${res.length > top.length ? html`<a class="s-more" role="option" aria-selected="false" href="#/buscar/${encodeURIComponent(q)}">Ver los ${res.length} resultados ${raw(icon('arrow-right'))}</a>` : ''}`
      : html`<div class="s-empty">No encontramos “${q}”. Prueba otra palabra o <a href="${waLink('Hola, estoy buscando: ' + q)}" target="_blank" rel="noopener" style="color:var(--yellow);font-weight:800;text-decoration:underline">pregunta por WhatsApp</a>.</div>`).toString();
    abrir(true);
  }
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(pintar, 80); });
  input.addEventListener('focus', () => { if (input.value.trim().length >= 2) pintar(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); marcar(sel + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); marcar(sel - 1); }
    else if (e.key === 'Escape') { abrir(false); input.blur(); alElegir?.(true); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const l = items();
      const q = input.value.trim();
      if (sel >= 0 && l[sel]) location.hash = l[sel].getAttribute('href');
      else if (q) location.hash = `#/buscar/${encodeURIComponent(q)}`;
      abrir(false); input.blur(); alElegir?.();
    }
  });
  pop.addEventListener('click', (e) => { if (e.target.closest('a')) { abrir(false); alElegir?.(); } });
  document.addEventListener('pointerdown', (e) => {
    if (!pop.contains(e.target) && e.target !== input && !input.closest('.search-field')?.contains(e.target)) abrir(false);
  });
  return { limpiar() { input.value = ''; abrir(false); pop.innerHTML = ''; } };
}

// ── Menú (hoja a pantalla completa en móvil) ────────────────────────
function pintarMenu() {
  const d = $('#menu-dlg');
  d.innerHTML = html`<div class="sheet-in">
    <div class="sheet-top"><a class="brand" href="#/" data-close-menu><span class="brand-mark" aria-hidden="true">B</span><span class="brand-name">${CONFIG.marca.nombre}</span></a>
      <button class="icon-btn" data-close-menu aria-label="Cerrar menú">${raw(icon('x'))}</button></div>
    <div class="menu-grid">
      ${CAT_ORDER.map((k) => html`<a class="menu-tile" href="${ruta(k)}" data-color="${CATS[k].color}" data-close-menu>${raw(art(k))}<b>${CATS[k].nombre}</b></a>`)}
      <a class="menu-tile" href="#/promociones" data-color="coral" data-close-menu>${raw(art('promos'))}<b>Promociones</b></a>
      ${CONFIG.sorteo.activo ? html`<a class="menu-tile" href="#/sorteo" data-color="gold" data-close-menu>${raw(art('sorteo'))}<b>Sorteo mensual</b></a>` : ''}
    </div>
    <div class="menu-links">
      <a href="#/como-comprar" data-close-menu>Cómo comprar ${raw(icon('chevron-right'))}</a>
      <a href="#/local" data-close-menu>Nuestro local ${raw(icon('chevron-right'))}</a>
      <a href="#/legal/envios" data-close-menu>Envíos ${raw(icon('chevron-right'))}</a>
      <a href="#/legal/devoluciones" data-close-menu>Cambios y garantías ${raw(icon('chevron-right'))}</a>
      <a href="#/legal/terminos" data-close-menu>Términos y privacidad ${raw(icon('chevron-right'))}</a>
    </div>
    <div class="hero-cta" style="margin-top:22px">
      <a class="btn btn-wa btn-lg btn-block" href="${waLink('Hola, quiero hacer una consulta.')}" target="_blank" rel="noopener">${raw(brand('whatsapp'))} Escribir por WhatsApp</a>
    </div></div>`.toString();
  d.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-menu]')) d.close();
  });
  d.addEventListener('close', () => { root.classList.remove('lock'); $('#menu-open').setAttribute('aria-expanded', 'false'); });
}

// ── Pie de página ───────────────────────────────────────────────────
function pintarPie() {
  const L = CONFIG.local;
  const dir = [L.direccion, L.referencia].filter(Boolean).join('. ');
  const redes = [['tiktok', 'TikTok', CONFIG.redes.tiktok], ['instagram', 'Instagram', CONFIG.redes.instagram], ['facebook', 'Facebook', CONFIG.redes.facebook]];
  $('#footer').innerHTML = html`<div class="container">
    <div class="f-grid">
      <div class="f-brand">
        <a class="brand" href="#/" style="color:#fff"><span class="brand-mark" aria-hidden="true">B</span><span class="brand-name">${CONFIG.marca.nombre}</span></a>
        <p>${CONFIG.marca.eslogan}. Ropa, recargas, streaming, rosas y acompañamiento estudiantil. ${CONFIG.marca.atencion}.</p>
        <div class="f-social" style="margin-top:16px">
          ${redes.map(([k, n, h]) => html`<a class="soc" href="${h}" target="_blank" rel="noopener" aria-label="${n} de ${CONFIG.marca.nombre}">${raw(brand(k))}</a>`)}
          <a class="soc" href="${waLink('Hola, quiero hacer una consulta.')}" target="_blank" rel="noopener" aria-label="WhatsApp">${raw(brand('whatsapp'))}</a>
        </div>
      </div>
      <div><h2 class="f-h">Tienda</h2><div class="f-links">
        ${CAT_ORDER.map((k) => html`<a href="${ruta(k)}">${CATS[k].nombre}</a>`)}
        <a href="#/promociones">Promociones</a>
        ${CONFIG.sorteo.activo ? html`<a href="#/sorteo">Sorteo mensual</a>` : ''}
      </div></div>
      <div><h2 class="f-h">Información</h2><div class="f-links">
        <a href="#/como-comprar">Cómo comprar</a>
        ${LEGAL_ORDER.filter((s) => s !== 'sorteo' || CONFIG.sorteo.activo).map((s) => html`<a href="#/legal/${s}">${LEGAL[s].corto}</a>`)}
      </div></div>
      <div><h2 class="f-h">Visítanos</h2><div class="f-links">
        <span>${dir || CONFIG.marca.nombre + ', local físico'}</span>
        <a href="${L.enlace}" target="_blank" rel="noopener">Cómo llegar</a>
        <span>${resumenHorario()}</span>
        <a href="${waLink('Hola, quiero hacer una consulta.')}" target="_blank" rel="noopener">WhatsApp ${waNumeroBonito()}</a>
      </div></div>
    </div>
    <div class="f-pay">${raw(icon('shield-check'))}<div><b>Pago oficial:</b> únicamente a nombre de <b>${CONFIG.pago.titular}</b>. Si alguien te pide pagar a otro nombre o cuenta, no lo hagas y escríbenos a nuestro WhatsApp oficial o a ${CONFIG.pago.correo}.</div></div>
    <div class="f-bottom">
      <span>© 2026 ${CONFIG.marca.nombre}. Todos los derechos reservados.</span>
      <span class="credit">Diseñado por <a href="${CONFIG.creditos.tiktok}" target="_blank" rel="noopener" aria-label="${CONFIG.creditos.nombre} en TikTok">${CONFIG.creditos.nombre} ${raw(brand('tiktok'))}</a></span>
    </div></div>`.toString();
}

// ── Botones flotantes: WhatsApp (atención al instante) y carrito ─────
function pintarFlotantes() {
  const f = document.createElement('div');
  f.className = 'floaters';
  f.id = 'floaters';
  f.setAttribute('role', 'complementary');
  f.setAttribute('aria-label', 'Accesos rápidos');
  f.innerHTML = html`
    <a class="fab-wa" href="${waLink('Hola, quiero hacer una consulta.')}" target="_blank" rel="noopener">
      ${raw(brand('whatsapp'))}<span class="t">${CONFIG.marca.atencion}<small>Escríbenos por WhatsApp</small></span></a>
    <button class="fab-cart" id="fab-cart" type="button" data-n="0" aria-label="Ver carrito, 0 productos" aria-hidden="true" tabindex="-1">
      ${raw(icon('shopping-cart'))}<span class="tx">Ver carrito</span><b>0</b></button>
    <span class="spacer" aria-hidden="true"></span>`.toString();
  document.body.append(f);
  f.querySelector('#fab-cart').addEventListener('click', abrirCarrito);
  // En el celular se esconden al bajar y reaparecen al subir, para no tapar el contenido.
  let yAnt = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (matchMedia('(max-width: 720px)').matches) f.dataset.dir = y > yAnt && y > 160 ? 'down' : 'up';
    else delete f.dataset.dir;
    yAnt = y;
  }, { passive: true });
}

// ── Aviso de cookies (informativo: no usamos cookies de seguimiento) ─
function avisoCookies() {
  if (store.get(KEY_COOKIES)) return;
  const c = document.createElement('div');
  c.className = 'cookie';
  c.dataset.s = 'in';
  c.setAttribute('role', 'region');
  c.setAttribute('aria-label', 'Aviso de cookies');
  c.innerHTML = `<p><b>Sin rastreo.</b> Este sitio no usa cookies de publicidad ni de análisis (el mapa de Google de «Nuestro local» puede usar las suyas). Solo guarda en tu dispositivo tu carrito y tus datos de envío para que no los escribas de nuevo. <a href="#/legal/cookies">Más información</a></p>
    <div class="row"><button class="btn btn-primary btn-sm" data-cookie-ok>Entendido</button></div>`;
  document.body.append(c);
  requestAnimationFrame(() => requestAnimationFrame(() => { c.dataset.s = 'on'; }));
  c.addEventListener('click', (e) => {
    if (!e.target.closest('[data-cookie-ok]')) return;
    store.set(KEY_COOKIES, true);
    c.dataset.s = 'out';
    setTimeout(() => c.remove(), 320);
  });
}

// ── Enrutador ───────────────────────────────────────────────────────
const live = $('#route-live');
function metaDesc(txt) { $('meta[name="description"]')?.setAttribute('content', txt || ''); }
function robots(noindex) {
  let m = $('meta[name="robots"]');
  if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.append(m); }
  m.content = noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large';
}
function jsonLd(obj) {
  let s = $('#ld-dyn');
  if (!obj) { s?.remove(); return; }
  if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ld-dyn'; document.head.append(s); }
  s.textContent = JSON.stringify(obj);
}
function marcarNav(hash) {
  const seg = (hash || '#/').replace(/^#\/?/, '').split('/')[0];
  $$('.nav-a').forEach((a) => {
    if (a.dataset.nav === seg) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}
function apagarHero() { heroCtl?.dispose?.(); heroCtl = null; }

async function encenderHero() {
  const stage = $('#stage');
  if (!stage) return;
  const dominio = reducedMotion() || (navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2;
  if (dominio) return;
  try {
    const { iniciarHero } = await import('./hero3d.js');
    if (!$('#stage')) return; // ya se navegó a otra vista
    try { await document.fonts?.load?.('800 100px Bricolage'); } catch { /* nada */ }
    heroCtl = iniciarHero({
      stage, canvas: $('#hero-canvas'), tip: $('#stage-tip'), logo: logoImg, sorteo: CONFIG.sorteo.activo,
      onGo: (h) => { location.hash = h; },
      onFail: () => { heroCtl = null; },
    });
  } catch (err) {
    console.warn('Escena 3D no disponible, se usa la imagen de respaldo.', err);
  }
}

let primera = true;
async function navegar() {
  apagarHero();
  let hash = location.hash || '#/';
  const canon = canonico(hash);
  if (canon !== hash) { history.replaceState(null, '', canon); hash = canon; }
  let r;
  try { r = resolver(hash); } catch (err) { console.error(err); r = { title: CONFIG.marca.nombre, desc: '', html: html`<div class="container" style="padding-block:80px"><div class="empty"><h2>Algo salió mal</h2><p>Recarga la página o escríbenos por WhatsApp.</p></div></div>` }; }
  main.innerHTML = `<div class="view">${r.html.toString()}</div>`;
  document.title = r.title;
  metaDesc(r.desc);
  robots(r.noindex);
  jsonLd(r.jsonld);
  marcarNav(hash);
  logoEnMoneda();
  revelar(main);
  r.after?.();
  if (live) live.textContent = r.title;
  if (!primera) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    main.focus({ preventScroll: true });
  }
  primera = false;
  if (r.hero) encenderHero();
}

// ── Eventos globales (delegados) ────────────────────────────────────
function enlazarGlobal() {
  const menu = $('#menu-dlg');
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-skip]')) { e.preventDefault(); main.focus(); main.scrollIntoView(); return; }
    const add = t.closest('[data-add]');
    if (add) {
      const p = porId(add.dataset.add);
      if (!p) return;
      cart.add(p, { qty: 1 });
      volarAlCarrito(add, p.imagenes[0], p.nombre.slice(0, 1));
      aviso(`${p.nombre} agregado`, { texto: 'Ver carrito', fn: abrirCarrito });
      return;
    }
    const fl = t.closest('[data-flip]');
    if (fl) { voltear(fl); return; }
    const sc = t.closest('[data-scroll]');
    if (sc) {
      const el = document.getElementById(sc.dataset.scroll);
      el?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    if (t.closest('[data-clear-local]')) {
      ['bh-cart-v2', 'bh-cliente', KEY_COOKIES].forEach((k) => store.del(k));
      aviso('Borramos tus datos guardados en este dispositivo');
      setTimeout(() => location.reload(), 900);
      return;
    }
    if (t.closest('.cart-btn')) { abrirCarrito(); return; }
    if (t.closest('#menu-open')) {
      menu.showModal(); root.classList.add('lock'); $('#menu-open').setAttribute('aria-expanded', 'true');
      return;
    }
    if (t.closest('#s-toggle')) {
      const m = $('#msearch');
      const abrir = m.dataset.open !== 'true';
      m.dataset.open = String(abrir);
      $('#s-toggle').setAttribute('aria-expanded', String(abrir));
      if (abrir) setTimeout(() => $('#mq').focus(), 60);
      return;
    }
    // Un enlace a la misma ruta no dispara hashchange: lo resolvemos aquí.
    const a = t.closest('a[href^="#/"]');
    if (a && a.getAttribute('href') === (location.hash || '#/') && !a.hasAttribute('data-act')) {
      e.preventDefault();
      navegar();
    }
  });
  window.addEventListener('hashchange', navegar);
  // Imágenes que no existen (por ejemplo la foto del local aún no subida)
  document.addEventListener('error', (e) => {
    const im = e.target;
    if (im?.tagName === 'IMG' && im.hasAttribute('data-hide')) im.remove();
  }, true);
  // Atajo "/" para buscar
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '') && matchMedia('(min-width: 1080px)').matches) {
      e.preventDefault(); $('#q').focus();
    }
  });
  // Cierra el buscador móvil al navegar
  window.addEventListener('hashchange', () => {
    const m = $('#msearch');
    if (m) { m.dataset.open = 'false'; $('#s-toggle')?.setAttribute('aria-expanded', 'false'); }
  });
}

// ── Inicio ──────────────────────────────────────────────────────────
function esqueleto() {
  main.innerHTML = `<div class="container" style="padding-block:32px"><div class="grid">${'<div class="sk"></div>'.repeat(8)}</div></div>`;
}

async function iniciar() {
  root.classList.add('js');
  await cargarAjustes();
  pintarCabecera();
  pintarMenu();
  pintarPie();
  pintarFlotantes();
  initCart();
  initTilt();
  const bd = enlazarBuscador($('#q'), $('#s-pop'));
  const bm = enlazarBuscador($('#mq'), $('#ms-pop'), (esc2) => {
    $('#msearch').dataset.open = 'false';
    $('#s-toggle').setAttribute('aria-expanded', 'false');
    if (esc2) $('#s-toggle').focus();
  });
  window.addEventListener('hashchange', () => { bd.limpiar(); bm.limpiar(); });
  enlazarGlobal();
  esqueleto();

  let falloCatalogo = false;
  const [, im] = await Promise.all([
    cargar().catch((err) => { console.error(err); falloCatalogo = true; return null; }),
    cargarLogo(),
  ]);
  aplicarLogo(im);
  if (falloCatalogo) {
    main.innerHTML = `<div class="container" style="padding-block:clamp(40px,8vw,120px)"><div class="empty">${art('promos')}<h1 style="font-size:clamp(2rem,1.4rem+3vw,3.2rem)">No pudimos cargar el catálogo</h1><p>Revisa tu conexión e inténtalo de nuevo, o escríbenos por WhatsApp.</p><div class="hero-cta"><button class="btn btn-primary btn-lg" onclick="location.reload()">Reintentar</button><a class="btn btn-wa btn-lg" href="${waLink('Hola, la página no me carga el catálogo.')}" target="_blank" rel="noopener">WhatsApp</a></div></div></div>`;
    window.addEventListener('hashchange', () => location.reload());
    return;
  }
  await navegar();
  avisoCookies();

  // Titi se carga sin bloquear la primera pintura
  const titi = () => import('./titi.js').then((m) => m.iniciarTiti());
  if ('requestIdleCallback' in window) requestIdleCallback(titi, { timeout: 2500 });
  else setTimeout(titi, 1200);

}

iniciar();
