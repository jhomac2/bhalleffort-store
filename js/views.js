import { CONFIG } from './config.js';
import { CATS, CAT_ORDER, subNombre, catPorSlug, ruta, BANNERS_EXTRA, ICONO } from './schema.js';
import {
  porId, porCategoria, promos, destacados, buscar, promoActiva, descuentoPct,
  precioDesde, tieneVariantes,
} from './data.js';
import {
  html, raw, esc, money, norm, waLink, waNumeroBonito, estadoLocal, hora12, DIAS_ES,
  reducedMotion, resumenHorario, $, $$,
} from './util.js';
import { icon, brand } from './icons.js';
import { cart, abrirCarrito } from './cart.js';
import { aviso, volarAlCarrito, revelar } from './fx.js';
import { LEGAL, LEGAL_ORDER } from './legal.js';

// ═══════════════════════════════════════════════════════════════════
//  Piezas reutilizables
// ═══════════════════════════════════════════════════════════════════
const PAGE = 24;
const pend = (v, etiqueta) => (v ? esc(v) : `<span class="pend">PENDIENTE: ${esc(etiqueta)}</span>`);
const hexOk = (c) => /^#[0-9a-f]{3,8}$/i.test(c || '');

function etiquetaAccion(p) {
  if (p.cat === 'clases') return 'Consultar';
  if (p.tallas.length > 1) return 'Elegir talla';
  if (p.opciones.length) return p.cat === 'recargas' ? 'Recargar' : 'Elegir opción';
  if (p.campos.length) return 'Completar datos';
  return 'Agregar';
}

function placeholder(p) {
  const cat = CATS[p.cat];
  const bg = hexOk(p.color) ? `style="--ph:${esc(p.color)}"` : '';
  return html`<div class="media-ph" ${raw(bg)}><div><b>${p.operador || p.nombre}</b><small>${p.cat === 'recargas' ? 'Recarga' : cat.nombre}</small></div></div>`;
}

function etiquetas(p) {
  const f = [];
  if (p.agotado) f.push(html`<span class="flag out">Agotado</span>`);
  if (promoActiva(p)) f.push(html`<span class="flag off">−${descuentoPct(p)}% Oferta</span>`);
  if (p.nuevo) f.push(html`<span class="flag new">Nuevo</span>`);
  if (p.edad >= 18) f.push(html`<span class="flag age">+${p.edad}</span>`);
  if (p.ejemplo) f.push(html`<span class="flag out">Ejemplo</span>`);
  return f;
}

function precioEtiqueta(p) {
  const desde = p.opciones.length > 1;
  const valor = precioDesde(p);
  return html`<span class="price-wrap"><span class="price-tag">
    ${desde ? html`<small>desde</small>` : ''}${money(valor)}
    ${promoActiva(p) && !desde ? html`<s>${money(p.precio_antes)}</s>` : ''}
    ${p.cat === 'rosas' ? html`<small>por bonche</small>` : ''}</span></span>`;
}

// Color propio del producto (operadores de recarga): tiñe toda la tarjeta
const estiloColor = (p) => (hexOk(p.color)
  ? `--c:${p.color};--c-soft:color-mix(in srgb, ${p.color} 12%, #ffffff);--c-deep:color-mix(in srgb, ${p.color} 55%, #0a1230);--c-glow:color-mix(in srgb, ${p.color} 40%, #ffffff);`
  : '');

export function tarjeta(p, i = 0) {
  const cat = CATS[p.cat];
  const dos = p.imagenes.length > 1;
  const media = p.imagenes.length
    ? html`<div class="flip"><div class="flip-in">
        <div class="face front"><img src="${p.imagenes[0]}" alt="${p.nombre}" loading="lazy" decoding="async"></div>
        ${dos ? html`<div class="face back"><img data-src="${p.imagenes[1]}" alt="${p.nombre}, otra vista" decoding="async"></div>` : ''}
      </div></div>`
    : placeholder(p);
  const meta = [];
  if (p.cat === 'ropa' && p.sub === 'varios') meta.push([p.grupo, p.para].filter(Boolean).join(' · '));
  else if (p.cat === 'digital') meta.push(subNombre('digital', p.sub));
  else if (p.cat === 'recargas') meta.push(subNombre('recargas', p.sub));
  const tallas = p.tallas.length > 1
    ? html`<div class="sizes" aria-label="Tallas">${p.tallas.slice(0, 6).map((t) => html`<span>${t}</span>`)}${p.tallas.length > 6 ? html`<span>+${p.tallas.length - 6}</span>` : ''}</div>`
    : '';
  const montos = p.cat === 'recargas' && p.opciones.length
    ? html`<div class="amounts" aria-label="Montos">${p.opciones.slice(0, 5).map((o) => html`<span>${o.nombre}</span>`)}${p.opciones.length > 5 ? html`<span>+${p.opciones.length - 5}</span>` : ''}</div>`
    : '';
  const txt = etiquetaAccion(p);
  const accion = p.cat === 'clases'
    ? html`<a class="btn btn-wa btn-sm" href="${waLink(`Hola, quiero consultar horarios y cupos de: ${p.nombre}`)}" target="_blank" rel="noopener" aria-label="${txt}: ${p.nombre}">${raw(brand('whatsapp'))} ${txt}</a>`
    : tieneVariantes(p) || p.agotado
      ? html`<a class="btn btn-primary btn-sm" href="#/p/${p.id}" aria-label="${txt}: ${p.nombre}">${txt}</a>`
      : html`<button class="btn btn-primary btn-sm" data-add="${p.id}" aria-label="${txt}: ${p.nombre}">${raw(icon('plus'))} ${txt}</button>`;
  return html`<article class="card reveal" data-color="${cat.color}" data-agotado="${p.agotado ? 'true' : 'false'}"
      style="${raw(esc(estiloColor(p)))}--media:${cat.media};--i:${Math.min(i, 8)}" data-flipwrap>
    <div class="card-top">
      <div class="card-media">${media}<div class="flags">${etiquetas(p)}</div></div>
      ${dos ? html`<button class="flip-btn" data-flip aria-pressed="false" aria-label="Ver otra foto">${raw(icon('refresh-cw'))}</button>` : ''}
    </div>
    <div class="card-body">
      ${meta.filter(Boolean).length ? html`<div class="card-meta">${meta.filter(Boolean).join(' · ')}</div>` : ''}
      <h3 class="card-title"><a href="#/p/${p.id}">${p.nombre}</a></h3>
      ${tallas}${montos}
      ${precioEtiqueta(p)}
      <div class="card-act">${accion}</div>
    </div></article>`;
}

const grilla = (lista, c) => html`<div class="grid" data-media="${CATS[c].media}">${lista.map((p, i) => tarjeta(p, i))}</div>`;
// Si la lista mezcla categorías, se agrupa: cada grupo usa la proporción de foto de su categoría.
const rejilla = (lista, catKey) => {
  if (catKey) return grilla(lista, catKey);
  const cats = CAT_ORDER.filter((c) => lista.some((p) => p.cat === c));
  if (cats.length <= 1) return grilla(lista, cats[0] || 'ropa');
  return html`${cats.map((c) => html`<div class="group"><h3 class="group-title">${CATS[c].nombre}</h3>${grilla(lista.filter((p) => p.cat === c), c)}</div>`)}`;
};

// Cabecera sencilla (Local, Cómo comprar, Búsqueda)
function cabecera({ eyebrow, titulo, resaltado, lead, color, crumbs = [] }) {
  return html`<section class="page-hero" data-color="${color}">
    <div class="container">
      <nav class="crumbs" aria-label="Ruta"><a href="#/">Inicio</a>${crumbs.map(([t, h]) => html` ${raw(icon('chevron-right'))} ${h ? html`<a href="${h}">${t}</a>` : html`<span>${t}</span>`}`)}</nav>
      ${eyebrow ? html`<span class="eyebrow">${eyebrow}</span>` : ''}
      <h1>${titulo} ${resaltado ? html`<span>${resaltado}</span>` : ''}</h1>
      ${lead ? html`<p class="lead">${lead}</p>` : ''}
    </div></section>`;
}

// Banner grande con imagen (cada sección tiene el suyo; se cambia en img/banners/)
function banner({ eyebrow, titulo, resaltado, lead, color, img, crumbs = [], extra = '' }) {
  return html`<section class="banner" data-color="${color}">
    <div class="container"><div class="banner-box">
      ${img ? html`<img class="banner-img" src="${img}" alt="" decoding="async" fetchpriority="high" data-hide>` : ''}
      <div class="banner-copy">
        <nav class="crumbs" aria-label="Ruta"><a href="#/">Inicio</a>${crumbs.map(([t, h]) => html` ${raw(icon('chevron-right'))} ${h ? html`<a href="${h}">${t}</a>` : html`<span>${t}</span>`}`)}</nav>
        ${eyebrow ? html`<span class="eyebrow">${eyebrow}</span>` : ''}
        <h1>${titulo} ${resaltado ? html`<span>${resaltado}</span>` : ''}</h1>
        ${lead ? html`<p class="lead">${lead}</p>` : ''}
        ${extra}
      </div>
    </div></div></section>`;
}

// Botones para seguir las cuentas de cada sección
const NOMBRE_RED = { tiktok: 'TikTok', youtube: 'YouTube', instagram: 'Instagram', facebook: 'Facebook' };
function redesDe(catKey) {
  const slug = CATS[catKey].slug;
  const propias = CONFIG.secciones?.[slug] || {};
  const estudiantil = catKey === 'clases';
  const orden = estudiantil ? ['tiktok', 'youtube', 'instagram'] : ['tiktok', 'instagram', 'youtube', 'facebook'];
  return orden
    .map((r) => ({ r, n: NOMBRE_RED[r], url: propias[r] || (estudiantil ? '' : CONFIG.redes[r] || '') }))
    .filter((x) => estudiantil || x.url);
}
function follow(catKey, etiqueta = 'Síguenos') {
  const l = redesDe(catKey);
  if (!l.length) return '';
  return html`<div class="follow"><span class="follow-l">${etiqueta}</span>
    ${l.map(({ r, n, url }) => url
    ? html`<a class="fol" data-net="${r}" href="${url}" target="_blank" rel="noopener">${raw(brand(r))} ${n}</a>`
    : html`<span class="fol" data-net="${r}" aria-disabled="true">${raw(brand(r))} ${n} <small>Próximamente</small></span>`)}
  </div>`;
}

function vacio({ cat, titulo, texto, msg }) {
  return html`<div class="empty" data-color="${CATS[cat]?.color || 'blue'}"><span class="empty-ic">${raw(icon(ICONO[cat] || 'tag'))}</span><h2>${titulo}</h2><p>${texto}</p>
    <a class="btn btn-wa" href="${waLink(msg)}" target="_blank" rel="noopener">${raw(brand('whatsapp'))} Preguntar por WhatsApp</a></div>`;
}

// ═══════════════════════════════════════════════════════════════════
//  Inicio
// ═══════════════════════════════════════════════════════════════════
// Gama de colores de las esferas cuando el producto no trae color
const ORBS = [['#d6e4ff', '#1352d6'], ['#d3f3ef', '#0b8f86'], ['#e6dcff', '#6d3df0'], ['#ffdce8', '#d62f6a'], ['#d9f2e1', '#1a8f45'], ['#ffe0d4', '#e2552b'], ['#ffeec2', '#b87d00'], ['#d6eef7', '#0e7490']];
const ICONO_SUB = { celulares: 'smartphone', videojuegos: 'gamepad-2', ecuabet: 'star' };
function coloresOrb(p, i) {
  if (hexOk(p.color)) return [`color-mix(in srgb, ${p.color} 55%, #fff)`, p.color];
  return ORBS[i % ORBS.length];
}
function contenidoOrb(p) {
  if (p.imagenes[0]) return html`<img src="${p.imagenes[0]}" alt="" loading="lazy" decoding="async">`;
  if (p.cat === 'recargas') return raw(icon(ICONO_SUB[p.sub] || 'zap'));
  return html`<span>${(p.operador || p.nombre).slice(0, 1)}</span>`;
}
const estiloOrb = (p, i) => { const [a, b] = coloresOrb(p, i); return `--o1:${a};--o2:${b}`; };

// Lámina del carrusel. La primera (i = 0) lleva el título principal de la página.
function lamina(s, i, total) {
  const est = estadoLocal();
  const titulo = html`${s.titulo} ${s.resalte ? html`<span>${s.resalte}</span>` : ''}`;
  return html`<div class="slide" data-color="${s.color || 'blue'}" role="group" aria-roledescription="lámina" aria-label="${i + 1} de ${total}">
    <div class="slide-img"><img src="${s.imagen}" alt="" width="1600" height="640" ${i === 0 ? raw('fetchpriority="high"') : raw('loading="lazy"')} decoding="async" data-hide></div>
    <div class="slide-copy">
      ${i === 0
    ? html`<span class="hero-pill"><span class="dot ${est.abierto ? 'on' : ''}"></span>${est.abierto ? `Abierto ahora · cierra ${hora12(est.cierra)}` : 'Cerrado ahora · te respondemos al abrir'}</span>
        <h1 id="h-title">${titulo}</h1>`
    : html`<span class="eyebrow">${s.etiqueta}</span><h2>${titulo}</h2>`}
      <p class="lead">${s.texto}</p>
      <div class="slide-cta">
        <a class="btn btn-primary btn-lg" href="${s.enlace}">${s.boton} ${raw(icon('arrow-right'))}</a>
        ${!s.enlace2 ? '' : s.enlace2.startsWith('#/')
    ? html`<a class="btn btn-white btn-lg" href="${s.enlace2}">${s.boton2}</a>`
    : html`<button type="button" class="btn btn-white btn-lg" data-scroll="${s.enlace2.slice(1)}">${s.boton2} ${raw(icon('arrow-down'))}</button>`}
      </div>
    </div></div>`;
}

function carrusel() {
  const M = CONFIG.marca;
  const laminas = [
    { color: 'blue', imagen: M.heroImagen, titulo: M.heroTitulo, resalte: M.heroResalte, texto: `${M.heroBajada} ${M.atencion}.`, boton: 'Ver promociones', enlace: '#/promociones', boton2: 'Explorar categorías', enlace2: '#categorias' },
    ...(CONFIG.carrusel || []).filter((x) => x.enlace !== '#/vende' || CONFIG.vende.activo),
  ];
  return html`<section class="hero" aria-roledescription="carrusel" aria-label="Destacados de la tienda">
    <div class="container hero-wrap">
      <div class="hero-track" id="hero-track" tabindex="0" aria-label="Destacados, desliza para ver más">${laminas.map((s, i) => lamina(s, i, laminas.length))}</div>
      <button class="hero-arrow prev" type="button" aria-label="Lámina anterior">${raw(icon('arrow-right'))}</button>
      <button class="hero-arrow next" type="button" aria-label="Lámina siguiente">${raw(icon('arrow-right'))}</button>
      <div class="hero-dots">${laminas.map((_, i) => html`<button type="button" aria-label="Ir a la lámina ${i + 1}" aria-current="${i === 0}"></button>`)}</div>
    </div></section>`;
}

function enlazarCarrusel() {
  const track = $('#hero-track');
  if (!track) return;
  const laminas = $$('.slide', track);
  const dots = $$('.hero-dots button');
  const prev = $('.hero-arrow.prev');
  const next = $('.hero-arrow.next');
  let actual = -1;
  const pintar = () => {
    const w = track.clientWidth || 1;
    const i = Math.max(0, Math.min(laminas.length - 1, Math.round(track.scrollLeft / w)));
    if (i === actual) return;
    actual = i;
    dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    laminas.forEach((l, k) => { l.inert = k !== i; });
    prev.disabled = i === 0;
    next.disabled = i === laminas.length - 1;
  };
  const ir = (i) => track.scrollTo({ left: Math.max(0, Math.min(laminas.length - 1, i)) * track.clientWidth, behavior: reducedMotion() ? 'auto' : 'smooth' });
  track.addEventListener('scroll', pintar, { passive: true });
  prev.addEventListener('click', () => ir(actual - 1));
  next.addEventListener('click', () => ir(actual + 1));
  dots.forEach((d, k) => d.addEventListener('click', () => ir(k)));
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); ir(actual + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); ir(actual - 1); }
  });
  window.addEventListener('resize', () => { track.scrollLeft = Math.max(actual, 0) * track.clientWidth; }, { passive: true });
  pintar();
}

function franjaConfianza() {
  const items = [
    ['zap', CONFIG.marca.atencion, 'Respondemos por WhatsApp'],
    ['truck', `Envío gratis desde ${money(CONFIG.envio.gratisDesde)}`, 'En compras de ropa'],
    ['shield-check', 'Paga seguro', `Solo a nombre de ${CONFIG.pago.titular}`],
    ['store', 'Local físico', `Visítanos en ${CONFIG.legal.ciudad}`],
  ];
  return html`<div class="container"><div class="trust">${items.map(([ic, t, d]) => html`
    <div class="trust-i"><span class="tic">${raw(icon(ic))}</span><div><b>${t}</b><small>${d}</small></div></div>`)}</div></div>`;
}

function bandaVende() {
  const V = CONFIG.vende;
  if (!V.activo) return '';
  return html`<section class="section" data-color="blue">
    <div class="container"><div class="sell reveal">
      <div>
        <span class="eyebrow">Vende con nosotros</span>
        <h2>${V.titulo} <span>${V.resalte}</span></h2>
        <p>${V.texto}</p>
        <ul class="sell-list">${V.puntos.map((t) => html`<li>${raw(icon('check'))} ${t}</li>`)}</ul>
        <div class="sell-cta">
          <a class="btn btn-white btn-lg" href="${waLink(V.mensajeWhatsApp)}" target="_blank" rel="noopener">${raw(brand('whatsapp'))} Contáctanos por WhatsApp</a>
          <a class="btn btn-ghost btn-lg" href="#/vende">Ver cómo funciona</a>
        </div>
      </div>
      <div class="sell-art" aria-hidden="true">
        <div class="mock mock-b"><div class="mock-img"></div><i></i><i class="s"></i></div>
        <div class="mock mock-a"><div class="mock-img">${raw(icon('store'))}</div><b>Tu producto aquí</b><i class="s"></i><div class="mock-row"><span>$ 00.00</span><u>Agregar</u></div></div>
      </div>
    </div></div></section>`;
}

function inicio() {
  const pr = promos();
  const destRopa = destacados(8, 'ropa');
  const destRosas = destacados(4, 'rosas');
  const prCat = pr.some((p) => p.cat === 'ropa') ? 'ropa' : (pr[0] && pr[0].cat);
  const prHome = pr.filter((p) => p.cat === prCat).slice(0, 4);
  const sorteo = CONFIG.sorteo.activo;
  const recs = porCategoria('recargas').slice(0, 6);
  const streams = destacados(6, 'digital');
  const C = CONFIG.creditos;
  const tiles = [
    ['ropa', 'Ropa', 'Hombre, mujer, niños y más. Calzado, mochilas y conjuntos.'],
    ['recargas', 'Recargas', 'Claro, Movistar, Tigo, CNT, videojuegos y Ecuabet.'],
    ['digital', 'Streaming', 'Netflix, IA y programas al instante.'],
    ['rosas', 'Rosas', 'Por bonche. Ecuador, Perú y Colombia.'],
    ['clases', 'Acompañamiento estudiantil', 'Apoyo escolar para EGB.'],
  ];
  return {
    title: `${CONFIG.marca.nombre} · ${CONFIG.marca.eslogan}`,
    desc: 'Todo lo encuentras aquí: ropa, recargas, streaming, rosas y acompañamiento estudiantil. Atención al instante por WhatsApp. Sorteo mensual.',
    html: html`
    ${carrusel()}
    ${franjaConfianza()}

    <section class="section" id="categorias" style="padding-bottom:clamp(24px,3vw,40px)">
      <div class="container">
        <div class="section-head reveal"><div><span class="eyebrow">Categorías</span><h2>¿Qué estás buscando?</h2></div></div>
        <div class="bento">
          ${tiles.map(([cat, nombre, texto], i) => html`
            <a class="tile reveal" style="--i:${i}" href="${ruta(cat)}" data-color="${CATS[cat].color}">
              <span class="tile-ic">${raw(icon(ICONO[cat]))}</span>
              <h3>${nombre}</h3><p>${texto}</p>
              <span class="go">Ver ${raw(icon('arrow-right'))}</span>
            </a>`)}
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="container two">
        <article class="arcade reveal" data-color="teal">
          <div class="arc-head"><span class="eyebrow">Recargas</span><h2>Recarga en segundos</h2><p>Elige el operador o juego, el monto y listo.</p></div>
          <div class="picks">${recs.map((p, i) => html`<a class="pick" href="${ruta('recargas')}/${p.sub}" style="${raw(esc(estiloOrb(p, i)))}"><span class="pick-orb">${contenidoOrb(p)}</span><span class="pick-name">${p.operador || p.nombre}</span></a>`)}</div>
          <div class="hero-cta" style="margin-top:20px"><a class="btn btn-primary" href="${ruta('recargas')}">Armar mi recarga ${raw(icon('arrow-right'))}</a></div>
        </article>
        <article class="arcade reveal" data-color="violet" style="--i:1">
          <div class="arc-head"><span class="eyebrow">Streaming</span><h2>Tus cuentas, al instante</h2><p>Netflix, IA, programas y más. Cuéntanos qué necesitas.</p></div>
          <div class="picks">${streams.map((p, i) => html`<a class="pick" href="#/p/${p.id}" style="${raw(esc(estiloOrb(p, i + 2)))}"><span class="pick-orb">${contenidoOrb(p)}</span><span class="pick-name">${p.nombre}</span></a>`)}</div>
          <div class="hero-cta" style="margin-top:20px"><a class="btn btn-primary" href="${ruta('digital')}">Armar mi pedido ${raw(icon('arrow-right'))}</a></div>
        </article>
      </div>
    </section>

    ${pr.length ? html`
    <section class="section" data-color="coral">
      <div class="container">
        <div class="section-head reveal"><div><span class="eyebrow">Promociones</span><h2>Precios que no duran</h2></div>
          <a class="link-arrow" href="#/promociones">Ver todas ${raw(icon('arrow-right'))}</a></div>
        ${rejilla(prHome, prCat)}
      </div>
    </section>` : ''}

    ${destRopa.length ? html`<section class="section alt" data-color="blue">
      <div class="container">
        <div class="section-head reveal"><div><span class="eyebrow">Destacados</span><h2>Lo que más buscan</h2></div>
          <a class="link-arrow" href="${ruta('ropa')}">Ver ropa ${raw(icon('arrow-right'))}</a></div>
        ${rejilla(destRopa, 'ropa')}
      </div>
    </section>` : ''}

    ${destRosas.length ? html`<section class="section" data-color="rose">
      <div class="container">
        <div class="section-head reveal"><div><span class="eyebrow">Rosas</span><h2>Para regalar y sorprender</h2></div>
          <a class="link-arrow" href="${ruta('rosas')}">Ver rosas ${raw(icon('arrow-right'))}</a></div>
        ${rejilla(destRosas, 'rosas')}
      </div>
    </section>` : ''}

    ${sorteo ? bandaSorteo() : ''}

    <section class="section" data-color="blue">
      <div class="container">
        <div class="section-head reveal"><div><span class="eyebrow">Cómo comprar</span><h2>Cuatro pasos y listo</h2></div>
          <a class="link-arrow" href="#/como-comprar">Más detalles ${raw(icon('arrow-right'))}</a></div>
        ${pasosCompra()}
      </div>
    </section>

    <section class="section alt" data-color="blue">
      <div class="container">${bloqueLocal()}</div>
    </section>

    ${bandaVende()}

    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="dev reveal">
          <div class="dev-code" aria-hidden="true">
            <div class="dev-bar"><i></i><i></i><i></i><span>tu-negocio.com</span></div>
            <div class="dev-body"><i></i><i></i><i></i><i></i><div class="dev-btns"><b></b><b></b></div></div>
          </div>
          <div class="dev-copy">
            <span class="eyebrow">${C.titulo}</span>
            <h2>¿Quieres una página web como esta?</h2>
            <p>${C.mensaje} Soy <b>${C.nombre}</b>, el diseñador de ${CONFIG.marca.nombre}.</p>
            <a class="btn btn-primary btn-lg" href="${C.tiktok}" target="_blank" rel="noopener">${raw(brand('tiktok'))} Ver mi TikTok</a>
          </div>
        </div>
      </div>
    </section>`,
    after: () => { enlazarCarrusel(); animarCarrete(); initMapa(); },
  };
}

function pasosCompra() {
  const pasos = [
    ['search', 'Elige', 'Explora las categorías o usa el buscador para encontrar lo que necesitas.'],
    ['shopping-cart', 'Agrega al carrito', 'Escoge talla u opción y súmalo. Tu carrito se guarda en este dispositivo.'],
    ['send', 'Envía tu pedido', 'Escribe tu nombre y envía el pedido por WhatsApp. Confirmamos disponibilidad y envío.'],
    ['shield-check', 'Paga seguro', `Paga únicamente a nombre de ${CONFIG.pago.titular}. Si te piden otro nombre, no pagues y escríbenos.`],
  ];
  return html`<div class="steps">${pasos.map(([ic, t, d], i) => html`
    <article class="step reveal" data-color="${['blue', 'teal', 'violet', 'gold'][i]}" style="--i:${i}"><span class="ic-wrap">${raw(icon(ic))}</span><h3>${t}</h3><p>${d}</p></article>`)}</div>`;
}

function bandaSorteo() {
  const s = CONFIG.sorteo;
  return html`<section class="section" style="padding-top:0" data-color="gold">
    <div class="container"><div class="raffle reveal">
      <div>
        <span class="eyebrow">Sorteo mensual</span>
        <h2>Compra desde ${money(s.minimo)} y participa</h2>
        <p>Cada compra válida te da un número del 1 al ${s.numeroMaximo}. El sorteo se hace cada mes y lo puedes seguir en nuestras redes. Al ganador lo contactamos por WhatsApp.</p>
        <div class="raffle-cta">
          <a class="btn btn-primary btn-lg" href="#/sorteo">Cómo participar</a>
          <a class="btn btn-white btn-lg" href="#/legal/sorteo">Bases del sorteo</a>
        </div>
      </div>
      <div class="ticket" aria-hidden="true">
        <small>Tu número de la suerte</small>
        <div class="reel" id="reel"><span>0</span><span>7</span></div>
        <hr><div class="foot"><span>Del 1 al ${s.numeroMaximo}</span><span>Se reinicia cada mes</span></div>
      </div>
    </div></div></section>`;
}

function animarCarrete() {
  const r = $('#reel');
  if (!r) return;
  const ponerNum = (n) => { r.innerHTML = String(n).split('').map((d) => `<span>${d}</span>`).join(''); };
  const final = 1 + Math.floor(Math.random() * CONFIG.sorteo.numeroMaximo);
  if (reducedMotion()) { ponerNum(final); return; }
  let vista = false;
  const io = new IntersectionObserver((en) => {
    if (!en[0].isIntersecting || vista) return;
    vista = true; io.disconnect();
    const t0 = performance.now();
    const id = setInterval(() => {
      const t = performance.now() - t0;
      if (t > 1100) { clearInterval(id); ponerNum(final); return; }
      ponerNum(1 + Math.floor(Math.random() * CONFIG.sorteo.numeroMaximo));
    }, 70);
  }, { threshold: 0.5 });
  io.observe(r);
}

// ═══════════════════════════════════════════════════════════════════
//  Local
// ═══════════════════════════════════════════════════════════════════
function bloqueLocal() {
  const L = CONFIG.local;
  const est = estadoLocal();
  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  return html`<div class="local reveal">
    <div class="local-photo">
      <img class="vitrina" src="img/local-vitrina.webp" alt="" loading="lazy" decoding="async" width="1000" height="1000">
      <span class="local-tag">${raw(icon('map-pin'))} Nuestro local</span>
      <img src="${L.foto}" alt="Fachada del local BHALLEFFORT" loading="lazy" decoding="async" data-hide>
    </div>
    <div class="local-info">
      <div><span class="eyebrow">Nuestro local</span><h2 style="margin-top:6px">Visítanos</h2></div>
      <span class="badge-open ${est.abierto ? '' : 'closed'}">${est.abierto ? 'Abierto ahora' : 'Cerrado ahora'}</span>
      <p>${L.direccion ? L.direccion : `${CONFIG.marca.nombre}, local físico.`}${L.referencia ? ' ' + L.referencia : ''}</p>
      <div class="hours" aria-label="Horario de atención">
        ${dias.map((d) => html`<div class="${d === est.dia ? 'today' : ''}"><span>${DIAS_ES[d]}</span><span class="num">${CONFIG.horario[d][0]}:00 – ${CONFIG.horario[d][1]}:00</span></div>`)}
      </div>
      <div class="hero-cta">
        <a class="btn btn-primary" href="${L.enlace}" target="_blank" rel="noopener">${raw(icon('navigation'))} Cómo llegar</a>
        <a class="btn btn-wa" href="${waLink('Hola, quiero consultar sobre sus productos.')}" target="_blank" rel="noopener">${raw(brand('whatsapp'))} WhatsApp</a>
      </div>
      <div class="map-box" id="map-box"><p class="muted">Cargando el mapa…</p></div>
    </div></div>`;
}

function initMapa() {
  const box = $('#map-box');
  if (!box) return;
  const L = CONFIG.local;
  box.innerHTML = `<iframe title="Ubicación de ${esc(CONFIG.marca.nombre)} en Google Maps" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${L.lat},${L.lon}&z=17&hl=es&output=embed"></iframe>`;
}

function vistaLocal() {
  return {
    title: `Nuestro local · ${CONFIG.marca.nombre}`,
    desc: `Visita el local de ${CONFIG.marca.nombre}. Horario de atención y cómo llegar.`,
    html: html`${cabecera({ eyebrow: 'Nuestro local', titulo: 'Ven a', resaltado: 'visitarnos', lead: 'Atención de lunes a sábado y domingos. Mira el horario y cómo llegar.', color: 'blue', crumbs: [['Local']] })}
      <section class="section" style="padding-top:12px" data-color="blue"><div class="container">${bloqueLocal()}</div></section>`,
    after: () => initMapa(),
  };
}

// ═══════════════════════════════════════════════════════════════════
//  Cómo comprar y sorteo
// ═══════════════════════════════════════════════════════════════════
function vistaComoComprar() {
  return {
    title: `Cómo comprar · ${CONFIG.marca.nombre}`,
    desc: 'Cómo comprar en BHALLEFFORT: elige, agrega al carrito, envía tu pedido por WhatsApp y paga seguro.',
    html: html`${cabecera({ eyebrow: 'Cómo comprar', titulo: 'Comprar es', resaltado: 'fácil', lead: 'Sin registros ni contraseñas. Tu pedido llega a nuestro WhatsApp y lo confirmamos contigo.', color: 'blue', crumbs: [['Cómo comprar']] })}
      <section class="section" style="padding-top:12px" data-color="blue"><div class="container">
        <h2 class="sr-only">Pasos para comprar</h2>
        ${pasosCompra()}
        <div class="two" style="margin-top:20px">
          <div class="note">${raw(icon('shield-check'))}<div><b>Pago oficial</b><br>Pagamos y recibimos únicamente a nombre de <b>${CONFIG.pago.titular}</b>. Si alguien te pide depositar a otro nombre o cuenta, no lo hagas. Verifica con nosotros por WhatsApp (${waNumeroBonito()}) o al correo ${CONFIG.pago.correo}.</div></div>
          <div class="note">${raw(icon('truck'))}<div><b>Envíos</b><br>Ropa: ${money(CONFIG.envio.costo)} de envío, gratis desde ${money(CONFIG.envio.gratisDesde)}. Productos digitales: sin costo de envío. Rosas: el envío se acuerda contigo. <a href="#/legal/envios">Ver política de envíos</a>.</div></div>
        </div>
      </div></section>`,
  };
}

function vistaSorteo() {
  const s = CONFIG.sorteo;
  if (!s.activo) return noEncontrada();
  const redes = CONFIG.redes;
  return {
    title: `Sorteo mensual · ${CONFIG.marca.nombre}`,
    desc: `Compra desde ${money(s.minimo)} y participa en el sorteo mensual de BHALLEFFORT. Un número del 1 al ${s.numeroMaximo} por compra.`,
    html: html`${banner({ eyebrow: 'Sorteo mensual', titulo: 'Compra y', resaltado: 'participa', lead: `Desde ${money(s.minimo)} de compra recibes un número del 1 al ${s.numeroMaximo}. Se reinicia cada mes.`, color: 'gold', img: BANNERS_EXTRA.sorteo.banner, crumbs: [['Sorteo']] })}
      <section class="section" style="padding-top:12px" data-color="gold"><div class="container">
        <h2 class="sr-only">Cómo participar</h2>
        <div class="steps">
          ${[
            ['shopping-cart', `Compra desde ${money(s.minimo)}`, 'Suma productos en tu carrito. La barra del carrito te muestra cuánto falta.'],
            ['ticket', 'Recibe tu número', `Al confirmar tu compra por WhatsApp te enviamos un número del 1 al ${s.numeroMaximo}. Es un número por compra válida.`],
            ['play', 'Sigue el sorteo', 'El sorteo se hace cada mes y lo puedes seguir en nuestras redes sociales.'],
            ['message-circle', 'Te avisamos', 'Contactamos al ganador por WhatsApp y publicamos el resultado en redes.'],
          ].map(([ic, t, d], i) => html`<article class="step reveal" data-color="gold" style="--i:${i}"><span class="ic-wrap">${raw(icon(ic))}</span><h3>${t}</h3><p>${d}</p></article>`)}
        </div>
        <div class="two" style="margin-top:20px">
          <div class="note"><span>${raw(icon('info'))}</span><div><b>Premio y fecha de este mes</b><br>${s.premioDelMes || s.fechaDelSorteo
            ? `${s.premioDelMes ? 'Premio: ' + s.premioDelMes + '. ' : ''}${s.fechaDelSorteo ? 'Fecha: ' + s.fechaDelSorteo + '.' : ''}`
            : 'Se anuncian cada mes en nuestras redes sociales.'}</div></div>
          <div class="note"><span>${raw(icon('lock'))}</span><div><b>Bases del sorteo</b><br>Lee las condiciones completas antes de participar. <a href="#/legal/sorteo">Ver bases</a>.</div></div>
        </div>
        <div class="section-head" style="margin-top:48px"><div><h2>Sorteos anteriores</h2></div></div>
        ${s.historial.length
          ? html`<div class="steps">${s.historial.map((h) => html`<article class="step" data-color="gold"><h3>${h.mes}</h3><p>Número ganador: <b>${h.numero}</b>${h.premio ? ` · ${h.premio}` : ''}</p>${h.enlace ? html`<p><a class="link-arrow" href="${h.enlace}" target="_blank" rel="noopener">Ver el sorteo</a></p>` : ''}</article>`)}</div>`
          : html`<div class="empty"><p>Aquí aparecerán los números ganadores de cada mes.</p></div>`}
        <div class="hero-cta" style="margin-top:28px">
          <a class="btn btn-primary btn-lg" href="${redes.tiktok}" target="_blank" rel="noopener">${raw(brand('tiktok'))} TikTok</a>
          <a class="btn btn-white btn-lg" href="${redes.instagram}" target="_blank" rel="noopener">${raw(brand('instagram'))} Instagram</a>
          <a class="btn btn-white btn-lg" href="${redes.facebook}" target="_blank" rel="noopener">${raw(brand('facebook'))} Facebook</a>
        </div>
        <p class="muted" style="margin-top:14px;font-size:.88rem">Participación gratuita ligada a tu compra. No se venden números. Solo mayores de 18 años.</p>
      </div></section>`,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  Compra guiada (Recargas y Streaming)
// ═══════════════════════════════════════════════════════════════════
const NOTAS_RAPIDAS = ['1 mes', '3 meses', '6 meses', '12 meses', 'Cuenta completa', 'Un perfil'];

function pick(p, i) {
  return html`<label class="pick" data-id="${p.id}" data-sub="${p.sub}" style="${raw(esc(estiloOrb(p, i)))}">
    <input type="radio" name="prod" value="${p.id}">
    <span class="pick-orb">${contenidoOrb(p)}</span>
    <span class="pick-name">${p.operador || p.nombre}</span>
    <span class="pick-price">${p.opciones.length > 1 ? 'desde ' : ''}${money(precioDesde(p))}</span>
  </label>`;
}

function compraGuiada(catKey, lista, subFijo) {
  const cat = CATS[catKey];
  const stream = catKey === 'digital';
  const subs = stream && !subFijo ? cat.subs.filter(([k]) => lista.some((p) => p.sub === k)) : [];
  const conSubs = subs.length > 1;
  const n = conSubs ? 2 : 1;
  return html`<section class="arcade reveal" id="arcade" data-color="${cat.color}" data-n0="${n}" aria-labelledby="arc-t">
    <div class="arc-head">
      <span class="eyebrow">Compra guiada</span>
      <h2 id="arc-t">${stream ? 'Arma tu pedido de streaming' : 'Arma tu recarga'}</h2>
      <p>${stream ? 'Elige el servicio y cuéntanos qué necesitas. Lo agregamos a tu carrito y lo entregamos por WhatsApp.' : 'Elige qué quieres recargar, el monto y tus datos. Se entrega por WhatsApp.'}</p>
    </div>
    <form id="arc-form" novalidate>
      ${conSubs ? html`<div class="arc-step"><div class="st"><b>1</b> ¿Qué tipo buscas?</div>
        <div class="amts" role="radiogroup" aria-label="Tipo de servicio">${subs.map(([k, nom], i) => html`<label class="amt"><input type="radio" name="sub" value="${k}" ${i === 0 ? raw('checked') : ''}><span>${nom}</span></label>`)}</div></div>` : ''}
      <div class="arc-step"><div class="st"><b>${n}</b> ${stream ? 'Elige tu servicio' : '¿Qué quieres recargar?'}<span class="err" data-err="prod"></span></div>
        <div class="picks" role="radiogroup" aria-label="${stream ? 'Servicio' : 'Operador o juego'}">${lista.map((p, i) => pick(p, i))}</div></div>
      <div id="arc-dyn" aria-live="polite"></div>
      <div class="arc-bar">
        <div class="arc-sum"><small>Tu pedido</small><b id="arc-sum">Elige una opción para empezar</b></div>
        <button type="submit" class="btn btn-primary btn-lg" id="arc-add">${raw(icon('shopping-cart'))} Agregar al carrito</button>
      </div>
      <p class="arc-note">${stream ? 'Pagas al confirmar por WhatsApp. Entrega rápida después de tu pago.' : 'La recarga se acredita después de confirmar tu pago por WhatsApp.'}</p>
    </form>
  </section>`;
}

function enlazarCompraGuiada(lista) {
  const form = $('#arc-form');
  if (!form) return;
  const sec = $('#arcade');
  const dyn = $('#arc-dyn');
  const sum = $('#arc-sum');
  const n0 = Number(sec.dataset.n0 || 1);
  let actual = null;

  const filtrar = () => {
    const sub = form.elements.sub?.value;
    $$('.pick', form).forEach((el) => { el.hidden = !!sub && el.dataset.sub !== sub; });
    if (actual && sub && actual.sub !== sub) { actual = null; form.querySelectorAll('input[name="prod"]').forEach((i) => { i.checked = false; }); pintar(); }
  };
  function pintar() {
    if (!actual) { dyn.innerHTML = ''; resumen(); return; }
    const p = actual;
    let n = n0 + 1;
    const partes = [];
    if (p.opciones.length) {
      partes.push(html`<div class="arc-step"><div class="st"><b>${n++}</b> ${p.cat === 'recargas' ? 'Elige el monto' : 'Elige tu opción'}<span class="err" data-err="opcion"></span></div>
        <div class="amts" role="radiogroup" aria-label="${p.cat === 'recargas' ? 'Monto' : 'Opción'}">${p.opciones.map((o) => html`<label class="amt"><input type="radio" name="opcion" value="${o.nombre}" data-precio="${o.precio}" ${p.opciones.length === 1 ? raw('checked') : ''}><span>${o.nombre}${p.cat !== 'recargas' ? html`<small>${money(o.precio)}</small>` : ''}</span></label>`)}</div></div>`);
    }
    if (p.campos.length) {
      partes.push(html`<div class="arc-step"><div class="st"><b>${n++}</b> Tus datos</div><div class="arc-fields">
        ${p.campos.map((c) => html`<div class="field"><label for="a-${c.id}">${c.etiqueta}</label>
          <input class="input" id="a-${c.id}" name="c_${c.id}" type="${c.tipo === 'tel' ? 'tel' : 'text'}" ${c.tipo === 'tel' ? raw('inputmode="numeric" autocomplete="tel"') : raw('autocomplete="off"')} placeholder="${c.ayuda || ''}">
          <span class="err" data-err="c_${c.id}"></span></div>`)}</div></div>`);
    }
    if (p.cat === 'digital') {
      partes.push(html`<div class="arc-step"><div class="st"><b>${n++}</b> ¿Qué necesitas? <span class="muted" style="font:600 .85rem var(--f-body)">(opcional)</span></div>
        <div class="amts" aria-label="Opciones rápidas">${NOTAS_RAPIDAS.map((t) => html`<button type="button" class="btn btn-ghost btn-sm" data-nota="${t}">${t}</button>`)}</div>
        <div class="field"><label class="sr-only" for="a-nota">Detalle de tu pedido</label>
          <textarea class="input" id="a-nota" name="nota" rows="2" maxlength="160" placeholder="Ej.: 3 meses, perfil para 1 persona"></textarea></div></div>`);
    }
    if (p.edad >= 18) {
      partes.push(html`<div class="arc-step"><label class="age-check"><input type="checkbox" name="edad"><span>Declaro que soy <b>mayor de ${p.edad} años</b> y juego con responsabilidad.</span></label><span class="err" data-err="edad"></span></div>`);
    }
    dyn.innerHTML = partes.map((x) => x.toString()).join('');
    resumen();
  }
  function resumen() {
    if (!actual) { sum.textContent = 'Elige una opción para empezar'; return; }
    const o = form.elements.opcion?.value;
    const precio = o ? Number(form.querySelector('input[name="opcion"]:checked')?.dataset.precio) : (actual.opciones.length ? null : actual.precio);
    const nombre = actual.operador || actual.nombre;
    sum.innerHTML = precio == null
      ? `${esc(nombre)} · <em>elige el monto</em>`
      : `${esc(nombre)}${o && actual.cat === 'recargas' ? '' : o ? ' · ' + esc(o) : ''} · <em>${money(precio)}</em>`;
  }
  form.addEventListener('change', (e) => {
    if (e.target.name === 'prod') { actual = lista.find((p) => p.id === e.target.value) || null; pintar(); }
    else if (e.target.name === 'sub') filtrar();
    else if (e.target.name === 'opcion') { resumen(); form.querySelector('[data-err="opcion"]')?.replaceChildren(); }
    form.querySelector('[data-err="prod"]')?.replaceChildren();
  });
  form.addEventListener('input', (e) => {
    e.target.removeAttribute('aria-invalid');
    form.querySelector(`[data-err="${e.target.name}"]`)?.replaceChildren();
  });
  form.addEventListener('click', (e) => {
    const b = e.target.closest('[data-nota]');
    if (!b) return;
    const t = form.elements.nota;
    if (t) { t.value = t.value ? `${t.value}, ${b.dataset.nota}` : b.dataset.nota; t.focus({ preventScroll: true }); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.querySelectorAll('.err').forEach((x) => (x.textContent = ''));
    form.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    if (!actual) { form.querySelector('[data-err="prod"]').textContent = 'Elige una opción.'; sec.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' }); return; }
    const p = actual;
    const fd = new FormData(form);
    const errores = {};
    const opcion = fd.get('opcion') || '';
    if (p.opciones.length && !opcion) errores.opcion = 'Elige una opción.';
    const campos = {};
    for (const c of p.campos) {
      const v = String(fd.get('c_' + c.id) || '').trim();
      campos[c.id] = v;
      if (c.requerido !== false && !v) errores['c_' + c.id] = 'Este dato es obligatorio.';
      else if (v && c.patron && !new RegExp(c.patron).test(v)) errores['c_' + c.id] = c.ayuda ? `Revisa el formato. ${c.ayuda}` : 'Revisa el formato.';
    }
    if (p.edad >= 18 && !fd.get('edad')) errores.edad = 'Debes confirmar que eres mayor de edad.';
    const claves = Object.keys(errores);
    if (claves.length) {
      claves.forEach((k) => {
        const er = form.querySelector(`[data-err="${k}"]`);
        if (er) er.textContent = errores[k];
        form.querySelector(`[name="${k}"]`)?.setAttribute('aria-invalid', 'true');
      });
      form.querySelector(`[data-err="${claves[0]}"]`)?.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
      return;
    }
    const nota = String(fd.get('nota') || '').trim();
    if (nota) campos.nota = nota;
    cart.add(p, { qty: 1, opcion, campos });
    volarAlCarrito($('#arc-add'), p.imagenes[0], (p.operador || p.nombre).slice(0, 1));
    aviso(`${p.operador || p.nombre} agregado`, { texto: 'Ver carrito', fn: abrirCarrito });
  });
  filtrar();
  if (lista.length === 1) {
    const i = form.querySelector('input[name="prod"]');
    i.checked = true; actual = lista[0]; pintar();
  }
}

// Ecuabet: información para quien quiere abrir cuenta, recargar o retirar
function ecuabetPanel() {
  const E = CONFIG.ecuabet;
  if (!E.activo) return '';
  return html`<section class="ecu reveal" aria-labelledby="ecu-t">
    <div><span class="eyebrow">Ecuabet · solo +18</span>
      <h2 id="ecu-t" style="margin-top:6px">Te ayudamos con tu cuenta Ecuabet</h2></div>
    <div class="ecu-grid">
      <div class="ecu-item"><b>${money(E.recargaDesde)}</b><span>Recargas desde ${money(E.recargaDesde)}</span></div>
      <div class="ecu-item"><b>${money(E.retiroDesde)}</b><span>Retiros desde ${money(E.retiroDesde)}</span></div>
      <div class="ecu-item"><b>${raw(icon('user-plus'))}</b><span>Te ayudamos a crear tu cuenta</span></div>
    </div>
    <div class="ecu-gift">${raw(icon('gift'))}<div><b>Regalo al crear tu cuenta con nuestra ayuda:</b> ${E.bono}.</div></div>
    <div class="ecu-cta">
      <a class="btn btn-lime" href="${waLink('Hola, quiero que me ayuden a crear mi cuenta de Ecuabet.')}" target="_blank" rel="noopener">${raw(icon('user-plus'))} Quiero crear mi cuenta</a>
      <a class="btn btn-cyan" href="${waLink('Hola, quiero hacer un retiro de Ecuabet.')}" target="_blank" rel="noopener">${raw(icon('banknote'))} Quiero retirar</a>
    </div>
    <small>${E.nota} Solo mayores de 18 años. Juega con responsabilidad: el juego puede causar adicción. <a href="#/legal/juego-responsable">Más información</a>.</small>
  </section>`;
}
function ecuabetFranja() {
  const E = CONFIG.ecuabet;
  if (!E.activo) return '';
  return html`<a class="note" href="${ruta('recargas')}/ecuabet" data-color="teal" style="margin-bottom:16px;align-items:center">${raw(icon('star'))}<div><b>Ecuabet +18:</b> te ayudamos a crear tu cuenta y te regalamos ${E.bono}. Recargas desde ${money(E.recargaDesde)} · retiros desde ${money(E.retiroDesde)}. <b>Ver más</b></div></a>`;
}

// ═══════════════════════════════════════════════════════════════════
//  Categorías
// ═══════════════════════════════════════════════════════════════════
const estadoLista = { orden: 'rel', pagina: 1 };

function ordenar(lista) {
  const l = [...lista];
  if (estadoLista.orden === 'asc') l.sort((a, b) => precioDesde(a) - precioDesde(b));
  else if (estadoLista.orden === 'desc') l.sort((a, b) => precioDesde(b) - precioDesde(a));
  else if (estadoLista.orden === 'oferta') l.sort((a, b) => Number(promoActiva(b)) - Number(promoActiva(a)));
  return l;
}

const slugGrupo = (g) => norm(g).replace(/\s+/g, '-');

function listaDe(catKey, sub, grupo) {
  let l = porCategoria(catKey, sub);
  if (grupo) l = l.filter((p) => slugGrupo(p.grupo || '') === grupo);
  return l;
}

function cuerpoLista(lista, catKey) {
  const ord = ordenar(lista);
  const visibles = ord.slice(0, PAGE * estadoLista.pagina);
  return html`<h2 class="sr-only">Productos</h2><p class="result-count" aria-live="polite">${lista.length} ${lista.length === 1 ? 'producto' : 'productos'}</p>
    ${rejilla(visibles, catKey)}
    ${visibles.length < ord.length ? html`<div class="more-wrap"><button class="btn btn-ghost btn-lg" data-more>Ver más (${ord.length - visibles.length})</button></div>` : ''}`;
}

function avisoLocal() {
  const est = estadoLocal();
  return html`<div class="note loc" style="margin-bottom:16px">${raw(icon('map-pin'))}<div><b>También puedes comprar en nuestro local</b> · ${est.abierto ? 'Abierto ahora' : 'Cerrado ahora'}.
    <a href="${CONFIG.local.enlace}" target="_blank" rel="noopener">Cómo llegar</a> · <a href="#/local">Ver horario</a></div></div>`;
}

const MSG_VACIO = {
  rosas: { titulo: 'Estamos preparando las variedades', texto: 'Escríbenos y te enviamos las variedades disponibles con su precio por bonche. Enviamos a Ecuador, Perú y Colombia.', msg: 'Hola, quiero ver las variedades de rosas y el precio por bonche.' },
  clases: { titulo: 'Consulta horarios y cupos', texto: 'El acompañamiento estudiantil para EGB está a cargo de una Licenciada en Ciencias de la Educación Básica. Escríbenos y te confirmamos horarios y cupos disponibles.', msg: 'Hola, quiero consultar horarios y cupos del acompañamiento estudiantil.' },
  videojuegos: { titulo: 'Recargas de videojuegos', texto: 'Escríbenos con el juego y el monto que necesitas (por ejemplo Free Fire) y te confirmamos el precio.', msg: 'Hola, quiero una recarga de videojuegos.' },
};

function vistaCategoria(catKey, sub, grupo) {
  const cat = CATS[catKey];
  const subs = cat.subs;
  if (sub && !subs.find((s) => s[0] === sub)) return noEncontrada();
  const lista = listaDe(catKey, sub, grupo);
  estadoLista.pagina = 1;
  const subTitulo = sub ? subNombre(catKey, sub) : '';
  const grupos = catKey === 'ropa' && sub === 'varios'
    ? [...new Set(porCategoria('ropa', 'varios').map((p) => p.grupo).filter(Boolean))]
    : [];
  const base = ruta(catKey);
  const totalCat = porCategoria(catKey).length;
  const tabs = subs.length
    ? html`<nav class="tabs" aria-label="Subcategorías">
        <a class="tab" href="${base}" aria-current="${!sub}">Todo <small>${totalCat}</small></a>
        ${subs.map(([k, n]) => html`<a class="tab" href="${base}/${k}" aria-current="${sub === k}">${n} <small>${porCategoria(catKey, k).length}</small></a>`)}
      </nav>` : html`<div class="tabs"></div>`;
  const chipsGrupo = grupos.length > 1
    ? html`<nav class="tabs" style="margin-bottom:14px" aria-label="Tipo">
        <a class="tab" href="${base}/varios" aria-current="${!grupo}">Todo</a>
        ${grupos.map((g) => html`<a class="tab" href="${base}/varios/${slugGrupo(g)}" aria-current="${grupo === slugGrupo(g)}">${g}</a>`)}
      </nav>` : '';
  const guiada = (catKey === 'recargas' || catKey === 'digital') && lista.length > 0;
  const notas = [];
  if (catKey === 'rosas') notas.push(html`<div class="note" style="margin-bottom:16px">${raw(icon('truck'))}<div>Sin envío gratis: el envío de rosas se acuerda contigo por WhatsApp. Enviamos a ${CONFIG.envio.paisesRosas.join(', ')}.</div></div>`);
  if (catKey === 'recargas' && !sub) notas.push(ecuabetFranja());
  if (catKey === 'recargas' && (!sub || sub === 'celulares')) notas.push(html`<div class="note" style="margin-bottom:16px">${raw(icon('smartphone'))}<div>¿Buscas una recarga ilimitada u otro monto? <a href="${waLink('Hola, quiero consultar precios de recargas ilimitadas.')}" target="_blank" rel="noopener">Consulta por WhatsApp</a>.</div></div>`);
  if (catKey === 'recargas' && sub === 'ecuabet') notas.push(html`<div class="note warn" style="margin-bottom:16px">${raw(icon('triangle-alert'))}<div><b>Solo mayores de 18 años.</b> Juega con responsabilidad: el juego puede causar adicción. <a href="#/legal/juego-responsable">Más información</a>.</div></div>`);
  if (['ropa', 'recargas', 'rosas'].includes(catKey)) notas.push(avisoLocal());
  const cuerpo = lista.length
    ? cuerpoLista(lista, catKey)
    : vacio({ cat: catKey, ...(MSG_VACIO[sub] || MSG_VACIO[catKey] || { titulo: 'Pronto habrá productos aquí', texto: 'Estamos cargando el catálogo. Escríbenos y te ayudamos.', msg: `Hola, quiero consultar sobre ${cat.nombre}.` }) });
  const titulo = subTitulo ? `${cat.nombre}:` : cat.nombre;
  return {
    title: `${subTitulo ? subTitulo + ' · ' : ''}${cat.nombre} · ${CONFIG.marca.nombre}`,
    desc: `${cat.nombre}${subTitulo ? ' ' + subTitulo : ''} en ${CONFIG.marca.nombre}. ${cat.bajada}.`,
    html: html`${banner({ eyebrow: cat.bajada, titulo, resaltado: subTitulo, color: cat.color, img: cat.banner, extra: follow(catKey), crumbs: sub ? [[cat.nombre, base], [subTitulo]] : [[cat.nombre]] })}
      <section class="container" data-color="${cat.color}" style="padding-bottom:24px">
        <div class="toolbar">${tabs}
          ${lista.length > 1 ? html`<select class="sort" id="sort" aria-label="Ordenar"><option value="rel">Relevancia</option><option value="asc">Menor precio</option><option value="desc">Mayor precio</option><option value="oferta">Ofertas primero</option></select>` : ''}
        </div>
        ${catKey === 'recargas' && sub === 'ecuabet' ? ecuabetPanel() : ''}
        ${chipsGrupo}${notas}
        ${guiada ? compraGuiada(catKey, lista, sub) : ''}
        ${guiada && lista.length > 1 ? html`<div class="section-head" style="margin-bottom:16px"><div><h2 style="font-size:clamp(1.4rem,1rem+1.6vw,2.1rem)">Todo el catálogo</h2></div></div>` : ''}
        <div id="lista">${guiada && lista.length <= 1 ? '' : cuerpo}</div>
      </section>`,
    after: () => { if (!(guiada && lista.length <= 1)) enlazarLista(() => lista, catKey); if (guiada) enlazarCompraGuiada(lista); },
  };
}

function enlazarLista(getLista, catKey) {
  const cont = $('#lista');
  const sort = $('#sort');
  const pintar = () => { cont.innerHTML = cuerpoLista(getLista(), catKey).toString(); revelar(cont); };
  sort?.addEventListener('change', () => { estadoLista.orden = sort.value; estadoLista.pagina = 1; pintar(); });
  cont?.addEventListener('click', (e) => {
    if (e.target.closest('[data-more]')) { estadoLista.pagina += 1; pintar(); }
  });
}

function vistaPromos(catSel) {
  const todasP = promos();
  const catsConPromo = CAT_ORDER.filter((c) => todasP.some((p) => p.cat === c));
  const lista = catSel ? todasP.filter((p) => p.cat === catSel) : todasP;
  estadoLista.pagina = 1;
  const tabs = html`<nav class="tabs" aria-label="Filtrar por categoría">
      <a class="tab" href="#/promociones" aria-current="${!catSel}">Todas <small>${todasP.length}</small></a>
      ${catsConPromo.map((c) => html`<a class="tab" href="#/promociones/${CATS[c].slug}" aria-current="${catSel === c}">${CATS[c].nombre} <small>${todasP.filter((p) => p.cat === c).length}</small></a>`)}
    </nav>`;
  return {
    title: `Promociones · ${CONFIG.marca.nombre}`,
    desc: 'Promociones y ofertas de BHALLEFFORT: ropa, streaming, programas y más con precio rebajado.',
    html: html`${banner({ eyebrow: 'Promociones', titulo: 'Ofertas', resaltado: 'del momento', lead: 'Cada producto en oferta aparece también en su categoría. Los precios cambian cuando termina la promoción.', color: 'coral', img: BANNERS_EXTRA.promociones.banner, crumbs: [['Promociones']] })}
      <section class="container" data-color="coral" style="padding-bottom:24px">
        <div class="toolbar">${tabs}${lista.length > 1 ? html`<select class="sort" id="sort" aria-label="Ordenar"><option value="rel">Relevancia</option><option value="asc">Menor precio</option><option value="desc">Mayor precio</option></select>` : ''}</div>
        <div id="lista">${lista.length ? cuerpoLista(lista, null) : html`<div class="empty" data-color="coral"><span class="empty-ic">${raw(icon('badge-percent'))}</span><h2>No hay promociones activas</h2><p>Vuelve pronto o síguenos en redes para enterarte primero.</p><a class="btn btn-primary" href="#/">Volver al inicio</a></div>`}</div>
      </section>`,
    after: () => enlazarLista(() => lista, null),
  };
}

// ═══════════════════════════════════════════════════════════════════
//  Acompañamiento estudiantil
// ═══════════════════════════════════════════════════════════════════
function vistaClases() {
  const cat = CATS.clases;
  const lista = porCategoria('clases');
  const redes = redesDe('clases');
  const TXT = {
    tiktok: ['Tips y tareas en video corto', 'Sigue en TikTok'],
    youtube: ['Clases completas y repasos', 'Suscríbete en YouTube'],
    instagram: ['Material y novedades', 'Sigue en Instagram'],
  };
  return {
    title: `${cat.nombre} · ${CONFIG.marca.nombre}`,
    desc: 'Acompañamiento estudiantil para EGB a cargo de una Licenciada en Ciencias de la Educación Básica. Consulta horarios y cupos por WhatsApp.',
    html: html`${banner({ eyebrow: 'Educación General Básica', titulo: 'Acompañamiento', resaltado: 'estudiantil', lead: 'Apoyo escolar para estudiantes de EGB, a cargo de una Licenciada en Ciencias de la Educación Básica.', color: 'green', img: cat.banner, extra: follow('clases', 'Síguenos en'), crumbs: [[cat.nombre]] })}
      <section class="section" style="padding-top:12px" data-color="green"><div class="container">
        ${lista.length ? html`<h2 class="sr-only">Servicios</h2><div class="grid" data-media="16 / 10">${lista.map((p, i) => tarjeta(p, i))}</div>` : ''}
        <div class="feature reveal" data-color="green" style="margin-top:${lista.length ? '40px' : '0'}">
          <span class="feature-ic">${raw(icon('graduation-cap'))}</span>
          <h2>Consulta horarios y cupos</h2>
          <p>Cuéntanos el grado y lo que necesitas reforzar. Te confirmamos horarios y cupos disponibles.</p>
          <a class="btn btn-wa btn-lg" href="${waLink('Hola, quiero consultar horarios y cupos del acompañamiento estudiantil.')}" target="_blank" rel="noopener">${raw(brand('whatsapp'))} Consultar por WhatsApp</a>
        </div>
        <div class="section-head" style="margin-top:clamp(36px,5vw,64px)"><div><span class="eyebrow">Aprende también en redes</span><h2>Sigue las clases en línea</h2></div></div>
        <div class="steps">
          ${redes.map(({ r, n, url }, i) => html`<article class="step plain reveal" data-color="green" style="--i:${i}">
            <span class="ic-wrap">${raw(brand(r))}</span><h3>${n}</h3><p>${TXT[r][0]}</p>
            ${url ? html`<a class="btn btn-lime btn-sm" href="${url}" target="_blank" rel="noopener" style="margin-top:14px">${TXT[r][1]}</a>`
              : html`<span class="btn btn-ghost btn-sm" aria-disabled="true" style="margin-top:14px">Próximamente</span>`}
          </article>`)}
        </div>
        <p class="muted" style="margin-top:20px;font-size:.88rem">Los datos de niñas, niños y adolescentes se tratan solo con autorización de su representante. <a href="#/legal/privacidad" style="text-decoration:underline">Política de privacidad</a>.</p>
      </div></section>`,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  Producto
// ═══════════════════════════════════════════════════════════════════
function vistaProducto(id) {
  const p = porId(id);
  if (!p) return noEncontrada();
  const cat = CATS[p.cat];
  const dos = p.imagenes.length > 1;
  const subT = subNombre(p.cat, p.sub);
  const rel = porCategoria(p.cat, p.cat === 'ropa' ? p.sub : null).filter((x) => x.id !== p.id).slice(0, 4);
  const stage = p.imagenes.length
    ? html`<div class="flip"><div class="flip-in">
        <div class="face front"><img src="${p.imagenes[0]}" alt="${p.nombre}" decoding="async" fetchpriority="high"></div>
        ${dos ? html`<div class="face back"><img src="${p.imagenes[1]}" alt="${p.nombre}, otra vista" decoding="async"></div>` : ''}
      </div></div>`
    : placeholder(p);
  const envioTxt = cat.envio === 'fisico'
    ? `Envío ${money(CONFIG.envio.costo)}. Gratis desde ${money(CONFIG.envio.gratisDesde)} de compra.`
    : cat.envio === 'acordar'
      ? `Sin envío gratis. El envío a ${CONFIG.envio.paisesRosas.join(', ')} se acuerda contigo por WhatsApp.`
      : 'Producto digital: se entrega por WhatsApp, sin costo de envío.';
  const grupoTallas = p.tallas.length > 1
    ? html`<div class="opt-group"><div class="lbl"><span>${p.grupo === 'Calzado' ? 'Talla (número)' : 'Talla'}</span><span class="err" data-err="talla"></span></div>
        <div class="chips" role="radiogroup" aria-label="Talla">${p.tallas.map((t) => html`<label class="chip-radio"><input type="radio" name="talla" value="${t}"><span class="chip">${t}</span></label>`)}</div></div>`
    : '';
  const grupoOpc = p.opciones.length
    ? html`<div class="opt-group"><div class="lbl"><span>${p.cat === 'recargas' ? 'Monto' : 'Opción'}</span><span class="err" data-err="opcion"></span></div>
        <div class="chips" role="radiogroup" aria-label="Opción">${p.opciones.map((o) => html`<label class="chip-radio"><input type="radio" name="opcion" value="${o.nombre}" data-precio="${o.precio}" ${p.opciones.length === 1 ? raw('checked') : ''}><span class="chip">${o.nombre}${p.cat !== 'recargas' ? html`<small>${money(o.precio)}</small>` : ''}</span></label>`)}</div></div>`
    : '';
  const campos = p.campos.map((c) => html`<div class="field"><label for="c-${c.id}">${c.etiqueta}</label>
      ${c.tipo === 'select'
        ? html`<select class="input" id="c-${c.id}" name="c_${c.id}"><option value="">Elige</option>${(c.opciones || []).map((o) => html`<option>${o}</option>`)}</select>`
        : html`<input class="input" id="c-${c.id}" name="c_${c.id}" type="${c.tipo === 'tel' ? 'tel' : 'text'}" ${c.tipo === 'tel' ? raw('inputmode="numeric" autocomplete="tel"') : raw('autocomplete="off"')} placeholder="${c.ayuda || ''}">`}
      <span class="err" data-err="c_${c.id}"></span></div>`);
  const nota = p.cat === 'digital'
    ? html`<div class="field"><label for="c-nota">¿Qué necesitas? <span class="muted" style="font-weight:600">(opcional)</span></label>
        <textarea class="input" id="c-nota" name="nota" rows="2" maxlength="160" placeholder="Ej.: 3 meses, perfil para 1 persona"></textarea></div>`
    : '';
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.nombre, description: p.descripcion || p.nombre,
    image: p.imagenes.map((i) => new URL(i, CONFIG.marca.dominio + '/').href), sku: p.id,
    brand: { '@type': 'Brand', name: CONFIG.marca.nombre },
    offers: { '@type': 'Offer', priceCurrency: 'USD', price: precioDesde(p).toFixed(2), availability: p.agotado ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', url: `${CONFIG.marca.dominio}/#/p/${p.id}` },
  };
  const wa = waLink(`Hola, tengo una consulta sobre: ${p.nombre}`);
  return {
    title: `${p.nombre} · ${CONFIG.marca.nombre}`,
    desc: `${p.nombre}. ${p.descripcion || ''} ${money(precioDesde(p))}.`.trim(),
    jsonld,
    html: html`<div class="container" data-color="${cat.color}" ${hexOk(p.color) ? raw(`style="${esc(estiloColor(p))}"`) : ''}>
      <nav class="crumbs" style="margin-top:20px" aria-label="Ruta"><a href="#/">Inicio</a> ${raw(icon('chevron-right'))} <a href="${ruta(p.cat)}">${cat.nombre}</a>
        ${subT ? html` ${raw(icon('chevron-right'))} <a href="${ruta(p.cat)}/${p.sub}">${subT}</a>` : ''} ${raw(icon('chevron-right'))} <span>${p.nombre}</span></nav>
      <div class="pdp" style="--media:${cat.media}">
        <div class="pdp-gallery">
          <div class="pdp-stage"><div class="pdp-card" data-tilt="4" data-flipwrap id="pdp-card">
            ${stage}<div class="flags">${etiquetas(p)}</div>
            ${dos ? html`<button class="flip-btn" data-flip aria-pressed="false" aria-label="Ver otra foto">${raw(icon('refresh-cw'))}</button>` : ''}
          </div></div>
          ${dos ? html`<div class="pdp-thumbs"><button class="thumb" data-thumb="0" aria-pressed="true" aria-label="Foto frontal"><img src="${p.imagenes[0]}" alt=""></button><button class="thumb" data-thumb="1" aria-pressed="false" aria-label="Otra foto"><img src="${p.imagenes[1]}" alt=""></button></div>` : ''}
        </div>
        <div class="pdp-info">
          <span class="eyebrow">${subT || cat.nombre}${p.grupo && p.sub === 'varios' ? ' · ' + p.grupo : ''}</span>
          <h1>${p.nombre}</h1>
          <div class="pdp-price"><b id="pdp-precio">${money(precioDesde(p))}</b>
            ${promoActiva(p) ? html`<s>${money(p.precio_antes)}</s><span class="save">Ahorras ${money(p.precio_antes - p.precio)}</span>` : ''}
            ${p.cat === 'rosas' ? html`<span class="muted">por bonche</span>` : ''}
            ${p.opciones.length > 1 ? html`<span class="muted" id="pdp-desde">desde</span>` : ''}</div>
          ${p.descripcion ? html`<p class="pdp-desc">${p.descripcion}</p>` : ''}
          <form id="pdp-form" class="opt-group" style="gap:18px" novalidate>
            ${grupoTallas}${grupoOpc}${campos}${nota}
            ${p.edad >= 18 ? html`<div class="note warn">${raw(icon('triangle-alert'))}<div><b>Solo mayores de ${p.edad} años.</b> Juega con responsabilidad.</div></div>` : ''}
            ${p.cat !== 'clases' ? html`<div class="buy-row">
              <div class="qty" role="group" aria-label="Cantidad"><button type="button" data-q="-1" aria-label="Menos">${raw(icon('minus'))}</button><output id="pdp-qty">1</output><button type="button" data-q="1" aria-label="Más">${raw(icon('plus'))}</button></div>
              ${p.agotado ? html`<a class="btn btn-wa btn-lg" href="${waLink('Hola, ¿cuándo habrá disponible: ' + p.nombre + '?')}" target="_blank" rel="noopener">Avísame cuando haya</a>`
                : html`<button type="submit" class="btn btn-primary btn-lg" id="pdp-add">${raw(icon('shopping-cart'))} Agregar al carrito</button>`}
            </div>` : html`<a class="btn btn-wa btn-lg" href="${waLink('Hola, quiero consultar horarios y cupos de: ' + p.nombre)}" target="_blank" rel="noopener">${raw(brand('whatsapp'))} Consultar horarios y cupos</a>`}
          </form>
          <div class="pdp-meta">
            <div>${raw(icon('truck'))}<span>${envioTxt}</span></div>
            ${p.cat === 'ropa' ? html`<div>${raw(icon('history'))}<span>Cambios y devoluciones: <a href="#/legal/devoluciones">ver política</a>.</span></div>` : ''}
            <div>${raw(brand('whatsapp'))}<span>¿Dudas? <a href="${wa}" target="_blank" rel="noopener">Escríbenos por WhatsApp</a>.</span></div>
          </div>
        </div>
      </div>
      ${rel.length ? html`<section class="section" style="padding-top:8px"><div class="section-head"><h2>También te puede gustar</h2></div>${rejilla(rel, p.cat)}</section>` : ''}
    </div>`,
    after: () => enlazarProducto(p),
  };
}

function enlazarProducto(p) {
  const form = $('#pdp-form');
  const card = $('#pdp-card');
  if (!form) return;
  let qty = 1;
  const out = $('#pdp-qty');
  form.addEventListener('click', (e) => {
    const q = e.target.closest('[data-q]');
    if (q) { qty = Math.max(1, Math.min(99, qty + Number(q.dataset.q))); out.textContent = qty; }
  });
  form.addEventListener('change', (e) => {
    if (e.target.name === 'opcion') {
      $('#pdp-precio').textContent = money(Number(e.target.dataset.precio));
      $('#pdp-desde')?.remove();
    }
    form.querySelector(`[data-err="${e.target.name}"]`)?.replaceChildren();
  });
  form.addEventListener('input', (e) => {
    e.target.removeAttribute('aria-invalid');
    form.querySelector(`[data-err="${e.target.name}"]`)?.replaceChildren();
  });
  $$('[data-thumb]').forEach((b) => b.addEventListener('click', () => {
    const flip = card.querySelector('.flip');
    const back = flip.querySelector('.face.back img[data-src]');
    if (back) { back.src = back.dataset.src; back.removeAttribute('data-src'); }
    flip.classList.toggle('is-flipped', b.dataset.thumb === '1');
    $$('[data-thumb]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const errores = {};
    let talla = fd.get('talla') || '';
    if (p.tallas.length === 1) talla = p.tallas[0];
    if (p.tallas.length > 1 && !talla) errores.talla = 'Elige una talla.';
    const opcion = fd.get('opcion') || '';
    if (p.opciones.length && !opcion) errores.opcion = 'Elige una opción.';
    const campos = {};
    for (const c of p.campos) {
      const v = String(fd.get('c_' + c.id) || '').trim();
      campos[c.id] = v;
      if (c.requerido !== false && !v) errores['c_' + c.id] = 'Este dato es obligatorio.';
      else if (v && c.patron && !new RegExp(c.patron).test(v)) errores['c_' + c.id] = c.ayuda ? `Revisa el formato. ${c.ayuda}` : 'Revisa el formato.';
    }
    const nota = String(fd.get('nota') || '').trim();
    if (nota) campos.nota = nota;
    form.querySelectorAll('.err').forEach((x) => (x.textContent = ''));
    const claves = Object.keys(errores);
    if (claves.length) {
      claves.forEach((k) => {
        const er = form.querySelector(`[data-err="${k}"]`);
        if (er) er.textContent = errores[k];
        form.querySelector(`[name="${k}"]`)?.setAttribute('aria-invalid', 'true');
      });
      const el = form.querySelector(`[data-err="${claves[0]}"]`);
      el?.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
      return;
    }
    cart.add(p, { qty, talla, opcion, campos });
    volarAlCarrito($('#pdp-add'), p.imagenes[0], p.nombre.slice(0, 1));
    aviso(`${p.nombre} agregado`, { texto: 'Ver carrito', fn: abrirCarrito });
  });
}

// ═══════════════════════════════════════════════════════════════════
//  Vende con nosotros
// ═══════════════════════════════════════════════════════════════════
const QUE_VENDE = ['Ropa o calzado', 'Accesorios', 'Rosas o regalos', 'Producto digital', 'Un servicio', 'Otro'];

function vistaVende() {
  const V = CONFIG.vende;
  if (!V.activo) return noEncontrada();
  const pasos = [
    ['message-circle', 'Escríbenos', 'Cuéntanos qué vendes con el formulario o directo por WhatsApp.'],
    ['search', 'Lo revisamos', 'Revisamos tu producto y acordamos contigo las condiciones.'],
    ['store', 'Lo publicamos', 'Lo mostramos en la tienda y atendemos a los clientes por WhatsApp.'],
  ];
  return {
    title: `Vende con nosotros · ${CONFIG.marca.nombre}`,
    desc: `¿Quieres vender con nosotros? Publica tus productos en ${CONFIG.marca.nombre} y llega a más clientes. Contáctanos por WhatsApp.`,
    html: html`${banner({ eyebrow: 'Vende con nosotros', titulo: 'Vende', resaltado: 'con nosotros', lead: V.texto, color: 'blue', img: BANNERS_EXTRA.vende.banner, crumbs: [['Vende con nosotros']] })}
      <section class="section" style="padding-top:12px" data-color="blue"><div class="container">
        <h2 class="sr-only">Cómo funciona</h2>
        <div class="steps">${pasos.map(([ic, t, d], i) => html`<article class="step reveal" style="--i:${i}"><span class="ic-wrap">${raw(icon(ic))}</span><h3>${t}</h3><p>${d}</p></article>`)}</div>
        <div class="sell-layout" style="margin-top:clamp(24px,4vw,44px)">
          <form class="sell-form reveal" id="sell-form" novalidate>
            <h2>Cuéntanos qué quieres vender</h2>
            <p class="muted">Llena los datos y se abrirá WhatsApp con tu mensaje listo para enviar. No guardamos nada en esta página.</p>
            <div class="grid-2">
              <div class="field"><label for="v-nombre">Tu nombre</label><input class="input" id="v-nombre" name="nombre" autocomplete="name" placeholder="Nombre y apellido"><span class="err" data-err="nombre"></span></div>
              <div class="field"><label for="v-tel">Tu WhatsApp (opcional)</label><input class="input" id="v-tel" name="tel" type="tel" inputmode="numeric" autocomplete="tel" placeholder="09XXXXXXXX"><span class="err" data-err="tel"></span></div>
            </div>
            <div class="field"><label for="v-tipo">¿Qué quieres vender?</label>
              <select class="input" id="v-tipo" name="tipo"><option value="">Elige una opción</option>${QUE_VENDE.map((o) => html`<option>${o}</option>`)}</select><span class="err" data-err="tipo"></span></div>
            <div class="field"><label for="v-desc">Cuéntanos más</label>
              <textarea class="input" id="v-desc" name="desc" rows="3" maxlength="400" placeholder="Qué productos tienes, cantidad aproximada, precios, ciudad…"></textarea><span class="err" data-err="desc"></span></div>
            <button class="btn btn-wa btn-lg" type="submit">${raw(brand('whatsapp'))} Enviar por WhatsApp</button>
          </form>
          <aside class="contact-card reveal" style="--i:1" aria-label="Contacto">
            <h2 style="font-size:1.3rem">Prefieres hablar directo</h2>
            <a class="row" href="${waLink(V.mensajeWhatsApp)}" target="_blank" rel="noopener">${raw(brand('whatsapp'))}<span>WhatsApp<small>${waNumeroBonito()}</small></span></a>
            <a class="row" href="mailto:${CONFIG.legal.correo}?subject=${encodeURIComponent('Quiero vender con ' + CONFIG.marca.nombre)}">${raw(icon('mail'))}<span>Correo<small>${CONFIG.legal.correo}</small></span></a>
            <a class="row" href="#/local">${raw(icon('map-pin'))}<span>Visítanos en el local<small>${resumenHorario()}</small></span></a>
          </aside>
        </div>
      </div></section>`,
    after: () => enlazarVende(),
  };
}

function enlazarVende() {
  const form = $('#sell-form');
  if (!form) return;
  form.addEventListener('input', (e) => {
    e.target.removeAttribute('aria-invalid');
    form.querySelector(`[data-err="${e.target.name}"]`)?.replaceChildren();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const nombre = String(fd.get('nombre') || '').trim();
    const tel = String(fd.get('tel') || '').trim();
    const tipo = String(fd.get('tipo') || '').trim();
    const desc = String(fd.get('desc') || '').trim();
    const errores = {};
    if (!nombre) errores.nombre = 'Escribe tu nombre.';
    if (tel && !/^[0-9+\s-]{7,16}$/.test(tel)) errores.tel = 'Revisa el número.';
    if (!tipo) errores.tipo = 'Elige una opción.';
    form.querySelectorAll('.err').forEach((x) => (x.textContent = ''));
    form.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    const claves = Object.keys(errores);
    if (claves.length) {
      claves.forEach((k) => {
        form.querySelector(`[data-err="${k}"]`).textContent = errores[k];
        form.querySelector(`[name="${k}"]`)?.setAttribute('aria-invalid', 'true');
      });
      form.querySelector(`[name="${claves[0]}"]`)?.focus();
      return;
    }
    const msg = [`Hola, quiero vender con ${CONFIG.marca.nombre}.`, `Nombre: ${nombre}`, tel ? `Mi WhatsApp: ${tel}` : '', `Quiero vender: ${tipo}`, desc ? `Detalle: ${desc}` : ''].filter(Boolean).join('\n');
    window.open(waLink(msg), '_blank', 'noopener');
    aviso('Se abrió WhatsApp con tu mensaje');
  });
}

// ═══════════════════════════════════════════════════════════════════
//  Búsqueda
// ═══════════════════════════════════════════════════════════════════
function vistaBuscar(q) {
  const res = buscar(q);
  return {
    title: `Buscar: ${q} · ${CONFIG.marca.nombre}`,
    desc: `Resultados de búsqueda en ${CONFIG.marca.nombre}.`,
    noindex: true,
    html: html`${cabecera({ eyebrow: 'Búsqueda', titulo: 'Resultados para', resaltado: `“${q}”`, color: 'blue', crumbs: [['Búsqueda']] })}
      <section class="container" data-color="blue" style="padding-bottom:24px">
        ${res.length ? html`<h2 class="sr-only">Resultados</h2><p class="result-count">${res.length} ${res.length === 1 ? 'producto' : 'productos'}</p>${rejilla(res, null)}`
          : vacio({ cat: 'promos', titulo: 'No encontramos eso', texto: 'Prueba con otra palabra o pregúntanos por WhatsApp: quizá lo tenemos y aún no está en la web.', msg: `Hola, estoy buscando: ${q}` })}
      </section>`,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  Legal y 404
// ═══════════════════════════════════════════════════════════════════
function vistaLegal(slug) {
  const doc = LEGAL[slug];
  if (!doc) return noEncontrada();
  return {
    title: `${doc.titulo} · ${CONFIG.marca.nombre}`,
    desc: doc.resumen,
    html: html`<div class="container legal" data-color="blue">
      <nav class="legal-nav" aria-label="Documentos legales">${LEGAL_ORDER.map((s) => html`<a href="#/legal/${s}" aria-current="${s === slug ? 'page' : 'false'}">${LEGAL[s].corto}</a>`)}</nav>
      <article class="doc"><h1>${doc.titulo}</h1><p class="upd">Última actualización: ${CONFIG.legal.actualizado}</p>${raw(doc.html(CONFIG, { pend, money, waNumeroBonito }))}</article>
    </div>`,
  };
}

function noEncontrada() {
  return {
    title: `No encontrada · ${CONFIG.marca.nombre}`,
    desc: 'Página no encontrada.',
    noindex: true,
    html: html`<div class="container" style="padding-block:clamp(40px,8vw,120px)"><div class="empty"><span class="empty-ic">${raw(icon('search'))}</span><h1 style="font-size:clamp(2rem,1.4rem+3vw,3.4rem)">No encontramos esa página</h1><p>Puede que el enlace haya cambiado.</p><a class="btn btn-primary btn-lg" href="#/">Ir al inicio</a></div></div>`,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  Enrutador
// ═══════════════════════════════════════════════════════════════════
// Direcciones antiguas (#/digital, #/clases) se llevan a las nuevas (#/streaming, #/estudiantil)
export function canonico(hash) {
  const h = hash || '#/';
  const seg = h.replace(/^#\/?/, '').split('?')[0].split('/');
  const k = catPorSlug(seg[0]);
  if (k && seg[0] !== CATS[k].slug) { seg[0] = CATS[k].slug; return '#/' + seg.join('/'); }
  if (seg[0] === 'promociones' && seg[1]) {
    const k2 = catPorSlug(seg[1]);
    if (k2 && seg[1] !== CATS[k2].slug) { seg[1] = CATS[k2].slug; return '#/' + seg.join('/'); }
  }
  return h;
}

export function resolver(hash) {
  const ruta0 = (hash || '#/').replace(/^#\/?/, '').split('?')[0];
  const seg = ruta0.split('/').filter(Boolean).map(decodeURIComponent);
  const [a, b, c] = seg;
  if (!a) return inicio();
  const k = catPorSlug(a);
  if (k) {
    if (k === 'clases') return vistaClases();
    return vistaCategoria(k, b, c);
  }
  if (a === 'promociones') return vistaPromos(catPorSlug(b));
  if (a === 'sorteo') return vistaSorteo();
  if (a === 'como-comprar') return vistaComoComprar();
  if (a === 'local') return vistaLocal();
  if (a === 'vende') return vistaVende();
  if (a === 'p' && b) return vistaProducto(b);
  if (a === 'buscar') return vistaBuscar(seg.slice(1).join(' '));
  if (a === 'legal') return vistaLegal(b || 'terminos');
  return noEncontrada();
}

export { initMapa };
