import { CONFIG } from './config.js';
import { CATS, CAT_ORDER, subNombre, catPorSlug, ruta, BANNERS_EXTRA } from './schema.js';
import {
  porId, porCategoria, promos, destacados, buscar, promoActiva, descuentoPct,
  precioDesde, tieneVariantes,
} from './data.js';
import {
  html, raw, esc, money, norm, waLink, waNumeroBonito, estadoLocal, hora12, DIAS_ES,
  ahoraEcuador, reducedMotion, $, $$,
} from './util.js';
import { icon, brand } from './icons.js';
import { art } from './art.js';
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
  ? `--c:${p.color};--c-2:color-mix(in srgb, ${p.color} 55%, #ffffff);--c-deep:color-mix(in srgb, ${p.color} 38%, #0a0538);--c-glow:color-mix(in srgb, ${p.color} 50%, #ffffff);`
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
  return html`<article class="card reveal" data-tilt="5" data-color="${cat.color}" data-agotado="${p.agotado ? 'true' : 'false'}"
      style="${raw(esc(estiloColor(p)))}--media:${cat.media};--i:${Math.min(i, 8)}" data-flipwrap>
    <div class="card-top">
      <div class="card-media">${media}<div class="flags">${etiquetas(p)}</div></div>
      ${dos ? html`<button class="flip-btn" data-flip aria-pressed="false" aria-label="Ver otra foto">${raw(icon('refresh-cw'))}</button>` : ''}
      ${precioEtiqueta(p)}
    </div>
    <div class="card-body">
      <h3 class="card-title"><a href="#/p/${p.id}">${p.nombre}</a></h3>
      ${meta.filter(Boolean).length ? html`<div class="card-meta">${meta.filter(Boolean).join(' · ')}</div>` : ''}
      ${tallas}${montos}
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

const ARTE_CAT = { ropa: 'ropa', recargas: 'recargas', digital: 'digital', rosas: 'rosas', clases: 'clases' };

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
function banner({ eyebrow, titulo, resaltado, lead, color, arte, img, crumbs = [], extra = '' }) {
  return html`<section class="banner" data-color="${color}">
    <div class="container"><div class="banner-box">
      ${img ? html`<img class="banner-img" src="${img}" alt="" decoding="async" fetchpriority="high" data-hide>` : ''}
      <div class="banner-art" aria-hidden="true">${raw(arte || '')}</div>
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
  return html`<div class="empty">${raw(art(ARTE_CAT[cat] || 'promos'))}<h2>${titulo}</h2><p>${texto}</p>
    <a class="btn btn-wa" href="${waLink(msg)}" target="_blank" rel="noopener">${raw(brand('whatsapp'))} Preguntar por WhatsApp</a></div>`;
}

// ═══════════════════════════════════════════════════════════════════
//  Inicio
// ═══════════════════════════════════════════════════════════════════
function chipHoy() {
  const { dia } = ahoraEcuador();
  const [a, c] = CONFIG.horario[dia];
  return `Hoy ${a}:00 – ${c}:00`;
}

// Gama de colores de las esferas cuando el producto no trae color
const ORBS = [['#fff0a0', '#d9801a'], ['#ffb1d8', '#b3135f'], ['#9ff3ff', '#0a7fa6'], ['#dcc4ff', '#5a2bc4'], ['#d8ff8a', '#3b8a00'], ['#a8ccff', '#1f45c4'], ['#ffc29a', '#b83a10'], ['#9ff7ee', '#0a7f88']];
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

function inicio() {
  const est = estadoLocal();
  const pr = promos();
  const destRopa = destacados(8, 'ropa');
  const destRosas = destacados(4, 'rosas');
  const prCat = pr.some((p) => p.cat === 'ropa') ? 'ropa' : (pr[0] && pr[0].cat);
  const prHome = pr.filter((p) => p.cat === prCat).slice(0, 4);
  const sorteo = CONFIG.sorteo.activo;
  const recs = porCategoria('recargas').slice(0, 6);
  const streams = destacados(6, 'digital');
  const C = CONFIG.creditos;
  const atencion = CONFIG.marca.atencion;
  const tiles = [
    ['t1', 'ropa', 'Ropa', 'Hombre, mujer, niños y más. Calzado, mochilas y conjuntos.'],
    ['t2', 'recargas', 'Recargas', 'Claro, Movistar, Tigo, CNT, videojuegos y Ecuabet.'],
    ['t3', 'digital', 'Streaming', 'Netflix, IA y programas al instante.'],
    ['t4', 'rosas', 'Rosas', 'Por bonche. Ecuador, Perú y Colombia.'],
    ['t5', 'clases', 'Acompañamiento estudiantil', 'Apoyo escolar para EGB.'],
  ];
  const stageIcons = ['ropa', 'recargas', 'digital', 'rosas', 'clases', 'sorteo'];
  return {
    title: `${CONFIG.marca.nombre} · ${CONFIG.marca.eslogan}`,
    desc: 'Todo lo encuentras aquí: ropa, recargas, streaming, rosas y acompañamiento estudiantil. Atención al instante por WhatsApp. Sorteo mensual.',
    html: html`
    <section class="hero" aria-labelledby="h-title">
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="hero-pill reveal"><span class="dot ${est.abierto ? 'on' : ''}"></span>${est.abierto ? `Abierto ahora · cierra ${hora12(est.cierra)}` : 'Cerrado ahora · te respondemos al abrir'}</span>
          <h1 id="h-title" class="reveal" style="--i:1">${CONFIG.marca.heroTitulo} <span class="pop">${CONFIG.marca.heroResalte}</span></h1>
          <p class="lead reveal" style="--i:2">${CONFIG.marca.heroBajada} <b>${atencion}.</b></p>
          <div class="hero-cta reveal" style="--i:3">
            <a class="btn btn-primary btn-lg" href="#/promociones">${raw(icon('badge-percent'))} Ver promociones</a>
            <button class="btn btn-white btn-lg" data-scroll="categorias">Explorar ${raw(icon('arrow-down'))}</button>
          </div>
          <div class="hero-chips reveal" style="--i:4">
            <a class="chip-info hot" href="${waLink('Hola, quiero hacer una consulta.')}" target="_blank" rel="noopener">${raw(icon('zap'))} ${atencion}</a>
            <span class="chip-info">${raw(icon('store'))} Local físico</span>
            <span class="chip-info">${raw(icon('clock'))} ${chipHoy()}</span>
            <span class="chip-info">${raw(icon('truck'))} Envío gratis desde ${money(CONFIG.envio.gratisDesde)}</span>
            ${sorteo ? html`<span class="chip-info">${raw(icon('ticket'))} Sorteo mensual desde ${money(CONFIG.sorteo.minimo)}</span>` : ''}
          </div>
        </div>
        <div class="hero-stage" id="stage" aria-hidden="true">
          <div class="hero-fallback">
            <div class="fb-coin" id="fb-coin">B</div>
            ${stageIcons.map((n, i) => {
              const ang = (i / stageIcons.length) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + Math.cos(ang) * 38, y = 50 + Math.sin(ang) * 36;
              return html`<div class="fb-item" style="left:${(x - 9.5).toFixed(1)}%;top:${(y - 9.5).toFixed(1)}%;--d:${i};--r:${(i % 2 ? -6 : 6)}deg">${raw(art(n))}</div>`;
            })}
          </div>
          <canvas id="hero-canvas" aria-hidden="true"></canvas>
          <div class="stage-tip" id="stage-tip"></div>
          <div class="stage-hint">Toca un objeto o arrastra para girar</div>
        </div>
      </div>
    </section>

    <section class="section" id="categorias" style="padding-top:clamp(28px,4vw,60px)">
      <div class="container">
        <div class="section-head reveal"><div><span class="eyebrow" style="--c-glow:var(--cyan)">Categorías</span><h2>¿Qué estás buscando?</h2></div></div>
        <div class="bento">
          ${tiles.map(([cls, cat, nombre, texto], i) => html`
            <a class="tile ${cls} reveal" style="--i:${i}" href="${ruta(cat)}" data-tilt="8" data-color="${CATS[cat].color}">
              ${raw(art(cat))}
              <h3>${nombre}</h3><p>${texto}</p>
              <span class="go">Ver ${raw(icon('arrow-right'))}</span>
              <span class="tile-glare"></span>
            </a>`)}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container two">
        <article class="arcade reveal" data-color="teal">
          <div class="arcade-bg" aria-hidden="true"><i class="glow g1"></i><i class="glow g3"></i></div>
          <div class="arc-head"><span class="eyebrow">Recargas</span><h2>Recarga en segundos</h2><p>Elige el operador o juego, el monto y listo.</p></div>
          <div class="picks">${recs.map((p, i) => html`<a class="pick" href="${ruta('recargas')}/${p.sub}" style="${raw(esc(estiloOrb(p, i)))}"><span class="pick-orb">${contenidoOrb(p)}</span><span class="pick-name">${p.operador || p.nombre}</span></a>`)}</div>
          <div class="hero-cta" style="margin-top:20px"><a class="btn btn-cyan" href="${ruta('recargas')}">Armar mi recarga ${raw(icon('arrow-right'))}</a></div>
        </article>
        <article class="arcade reveal" data-color="violet" style="--i:1">
          <div class="arcade-bg" aria-hidden="true"><i class="glow g1"></i><i class="glow g2"></i></div>
          <div class="arc-head"><span class="eyebrow">Streaming</span><h2>Tus cuentas, al instante</h2><p>Netflix, IA, programas y más. Cuéntanos qué necesitas.</p></div>
          <div class="picks">${streams.map((p, i) => html`<a class="pick" href="#/p/${p.id}" style="${raw(esc(estiloOrb(p, i + 2)))}"><span class="pick-orb">${contenidoOrb(p)}</span><span class="pick-name">${p.nombre}</span></a>`)}</div>
          <div class="hero-cta" style="margin-top:20px"><a class="btn btn-pink" href="${ruta('digital')}">Armar mi pedido ${raw(icon('arrow-right'))}</a></div>
        </article>
      </div>
    </section>

    ${pr.length ? html`
    <section class="section" style="padding-top:0" data-color="coral">
      <div class="container">
        <div class="section-head reveal"><div><span class="eyebrow">Promociones</span><h2>Precios que no duran</h2></div>
          <a class="link-arrow" href="#/promociones">Ver todas ${raw(icon('arrow-right'))}</a></div>
        ${rejilla(prHome, prCat)}
      </div>
    </section>` : ''}

    ${destRopa.length ? html`<section class="section" style="padding-top:0" data-color="blue">
      <div class="container">
        <div class="section-head reveal"><div><span class="eyebrow">Destacados</span><h2>Lo que más buscan</h2></div>
          <a class="link-arrow" href="${ruta('ropa')}">Ver ropa ${raw(icon('arrow-right'))}</a></div>
        ${rejilla(destRopa, 'ropa')}
      </div>
    </section>` : ''}

    ${destRosas.length ? html`<section class="section" style="padding-top:0" data-color="rose">
      <div class="container">
        <div class="section-head reveal"><div><span class="eyebrow">Rosas</span><h2>Para regalar y sorprender</h2></div>
          <a class="link-arrow" href="${ruta('rosas')}">Ver rosas ${raw(icon('arrow-right'))}</a></div>
        ${rejilla(destRosas, 'rosas')}
      </div>
    </section>` : ''}

    ${sorteo ? bandaSorteo() : ''}

    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="dev reveal">
          <div class="dev-code" aria-hidden="true">
            <div class="dev-bar"><i></i><i></i><i></i><span>tu-negocio.com</span></div>
            <div class="dev-body"><i></i><i></i><i></i><i></i><div class="dev-btns"><b></b><b></b></div></div>
          </div>
          <div class="dev-copy">
            <span class="eyebrow" style="--c-glow:var(--cyan)">${C.titulo}</span>
            <h2>¿Quieres una página web como esta?</h2>
            <p>${C.mensaje} Soy <b>${C.nombre}</b>, el diseñador de ${CONFIG.marca.nombre}.</p>
            <a class="btn btn-pink btn-lg" href="${C.tiktok}" target="_blank" rel="noopener">${raw(brand('tiktok'))} Ver mi TikTok</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0" data-color="blue">
      <div class="container">
        <div class="section-head reveal"><div><span class="eyebrow">Cómo comprar</span><h2>Cuatro pasos y listo</h2></div>
          <a class="link-arrow" href="#/como-comprar">Más detalles ${raw(icon('arrow-right'))}</a></div>
        ${pasosCompra()}
      </div>
    </section>

    <section class="section" style="padding-top:0" data-color="blue">
      <div class="container">${bloqueLocal()}</div>
    </section>`,
    after: () => { animarCarrete(); initMapa(); },
    hero: true,
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
          <a class="btn btn-pink btn-lg" href="#/sorteo">Cómo participar</a>
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
    html: html`${banner({ eyebrow: 'Sorteo mensual', titulo: 'Compra y', resaltado: 'participa', lead: `Desde ${money(s.minimo)} de compra recibes un número del 1 al ${s.numeroMaximo}. Se reinicia cada mes.`, color: 'gold', arte: art('sorteo'), img: BANNERS_EXTRA.sorteo.banner, crumbs: [['Sorteo']] })}
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
    <div class="arcade-bg" aria-hidden="true"><i class="glow g1"></i><i class="glow g2"></i><i class="glow g3"></i><i class="glow g4"></i></div>
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
    <div><span class="eyebrow" style="--c-glow:var(--cyan)">Ecuabet · solo +18</span>
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
    <small>${E.nota} Solo mayores de 18 años. Juega con responsabilidad: el juego puede causar adicción. <a href="#/legal/juego-responsable" style="color:var(--yellow);text-decoration:underline">Más información</a>.</small>
  </section>`;
}
function ecuabetFranja() {
  const E = CONFIG.ecuabet;
  if (!E.activo) return '';
  return html`<a class="note" href="${ruta('recargas')}/ecuabet" data-color="teal" style="margin-bottom:16px;align-items:center">${raw(icon('star'))}<div><b>Ecuabet +18:</b> te ayudamos a crear tu cuenta y te regalamos ${E.bono}. Recargas desde ${money(E.recargaDesde)} · retiros desde ${money(E.retiroDesde)}. <b style="color:var(--yellow);text-decoration:underline">Ver más</b></div></a>`;
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
    html: html`${banner({ eyebrow: cat.bajada, titulo, resaltado: subTitulo, color: cat.color, arte: art(ARTE_CAT[catKey]), img: cat.banner, extra: follow(catKey), crumbs: sub ? [[cat.nombre, base], [subTitulo]] : [[cat.nombre]] })}
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
    html: html`${banner({ eyebrow: 'Promociones', titulo: 'Ofertas', resaltado: 'del momento', lead: 'Cada producto en oferta aparece también en su categoría. Los precios cambian cuando termina la promoción.', color: 'coral', arte: art('promos'), img: BANNERS_EXTRA.promociones.banner, crumbs: [['Promociones']] })}
      <section class="container" data-color="coral" style="padding-bottom:24px">
        <div class="toolbar">${tabs}${lista.length > 1 ? html`<select class="sort" id="sort" aria-label="Ordenar"><option value="rel">Relevancia</option><option value="asc">Menor precio</option><option value="desc">Mayor precio</option></select>` : ''}</div>
        <div id="lista">${lista.length ? cuerpoLista(lista, null) : html`<div class="empty">${raw(art('promos'))}<h2>No hay promociones activas</h2><p>Vuelve pronto o síguenos en redes para enterarte primero.</p><a class="btn btn-primary" href="#/">Volver al inicio</a></div>`}</div>
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
    html: html`${banner({ eyebrow: 'Educación General Básica', titulo: 'Acompañamiento', resaltado: 'estudiantil', lead: 'Apoyo escolar para estudiantes de EGB, a cargo de una Licenciada en Ciencias de la Educación Básica.', color: 'green', arte: art('clases'), img: cat.banner, extra: follow('clases', 'Síguenos en'), crumbs: [[cat.nombre]] })}
      <section class="section" style="padding-top:12px" data-color="green"><div class="container">
        ${lista.length ? html`<h2 class="sr-only">Servicios</h2><div class="grid" data-media="16 / 10">${lista.map((p, i) => tarjeta(p, i))}</div>` : ''}
        <div class="feature reveal" style="margin-top:${lista.length ? '40px' : '0'}">
          ${raw(art('clases'))}
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
    html: html`<div class="container" style="padding-block:clamp(40px,8vw,120px)"><div class="empty">${raw(art('promos'))}<h1 style="font-size:clamp(2rem,1.4rem+3vw,3.4rem)">No encontramos esa página</h1><p>Puede que el enlace haya cambiado.</p><a class="btn btn-primary btn-lg" href="#/">Ir al inicio</a></div></div>`,
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
  if (a === 'p' && b) return vistaProducto(b);
  if (a === 'buscar') return vistaBuscar(seg.slice(1).join(' '));
  if (a === 'legal') return vistaLegal(b || 'terminos');
  return noEncontrada();
}

export { initMapa };
