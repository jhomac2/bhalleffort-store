// Genera las páginas estáticas para Google y para compartir en redes:
//   /p/<nombre>-<id>/   una por producto visible
//   /c/<categoría>/     una por categoría (y por subcategoría con productos)
//   sitemap.xml         con todas las direcciones
// y un bloque de enlaces en el inicio (index.html, entre las marcas <!--seo:inicio-->).
//
// Uso:  node tools/build-seo.mjs      (no necesita instalar nada, solo Node 20 o más nuevo)
// En GitHub se ejecuta solo cuando cambias productos.json o ajustes.json (.github/workflows/seo.yml).
import { readFileSync, writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (f) => readFileSync(join(RAIZ, f), 'utf8');
const { CONFIG } = await import('../js/config.js');
const { aplicarAjustes } = await import('../js/ajustes.js');
const { CATS, CAT_ORDER, urlProducto, urlCategoria } = await import('../js/schema.js');

aplicarAjustes(JSON.parse(leer('ajustes.json')));
const DOM = CONFIG.marca.dominio;
const NOMBRE = CONFIG.marca.nombre;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '$' + (Math.round(Number(n) * 100) / 100).toFixed(2);
const abs = (u) => (u.startsWith('http') ? u : DOM + (u.startsWith('/') ? u : '/' + u));
const raiz = (u) => (u.startsWith('http') || u.startsWith('/') ? u : '/' + u);
const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: CONFIG.zonaHoraria }).format(new Date());

// ── Productos visibles ──────────────────────────────────────────────
const productos = JSON.parse(leer('productos.json'))
  .filter((p) => p && p.visible !== false && CATS[p.cat])
  .map((p) => ({
    ...p, id: String(p.id), precio: Number(p.precio) || 0,
    precio_antes: p.precio_antes ? Number(p.precio_antes) : null,
    imagenes: (Array.isArray(p.imagenes) ? p.imagenes : []).filter(Boolean),
    opciones: Array.isArray(p.opciones) ? p.opciones : [],
  }));
const desde = (p) => (p.opciones.length ? Math.min(...p.opciones.map((o) => Number(o.precio) || 0)) : p.precio);
const enOferta = (p) => p.oferta && p.precio_antes && p.precio_antes > p.precio && !(p.promo_hasta && hoy > p.promo_hasta);
const subNombre = (k, s) => CATS[k].subs.find((x) => x[0] === s)?.[1] || '';
const porCat = (k, sub) => productos.filter((p) => p.cat === k && (!sub || p.sub === sub));
const fin = (t) => { const s = String(t).trim(); return /[.!?…]$/.test(s) ? s : s + '.'; };
const recorta = (t, n) => { const s = String(t).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };

// ── Plantilla: el propio index.html con rutas absolutas ─────────────
const indexSrc = leer('index.html');
const MARCA_I = ['<!--seo:inicio-->', '<!--/seo:inicio-->'];
const plantilla = indexSrc
  .replace(new RegExp(`${MARCA_I[0]}[\\s\\S]*?${MARCA_I[1]}`), '')
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/, '')
  .replace(/(href|src)="(?!https?:|\/|#|data:)([^"]+)"/g, '$1="/$2"');

function pagina({ titulo, desc, canonica, ogImg, ogTipo = 'website', jsonld = [], ruta, cuerpo, extraMeta = '' }) {
  const ld = jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  let h = plantilla
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(titulo)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${esc(canonica)}">`)
    .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${ogTipo}">`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${esc(canonica)}">`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(titulo)}">`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta property="og:image" [^>]*>/, `<meta property="og:image" content="${esc(ogImg)}">`)
    .replace(/<meta property="og:image:width"[^>]*>\s*<meta property="og:image:height"[^>]*>/, ogImg.endsWith('og.jpg') ? '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">' : '')
    .replace('</head>', `${extraMeta}${ld}\n<script>window.__BH_RUTA=${JSON.stringify(ruta)}</script>\n</head>`)
    .replace(/<main id="main" tabindex="-1"><\/main>/, `<main id="main" tabindex="-1">${cuerpo}</main>`);
  return h;
}

const escribe = (rel, txt) => { const f = join(RAIZ, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, txt); };
const barra = `<nav class="seo-top" aria-label="Principal"><a href="/"><b>${esc(NOMBRE)}</b></a> <a href="/c/ropa/">Ropa</a> <a href="/c/recargas/">Recargas</a> <a href="/c/streaming/">Streaming</a> <a href="/c/rosas/">Rosas</a> <a href="/c/estudiantil/">Estudiantil</a></nav>`;
const wa = (m) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(m)}`;
const migas = (items) => `<nav class="crumbs seo-crumbs" aria-label="Ruta">${items.map(([t, u], i) => (u ? `<a href="${u}">${esc(t)}</a>` : `<span>${esc(t)}</span>`) + (i < items.length - 1 ? ' › ' : '')).join('')}</nav>`;
const listaLd = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([t, u], i) => ({ '@type': 'ListItem', position: i + 1, name: t, ...(u ? { item: abs(u) } : {}) })),
});
const tarjetaSeo = (p) => `<li><a href="${urlProducto(p)}">${p.imagenes[0] ? `<img src="${esc(raiz(p.imagenes[0]))}" alt="${esc(p.nombre)}" loading="lazy" decoding="async">` : ''}<span>${esc(p.nombre)}</span><b>${p.opciones.length > 1 ? 'desde ' : ''}${money(desde(p))}</b></a></li>`;

// ── Limpia lo generado antes ────────────────────────────────────────
for (const d of ['p', 'c']) if (existsSync(join(RAIZ, d))) rmSync(join(RAIZ, d), { recursive: true });

const urls = [{ loc: DOM + '/', prio: '1.0', cambio: 'weekly' }];

// ── Productos ───────────────────────────────────────────────────────
for (const p of productos) {
  const cat = CATS[p.cat];
  const sub = subNombre(p.cat, p.sub);
  const url = urlProducto(p);
  const canon = abs(url);
  const precio = desde(p);
  const envio = cat.envio === 'fisico'
    ? `Envío ${money(CONFIG.envio.costo)}; gratis desde ${money(CONFIG.envio.gratisDesde)} de compra en ropa.`
    : cat.envio === 'acordar' ? 'El envío de rosas se acuerda por WhatsApp.' : 'Producto digital: se entrega por WhatsApp, sin envío.';
  const desc = recorta(`${fin(p.nombre)}${p.descripcion ? ' ' + fin(p.descripcion) : ''} ${p.opciones.length > 1 ? 'Desde ' : ''}${money(precio)} en ${NOMBRE}, Tabacundo (Ecuador). Pide por WhatsApp.`, 158);
  const migaItems = [['Inicio', '/'], [cat.nombre, urlCategoria(p.cat)], ...(sub ? [[sub, urlCategoria(p.cat, p.sub)]] : []), [p.nombre, null]];
  const rel = porCat(p.cat, p.cat === 'ropa' ? p.sub : null).filter((x) => x.id !== p.id).slice(0, 8);
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.nombre, description: p.descripcion || p.nombre, sku: p.id,
    image: p.imagenes.map(abs), brand: { '@type': 'Brand', name: NOMBRE },
    offers: {
      '@type': 'Offer', priceCurrency: 'USD', price: precio.toFixed(2), url: canon,
      availability: p.agotado ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: NOMBRE },
    },
  };
  const cuerpo = `<div class="container seo-page">${barra}${migas(migaItems)}
<article class="seo-prod">
${p.imagenes[0] ? `<img class="seo-img" src="${esc(raiz(p.imagenes[0]))}" alt="${esc(p.nombre)}" fetchpriority="high" decoding="async">` : ''}
<div><p class="seo-eyebrow">${esc(sub || cat.nombre)}</p><h1>${esc(p.nombre)}</h1>
<p class="seo-price">${p.opciones.length > 1 ? '<small>desde</small> ' : ''}${money(precio)}${enOferta(p) && p.opciones.length < 2 ? ` <s>${money(p.precio_antes)}</s>` : ''}${p.cat === 'rosas' ? ' <small>por bonche</small>' : ''}</p>
${p.descripcion ? `<p>${esc(p.descripcion)}</p>` : ''}
${p.agotado ? '<p><b>Agotado por ahora.</b> Escríbenos y te avisamos cuando haya.</p>' : ''}
<p class="seo-note">${esc(envio)}</p>
<p class="seo-cta"><a class="btn btn-primary btn-lg" href="/#/p/${encodeURIComponent(p.id)}">Elegir y agregar al carrito</a> <a class="btn btn-wa btn-lg" href="${wa('Hola, tengo una consulta sobre: ' + p.nombre)}" rel="noopener">Consultar por WhatsApp</a></p>
</div></article>
${rel.length ? `<section><h2>Más en ${esc(sub || cat.nombre)}</h2><ul class="seo-grid">${rel.map(tarjetaSeo).join('')}</ul></section>` : ''}
</div>`;
  escribe(`${url.slice(1)}index.html`, pagina({
    titulo: `${p.nombre} · ${NOMBRE}`, desc, canonica: canon, ogImg: p.imagenes[0] ? abs(p.imagenes[0]) : abs('img/og.jpg'),
    ogTipo: 'product', jsonld: [ld, listaLd(migaItems)], ruta: `#/p/${p.id}`, cuerpo,
    extraMeta: `<meta property="product:price:amount" content="${precio.toFixed(2)}">\n<meta property="product:price:currency" content="USD">\n`,
  }));
  urls.push({ loc: canon, prio: '0.6', cambio: 'weekly' });
}

// ── Categorías y subcategorías ──────────────────────────────────────
const TEXTO = {
  ropa: 'Ropa, calzado y accesorios para hombre, mujer y niños. Retira en nuestro local de Tabacundo o te lo enviamos a todo el Ecuador.',
  recargas: 'Recargas de Claro, Movistar, Tigo y CNT, y servicio Ecuabet para mayores de 18 años. Se entregan por WhatsApp.',
  digital: 'Cuentas de streaming, inteligencia artificial y programas. Te los entregamos por WhatsApp después de confirmar tu pago.',
  rosas: 'Rosas por bonche con envío a Ecuador, Perú y Colombia. Escríbenos y te enviamos las variedades disponibles y su precio.',
  clases: 'Acompañamiento estudiantil para EGB, a cargo de una Licenciada en Ciencias de la Educación Básica. Consulta horarios y cupos por WhatsApp.',
};
function paginaCategoria(k, sub) {
  const cat = CATS[k];
  const lista = porCat(k, sub);
  const subT = sub ? subNombre(k, sub) : '';
  const url = urlCategoria(k, sub);
  const canon = abs(url);
  const nombre = subT ? `${cat.nombre}: ${subT}` : cat.nombre;
  const migaItems = [['Inicio', '/'], ...(sub ? [[cat.nombre, urlCategoria(k)], [subT, null]] : [[cat.nombre, null]])];
  const subs = cat.subs.filter(([s]) => porCat(k, s).length > 0);
  const desc = recorta(`${nombre} en ${NOMBRE}, Tabacundo (Ecuador). ${TEXTO[k]}`, 158);
  const ld = lista.length ? {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: nombre, description: desc, url: canon,
    mainEntity: { '@type': 'ItemList', itemListElement: lista.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(urlProducto(p)), name: p.nombre })) },
  } : null;
  const cuerpo = `<div class="container seo-page">${barra}${migas(migaItems)}
<h1>${esc(nombre)}</h1><p class="seo-lead">${esc(TEXTO[k])}</p>
${!sub && subs.length > 1 ? `<p class="seo-subs">${subs.map(([s, n]) => `<a href="${urlCategoria(k, s)}">${esc(n)}</a>`).join(' · ')}</p>` : ''}
${lista.length ? `<ul class="seo-grid">${lista.map(tarjetaSeo).join('')}</ul>` : ''}
<p class="seo-cta"><a class="btn btn-primary btn-lg" href="/#/${cat.slug}${sub ? '/' + sub : ''}">Ver y comprar en la tienda</a> <a class="btn btn-wa btn-lg" href="${wa('Hola, quiero consultar sobre ' + nombre)}" rel="noopener">Consultar por WhatsApp</a></p>
</div>`;
  escribe(`${url.slice(1)}index.html`, pagina({
    titulo: `${nombre} · ${NOMBRE}`, desc, canonica: canon, ogImg: abs('img/og.jpg'),
    jsonld: [...(ld ? [ld] : []), listaLd(migaItems)], ruta: `#/${cat.slug}${sub ? '/' + sub : ''}`, cuerpo,
  }));
  urls.push({ loc: canon, prio: sub ? '0.7' : '0.8', cambio: 'weekly' });
}
for (const k of CAT_ORDER) {
  paginaCategoria(k);
  for (const [s] of CATS[k].subs) if (porCat(k, s).length) paginaCategoria(k, s);
}

// ── Bloque de enlaces en el inicio (se oculta cuando carga el JS) ───
const destacados = productos.filter((p) => !p.agotado).slice(0, 12);
const bloque = `${MARCA_I[0]}
<div class="seo-home container" data-seo="inicio">
${barra}
<h1>${esc(CONFIG.marca.heroTitulo)} ${esc(CONFIG.marca.heroResalte)}</h1>
<p class="seo-lead">${esc(CONFIG.marca.heroBajada)}</p>
<h2>Categorías</h2>
<ul class="seo-grid cats">${CAT_ORDER.map((k) => `<li><a href="${urlCategoria(k)}"><span>${esc(CATS[k].nombre)}</span><b>${esc(CATS[k].bajada)}</b></a></li>`).join('')}</ul>
<h2>Productos destacados</h2>
<ul class="seo-grid">${destacados.map(tarjetaSeo).join('')}</ul>
<p>Escríbenos por <a href="${wa('Hola, quiero hacer una consulta.')}" rel="noopener">WhatsApp</a>. Local en ${esc(CONFIG.local.direccion)}.</p>
</div>
${MARCA_I[1]}`;
let idx = indexSrc;
if (!idx.includes(MARCA_I[0])) idx = idx.replace('<main id="main" tabindex="-1"></main>', `<main id="main" tabindex="-1">${MARCA_I[0]}${MARCA_I[1]}</main>`);
idx = idx.replace(new RegExp(`${MARCA_I[0]}[\\s\\S]*?${MARCA_I[1]}`), () => bloque);
writeFileSync(join(RAIZ, 'index.html'), idx);

// ── sitemap.xml ─────────────────────────────────────────────────────
writeFileSync(join(RAIZ, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${hoy}</lastmod><changefreq>${u.cambio}</changefreq><priority>${u.prio}</priority></url>`).join('\n')}
</urlset>
`);
console.log(`SEO listo: ${productos.length} productos, ${urls.length} direcciones en el sitemap.`);
