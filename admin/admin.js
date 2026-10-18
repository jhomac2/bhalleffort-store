// Panel de administración de BHALLEFFORT.
// Funciona dentro del navegador y publica con la API de GitHub usando TU token
// (guardado solo en este dispositivo). No hay servidor intermedio.
import { CONFIG } from '../js/config.js';
import { CATS, CAT_ORDER, subNombre } from '../js/schema.js';
import { html, raw, esc, money, norm, $, $$ } from '../js/util.js';
import { icon } from '../js/icons.js';
import { aplicarAjustes, AJUSTES_PERMITIDOS } from '../js/ajustes.js';

const REPO = { owner: 'jhomac2', name: 'bhalleffort-store', branch: 'main' };
const KEY = 'bh-admin-token';
const API = 'https://api.github.com';
const app = $('#app');

// ═══════════════════════════════════════════════════════════════════
//  Estado
// ═══════════════════════════════════════════════════════════════════
const S = {
  token: '',
  vista: 'productos',
  productos: [],
  ajustes: null, // lo que hay publicado
  q: '',
  cat: 'todas',
  mostrar: 60,
  prev: new Map(), // ruta -> URL de vista previa (fotos aún no publicadas)
  pend: { upserts: new Map(), deletes: new Set(), imgs: new Map(), borrarImgs: new Set(), sitio: new Map(), ajustes: null },
  publicando: false,
};
const pendCount = () => S.pend.upserts.size + S.pend.deletes.size + S.pend.sitio.size + (S.pend.ajustes ? 1 : 0);

// ═══════════════════════════════════════════════════════════════════
//  GitHub
// ═══════════════════════════════════════════════════════════════════
class GhError extends Error {
  constructor(status, msg) { super(msg); this.status = status; }
}
async function gh(path, { method = 'GET', body } = {}) {
  const r = await fetch(API + path, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + S.token,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (!r.ok) {
    let m = '';
    try { m = (await r.json()).message || ''; } catch { /* nada */ }
    throw new GhError(r.status, m);
  }
  return r.status === 204 ? null : r.json();
}
function explicar(e) {
  if (!(e instanceof GhError)) return 'No pudimos conectar con GitHub. Revisa tu internet e inténtalo otra vez.';
  if (e.status === 401) return 'El token no es válido o ya venció. Crea uno nuevo y pégalo otra vez.';
  if (e.status === 403) return 'El token no tiene permiso para modificar el sitio (debe ser "Contents: Read and write") o llegaste al límite de uso. Espera unos minutos y reintenta.';
  if (e.status === 404) return 'No se encontró el repositorio o el token no tiene acceso a él. Verifica que el token sea solo para bhalleffort-store.';
  if (e.status === 409 || e.status === 422) return 'Alguien cambió el sitio al mismo tiempo. Vuelve a intentarlo.';
  return `GitHub respondió con un error (${e.status}). ${e.message}`;
}
const base = () => `/repos/${REPO.owner}/${REPO.name}`;
const b64ToText = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));
const textToB64 = (t) => {
  const bytes = new TextEncoder().encode(t);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
const blobToB64 = (blob) => new Promise((ok, no) => {
  const r = new FileReader();
  r.onload = () => ok(String(r.result).split(',')[1]);
  r.onerror = no;
  r.readAsDataURL(blob);
});
async function leerTexto(path) {
  const j = await gh(`${base()}/contents/${path}?ref=${REPO.branch}`);
  return b64ToText(j.content || '');
}

// Un solo commit con todo: fotos + productos.json + ajustes. Si algo falla no queda a medias.
async function commit(archivos, mensaje, onProg) {
  const ref = await gh(`${base()}/git/ref/heads/${REPO.branch}`);
  const headSha = ref.object.sha;
  const head = await gh(`${base()}/git/commits/${headSha}`);
  const existentes = new Set((await gh(`${base()}/git/trees/${head.tree.sha}?recursive=1`)).tree.map((t) => t.path));
  const tree = [];
  const subir = archivos.filter((a) => !a.borrar);
  let n = 0;
  for (const a of archivos) {
    if (a.borrar) {
      if (existentes.has(a.path)) tree.push({ path: a.path, mode: '100644', type: 'blob', sha: null });
      continue;
    }
    const b = await gh(`${base()}/git/blobs`, { method: 'POST', body: { content: a.b64, encoding: 'base64' } });
    tree.push({ path: a.path, mode: '100644', type: 'blob', sha: b.sha });
    onProg?.(++n, subir.length);
  }
  const t = await gh(`${base()}/git/trees`, { method: 'POST', body: { base_tree: head.tree.sha, tree } });
  const c = await gh(`${base()}/git/commits`, { method: 'POST', body: { message: mensaje, tree: t.sha, parents: [headSha] } });
  await gh(`${base()}/git/refs/heads/${REPO.branch}`, { method: 'PATCH', body: { sha: c.sha } });
  return c.sha;
}

// ═══════════════════════════════════════════════════════════════════
//  Avisos
// ═══════════════════════════════════════════════════════════════════
function aviso(texto, tipo = 'ok') {
  const cont = $('#toasts');
  const t = document.createElement('div');
  t.className = 'toast';
  t.dataset.s = 'in';
  t.innerHTML = `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${tipo === 'ok' ? 'M20 6 9 17l-5-5' : 'M12 8v5M12 17h.01'}"/></svg><span></span>`;
  t.querySelector('span').textContent = texto;
  if (tipo !== 'ok') t.querySelector('.ic').style.color = '#ff9b86';
  cont.append(t);
  requestAnimationFrame(() => requestAnimationFrame(() => { t.dataset.s = 'on'; }));
  setTimeout(() => { t.dataset.s = 'out'; setTimeout(() => t.remove(), 220); }, tipo === 'ok' ? 3000 : 6000);
}

// ═══════════════════════════════════════════════════════════════════
//  Entrada (token)
// ═══════════════════════════════════════════════════════════════════
function pantallaLogin(error = '') {
  app.innerHTML = html`<div class="a-login"><div class="a-card">
    <div class="a-brand"><span class="brand-mark">B</span>Panel BHALLEFFORT</div>
    <h2>Entrar</h2>
    <p class="a-muted">Desde aquí subes productos, fotos y cambias datos de la tienda. Los cambios se publican en el sitio en 1 o 2 minutos.</p>
    <form id="f-login" class="a-form" autocomplete="off">
      <div class="a-field"><label for="tk">Tu token de GitHub</label>
        <input class="input" id="tk" name="tk" type="password" placeholder="github_pat_…" autocomplete="off" autocapitalize="off" spellcheck="false" required>
        <small>Se guarda solo en este dispositivo y solo se envía a GitHub. Nadie más lo ve.</small></div>
      <label class="a-check"><input type="checkbox" name="rec" checked> Recordarme en este dispositivo</label>
      <div class="a-err" id="e-login" role="alert">${error}</div>
      <button class="btn btn-primary btn-lg" type="submit">Entrar</button>
    </form>
    <details class="a-help"><summary>¿Cómo creo mi token? (se hace una sola vez)</summary>
      <ol class="a-steps" style="margin-top:12px">
        <li>Entra a <b>github.com</b> con tu cuenta y ve a <b>Settings → Developer settings → Personal access tokens → Fine-grained tokens</b>.</li>
        <li>Pulsa <b>Generate new token</b>. Nombre: <b>Panel BHALLEFFORT</b>. Vencimiento: 90 días (cuando venza, creas otro).</li>
        <li>En <b>Repository access</b> elige <b>Only select repositories</b> y marca solo <b>bhalleffort-store</b>.</li>
        <li>En <b>Permissions → Repository permissions</b> pon <b>Contents: Read and write</b>. Nada más.</li>
        <li>Pulsa <b>Generate token</b>, copia el texto que empieza con <b>github_pat_</b> y pégalo arriba.</li>
      </ol>
      <p class="a-muted" style="margin-top:10px">Si pierdes el celular, entra a GitHub y borra el token: queda inutilizable al instante. Activa también la verificación en dos pasos en tu cuenta de GitHub.</p>
    </details>
  </div></div>`.toString();
  $('#f-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const tk = String(fd.get('tk') || '').trim();
    const btn = $('button[type=submit]', e.target);
    btn.disabled = true; btn.textContent = 'Verificando…';
    S.token = tk;
    try {
      const r = await gh(base());
      if (!r.permissions?.push) throw new GhError(403, '');
      try { fd.get('rec') ? localStorage.setItem(KEY, tk) : sessionStorage.setItem(KEY, tk); } catch { /* nada */ }
      await entrar();
    } catch (err) {
      S.token = '';
      pantallaLogin(explicar(err));
    }
  });
}

function leerTokenGuardado() {
  try { return localStorage.getItem(KEY) || sessionStorage.getItem(KEY) || ''; } catch { return ''; }
}
function salir() {
  try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch { /* nada */ }
  S.token = '';
  pantallaLogin();
}

async function entrar() {
  app.innerHTML = '<div class="a-main"><div class="a-card"><p class="a-muted">Cargando tus productos…</p></div></div>';
  try {
    const [txt, aj] = await Promise.all([
      leerTexto('productos.json'),
      leerTexto('ajustes.json').catch(() => '{}'),
    ]);
    S.productos = JSON.parse(txt);
    S.ajustes = JSON.parse(aj || '{}');
    aplicarAjustes(S.ajustes);
  } catch (err) {
    if (err instanceof GhError && err.status === 401) { salir(); return; }
    app.innerHTML = html`<div class="a-login"><div class="a-card"><h2>No pudimos cargar</h2><p class="a-err">${explicar(err)}</p>
      <button class="btn btn-primary" data-a="reintentar">Reintentar</button> <button class="btn btn-ghost" data-a="salir">Salir</button></div></div>`.toString();
    return;
  }
  S.vista = 'productos';
  render();
}

// ═══════════════════════════════════════════════════════════════════
//  Pantallas
// ═══════════════════════════════════════════════════════════════════
const imgSrc = (p) => S.prev.get(p) || '../' + p;

function barra() {
  return html`<header class="a-top"><div class="a-top-in">
    <div class="a-brand"><span class="brand-mark">B</span>Panel</div>
    <nav class="a-tabs" aria-label="Secciones">
      ${[['productos', 'Productos'], ['ajustes', 'Ajustes del sitio'], ['sitio', 'Logo y fotos']].map(([k, n]) => html`<button class="a-tab" data-a="vista" data-v="${k}" aria-current="${S.vista === k}">${n}</button>`)}
    </nav>
    <a class="btn btn-ghost btn-sm" href="../" target="_blank" rel="noopener">Ver tienda</a>
    <button class="btn btn-ghost btn-sm" data-a="salir">Salir</button>
  </div></header>`;
}

function flagsDe(p) {
  const f = [];
  if (p.visible === false) f.push(html`<span class="a-flag off">Oculto</span>`);
  if (p.agotado) f.push(html`<span class="a-flag warn">Agotado</span>`);
  if (p.oferta) f.push(html`<span class="a-flag">Oferta</span>`);
  if (p.nuevo) f.push(html`<span class="a-flag">Nuevo</span>`);
  if (S.pend.upserts.has(p.id)) f.push(html`<span class="a-flag warn">Sin publicar</span>`);
  return f;
}

function listaProductos() {
  const q = norm(S.q);
  let l = S.productos.filter((p) => (S.cat === 'todas' || p.cat === S.cat) && (!q || norm([p.nombre, p.id, p.descripcion].join(' ')).includes(q)));
  const total = l.length;
  l = l.slice(0, S.mostrar);
  return html`<p class="a-muted" aria-live="polite">${total} ${total === 1 ? 'producto' : 'productos'}</p>
    <div class="a-list">${l.map((p) => html`<article class="a-row" data-oculto="${p.visible === false}" data-color="${CATS[p.cat]?.color || 'blue'}">
        <div class="a-th" ${p.color && !p.imagenes?.[0] ? raw(`style="background:${esc(p.color)}"`) : ''}>${p.imagenes?.[0] ? html`<img src="${imgSrc(p.imagenes[0])}" alt="" loading="lazy" width="56" height="56">` : p.nombre.slice(0, 1)}</div>
        <div><b>${p.nombre}</b><small>${CATS[p.cat]?.nombre}${p.sub ? ' · ' + subNombre(p.cat, p.sub) : ''} · ${p.opciones?.length > 1 ? 'desde ' : ''}${money(p.opciones?.length ? Math.min(...p.opciones.map((o) => o.precio)) : p.precio)}</small>
          <div class="a-flags">${flagsDe(p)}</div></div>
        <div class="a-acts"><button class="btn btn-ghost" data-a="editar" data-id="${p.id}">Editar</button>
          <button class="btn btn-ghost" data-a="ocultar" data-id="${p.id}" aria-label="${p.visible === false ? 'Mostrar' : 'Ocultar'} ${p.nombre}">${p.visible === false ? 'Mostrar' : 'Ocultar'}</button></div>
      </article>`)}</div>
    ${total > S.mostrar ? html`<div class="more-wrap"><button class="btn btn-ghost" data-a="mas">Ver más (${total - S.mostrar})</button></div>` : ''}`;
}

function vistaProductos() {
  return html`<div class="a-card">
    <div class="a-bar"><h2 style="margin-right:auto">Productos</h2><button class="btn btn-primary" data-a="nuevo">${raw(icon('plus'))} Nuevo producto</button></div>
    <div class="a-bar">
      <input class="input" id="a-q" type="search" placeholder="Buscar por nombre" value="${S.q}" aria-label="Buscar producto">
      <select class="input" id="a-cat" aria-label="Categoría"><option value="todas">Todas las categorías</option>${CAT_ORDER.map((k) => html`<option value="${k}" ${S.cat === k ? raw('selected') : ''}>${CATS[k].nombre}</option>`)}</select>
    </div>
    <div id="a-lista">${listaProductos()}</div></div>`;
}

const hoyES = () => new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric', timeZone: CONFIG.zonaHoraria });

function vistaAjustes() {
  const s = CONFIG.sorteo, l = CONFIG.local, g = CONFIG.legal;
  return html`<form class="a-card" id="f-ajustes" autocomplete="off" novalidate>
    <h2>Ajustes del sitio</h2>
    <p class="a-muted">Los cambios aparecen en la tienda después de pulsar <b>Publicar</b>.</p>
    <h3>Sorteo mensual</h3>
    <label class="a-check"><input type="checkbox" name="sorteo.activo" ${s.activo ? raw('checked') : ''}> Sorteo activo (si lo apagas, desaparece de todo el sitio)</label>
    <div class="a-grid two">
      <div class="a-field"><label for="s-premio">Premio de este mes</label><input class="input" id="s-premio" name="sorteo.premioDelMes" value="${s.premioDelMes}" placeholder="Ej.: Audífonos inalámbricos"></div>
      <div class="a-field"><label for="s-fecha">Fecha del sorteo</label><input class="input" id="s-fecha" name="sorteo.fechaDelSorteo" value="${s.fechaDelSorteo}" placeholder="Ej.: 30 de octubre"></div>
    </div>
    <div class="a-field"><span class="lbl">Ganadores anteriores</span>
      <div class="a-rep" id="hist">${(s.historial || []).map((h, i) => filaHist(h, i))}</div>
      <button type="button" class="btn btn-ghost btn-sm" data-a="hist-add" style="justify-self:start">${raw(icon('plus'))} Agregar ganador</button></div>
    <h3>Local</h3>
    <div class="a-grid two">
      <div class="a-field"><label for="l-dir">Dirección</label><input class="input" id="l-dir" name="local.direccion" value="${l.direccion}"></div>
      <div class="a-field"><label for="l-ref">Referencia (opcional)</label><input class="input" id="l-ref" name="local.referencia" value="${l.referencia}" placeholder="Frente a…, junto a…"></div>
    </div>
    <h3>Datos legales</h3>
    <p class="a-muted">Aparecen en el Aviso Legal, Términos, Privacidad y Sorteo. Mientras estén vacíos, la tienda los muestra resaltados como PENDIENTE.</p>
    <div class="a-grid two">
      <div class="a-field"><label for="g-tit">Nombre legal del titular</label><input class="input" id="g-tit" name="legal.titular" value="${g.titular}" placeholder="Nombres y apellidos completos"></div>
      <div class="a-field"><label for="g-ruc">RUC</label><input class="input" id="g-ruc" name="legal.ruc" value="${g.ruc}" inputmode="numeric" placeholder="13 dígitos"></div>
      <div class="a-field"><label for="g-ciu">Ciudad (para reclamos)</label><input class="input" id="g-ciu" name="legal.ciudad" value="${g.ciudad}"></div>
      <div class="a-field"><label for="g-dir">Dirección legal (si es distinta al local)</label><input class="input" id="g-dir" name="legal.direccion" value="${g.direccion}"></div>
    </div>
    <div class="a-err" id="e-aj" role="alert"></div>
    <div><button class="btn btn-primary btn-lg" type="submit">Guardar ajustes</button></div>
  </form>`;
}
function filaHist(h = {}, i = 0) {
  return html`<div class="a-rep-row" data-h="${i}" style="grid-template-columns:minmax(0,1fr) 90px minmax(0,1fr) auto">
    <input class="input" data-hf="mes" value="${h.mes || ''}" placeholder="Mes (Octubre 2026)" aria-label="Mes">
    <input class="input" data-hf="numero" value="${h.numero ?? ''}" inputmode="numeric" placeholder="Nº" aria-label="Número ganador">
    <input class="input" data-hf="premio" value="${h.premio || ''}" placeholder="Premio" aria-label="Premio">
    <button type="button" class="icon-btn" data-a="hist-del" aria-label="Quitar">${raw(icon('trash-2'))}</button></div>`;
}

function slotSitio(k, titulo, ayuda, ar, ruta) {
  const nuevo = S.pend.sitio.has(ruta);
  return html`<div class="a-card"><h3>${titulo}</h3><p class="a-muted">${ayuda}</p>
    <div class="box" style="--ar:${ar}"><span>Aún no hay imagen</span><img src="${S.prev.get(ruta) || '../' + ruta + '?t=' + Date.now()}" alt="" data-hide-err></div>
    ${nuevo ? html`<div class="a-warn">Listo para publicar. Pulsa <b>Publicar</b> abajo.</div>` : ''}
    <button class="btn btn-primary" data-a="sitio" data-k="${k}">${raw(icon('plus'))} Subir o reemplazar</button></div>`;
}
function vistaSitio() {
  return html`<div class="a-main" style="padding:0">
    <div class="a-card"><h2>Logo y fotos del sitio</h2><p class="a-muted">Elige la imagen, ajusta el encuadre con el dedo y el panel la convierte al tamaño correcto.</p></div>
    <div class="a-site">
      ${slotSitio('logo', 'Logo', 'Cuadrado, de preferencia con fondo transparente. Se usa en la cabecera, la moneda 3D y el ícono.', '1 / 1', 'img/logo.webp')}
      ${slotSitio('local', 'Foto del local', 'Foto horizontal de la fachada. Se muestra en “Nuestro local”.', '16 / 10', 'img/local.webp')}
      ${slotSitio('og', 'Imagen para compartir', 'Aparece cuando compartes el enlace por WhatsApp o redes (1200 × 630).', '1200 / 630', 'img/og.jpg')}
    </div></div>`;
}

function render() {
  const cuerpo = S.vista === 'productos' ? vistaProductos() : S.vista === 'ajustes' ? vistaAjustes() : vistaSitio();
  app.innerHTML = html`${barra()}<main class="a-main">${cuerpo}</main>
    <div class="a-pub" id="a-pub" ${pendCount() ? '' : raw('hidden')}><span id="a-pub-n">${pendCount()} ${pendCount() === 1 ? 'cambio' : 'cambios'} sin publicar</span>
      <button class="btn btn-ghost btn-sm" style="color:#fff" data-a="descartar">Descartar</button>
      <button class="btn btn-gold" data-a="publicar">Publicar</button></div>`.toString();
  $$('[data-hide-err]').forEach((im) => im.addEventListener('error', () => im.remove()));
}
function refrescarBarra() {
  const b = $('#a-pub');
  if (!b) return;
  b.hidden = !pendCount();
  $('#a-pub-n').textContent = `${pendCount()} ${pendCount() === 1 ? 'cambio' : 'cambios'} sin publicar`;
}

// ═══════════════════════════════════════════════════════════════════
//  Formulario de producto
// ═══════════════════════════════════════════════════════════════════
const TALLAS_LETRAS = ['S', 'M', 'L', 'XL', 'XXL', 'Única'];
const TALLAS_NUM = Array.from({ length: 24 }, (_, i) => String(22 + i));
const GRUPOS = ['Calzado', 'Mochilas', 'Conjuntos', 'Otros'];
const PARA = ['', 'Hombre', 'Mujer', 'Niños', 'Unisex'];
const CAMPOS = {
  '': null,
  telefono: { id: 'telefono', etiqueta: 'Número a recargar', tipo: 'tel', patron: '^09[0-9]{8}$', ayuda: 'Ejemplo: 0991234567', requerido: true },
  idjuego: { id: 'idjuego', etiqueta: 'ID del jugador', tipo: 'text', patron: '^[0-9]{6,14}$', ayuda: 'Solo números', requerido: true },
  usuario: { id: 'usuario', etiqueta: 'Usuario o correo de tu cuenta', tipo: 'text', requerido: true },
  correo: { id: 'correo', etiqueta: 'Correo para entregar tu cuenta', tipo: 'text', patron: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', ayuda: 'Ejemplo: nombre@gmail.com', requerido: true },
};
const campoClave = (p) => {
  const c = p.campos?.[0];
  if (!c) return '';
  return Object.keys(CAMPOS).find((k) => k && CAMPOS[k].id === c.id) || '';
};

let D = null; // borrador abierto
const slug = (t) => norm(t).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'producto';
function idUnico(nombre) {
  const b = slug(nombre);
  let id = b, n = 2;
  const usados = new Set(S.productos.map((p) => p.id));
  while (usados.has(id)) id = `${b}-${n++}`;
  return id;
}

function nuevoBorrador(p) {
  const orig = p || null;
  const c = JSON.parse(JSON.stringify(p || {
    cat: 'ropa', sub: 'hombre', nombre: '', descripcion: '', precio: 0, precio_antes: null, oferta: false, promo_hasta: null,
    estado: 'nuevo', nuevo: false, agotado: false, visible: true, imagenes: [], tallas: [],
  }));
  c.imagenes ||= []; c.tallas ||= []; c.opciones ||= []; c.campos ||= [];
  return { orig, p: c, nuevas: [null, null], quitar: [false, false], base: JSON.stringify(c) };
}

function formProducto() {
  const p = D.p, cat = CATS[p.cat];
  const ar = cat.media.replace(' ', '');
  const esVarios = p.cat === 'ropa' && p.sub === 'varios';
  const chips = (lista, sel) => lista.map((t) => html`<label class="a-chip"><input type="checkbox" data-talla="${t}" ${sel.includes(t) ? raw('checked') : ''}><span>${t}</span></label>`);
  const foto = (i) => {
    const src = D.nuevas[i]?.url || (!D.quitar[i] && p.imagenes[i] ? imgSrc(p.imagenes[i]) : '');
    return html`<div class="a-photo"><div class="box" style="--ar:${ar}">${src ? html`<img src="${src}" alt="">` : html`<span>${i === 0 ? 'Foto principal' : 'Foto de atrás (opcional)'}</span>`}</div>
      <div class="acts"><button type="button" class="btn btn-ghost" data-a="foto" data-i="${i}">${src ? 'Cambiar' : 'Elegir foto'}</button>
        ${src ? html`<button type="button" class="btn btn-ghost" data-a="foto-quitar" data-i="${i}">Quitar</button>` : ''}</div></div>`;
  };
  return html`<form id="f-prod" class="a-form" novalidate autocomplete="off">
    <div class="a-grid two">
      <div class="a-field"><label for="p-cat">Categoría</label>
        <select class="input" id="p-cat" data-f="cat">${CAT_ORDER.map((k) => html`<option value="${k}" ${p.cat === k ? raw('selected') : ''}>${CATS[k].nombre}</option>`)}</select></div>
      ${cat.subs.length ? html`<div class="a-field"><label for="p-sub">Subcategoría</label>
        <select class="input" id="p-sub" data-f="sub">${cat.subs.map(([k, n]) => html`<option value="${k}" ${p.sub === k ? raw('selected') : ''}>${n}</option>`)}</select></div>` : ''}
    </div>
    <div class="a-field"><label for="p-nombre">Nombre</label><input class="input" id="p-nombre" data-f="nombre" value="${p.nombre}" maxlength="80" placeholder="Ej.: Buzo Columbia negro">
      <span class="a-err" data-e="nombre"></span></div>
    <div class="a-field"><label for="p-desc">Descripción (opcional)</label><textarea class="input" id="p-desc" data-f="descripcion" rows="3" maxlength="400" placeholder="Material, detalles, qué incluye…">${p.descripcion || ''}</textarea></div>

    ${p.cat === 'recargas' || (p.cat === 'digital' && p.opciones.length) ? '' : html`
    <div class="a-grid two">
      <div class="a-field"><label for="p-precio">${p.cat === 'rosas' ? 'Precio por bonche (USD)' : 'Precio (USD)'}</label>
        <input class="input" id="p-precio" data-f="precio" type="number" inputmode="decimal" step="0.01" min="0" value="${p.precio || ''}" placeholder="0.00"><span class="a-err" data-e="precio"></span></div>
    </div>`}

    ${p.cat === 'ropa' ? html`
      ${esVarios ? html`<div class="a-grid two">
        <div class="a-field"><label for="p-grupo">Tipo</label><input class="input" id="p-grupo" data-f="grupo" list="dl-grupos" value="${p.grupo || ''}" placeholder="Calzado, Mochilas…"><datalist id="dl-grupos">${GRUPOS.map((g) => html`<option value="${g}">`)}</datalist></div>
        <div class="a-field"><label for="p-para">Para</label><select class="input" id="p-para" data-f="para">${PARA.map((x) => html`<option value="${x}" ${(p.para || '') === x ? raw('selected') : ''}>${x || 'Sin especificar'}</option>`)}</select></div>
      </div>` : ''}
      <div class="a-field"><span class="lbl">Tallas disponibles</span>
        <div class="a-chips" role="group" aria-label="Tallas en letras">${chips(TALLAS_LETRAS, p.tallas)}</div>
        <div class="a-chips" role="group" aria-label="Tallas numéricas (calzado)">${chips(TALLAS_NUM, p.tallas)}</div>
        <small>Marca solo las que hay en stock. Para calzado usa los números.</small></div>` : ''}

    ${p.cat === 'recargas' ? html`
      <div class="a-grid two">
        <div class="a-field"><label for="p-op">Operador o juego</label><input class="input" id="p-op" data-f="operador" value="${p.operador || ''}" placeholder="Claro, Free Fire…"></div>
        <div class="a-field"><label for="p-color">Color de la tarjeta</label><input class="input" id="p-color" data-f="color" type="color" value="${p.color || '#1e6fb8'}" style="padding:4px"></div>
      </div>
      <label class="a-check"><input type="checkbox" data-f="edad18" ${p.edad >= 18 ? raw('checked') : ''}> Solo mayores de 18 años (Ecuabet)</label>` : ''}

    ${p.cat === 'recargas' || p.cat === 'digital' ? html`
      <div class="a-field"><span class="lbl">${p.cat === 'recargas' ? 'Montos' : 'Opciones y precios (ej.: Personal, Pantalla)'}</span>
        <div class="a-rep" id="ops">${p.opciones.map((o, i) => filaOp(o, i))}</div>
        <div class="a-bar"><button type="button" class="btn btn-ghost btn-sm" data-a="op-add">${raw(icon('plus'))} Agregar opción</button>
          ${p.cat === 'recargas' ? html`<button type="button" class="btn btn-ghost btn-sm" data-a="op-rapido">Montos rápidos $1 $2 $3 $5 $10 $20</button>` : ''}</div>
        <span class="a-err" data-e="opciones"></span></div>
      <div class="a-field"><label for="p-campo">Dato que pedimos al cliente</label>
        <select class="input" id="p-campo" data-f="campo">
          <option value="" ${campoClave(p) === '' ? raw('selected') : ''}>Ninguno</option>
          <option value="telefono" ${campoClave(p) === 'telefono' ? raw('selected') : ''}>Número de celular</option>
          <option value="idjuego" ${campoClave(p) === 'idjuego' ? raw('selected') : ''}>ID de jugador</option>
          <option value="usuario" ${campoClave(p) === 'usuario' ? raw('selected') : ''}>Usuario o correo de cuenta</option>
          <option value="correo" ${campoClave(p) === 'correo' ? raw('selected') : ''}>Correo para entregar la cuenta</option>
        </select></div>` : ''}

    <div class="a-field"><span class="lbl">Fotos</span>
      <div class="a-photos">${foto(0)}${foto(1)}</div>
      <small>${p.cat === 'ropa' || p.cat === 'rosas' ? 'Vertical (3:4).' : 'Horizontal (16:9).'} El panel recorta y comprime la foto automáticamente.</small></div>

    <div class="a-grid two">
      <label class="a-check"><input type="checkbox" data-f="oferta" ${p.oferta ? raw('checked') : ''}> En promoción (aparece en Promociones)</label>
      <label class="a-check"><input type="checkbox" data-f="nuevo" ${p.nuevo ? raw('checked') : ''}> Marcar como nuevo</label>
    </div>
    ${p.oferta ? html`<div class="a-grid two">
      <div class="a-field"><label for="p-antes">Precio anterior (tachado)</label><input class="input" id="p-antes" data-f="precio_antes" type="number" inputmode="decimal" step="0.01" min="0" value="${p.precio_antes || ''}"><span class="a-err" data-e="precio_antes"></span></div>
      <div class="a-field"><label for="p-hasta">Promoción hasta (opcional)</label><input class="input" id="p-hasta" data-f="promo_hasta" type="date" value="${p.promo_hasta || ''}"></div>
    </div>` : ''}
    <div class="a-grid two">
      <label class="a-check"><input type="checkbox" data-f="agotado" ${p.agotado ? raw('checked') : ''}> Agotado</label>
      <label class="a-check"><input type="checkbox" data-f="visible" ${p.visible !== false ? raw('checked') : ''}> Visible en la tienda</label>
    </div>
  </form>`;
}
function filaOp(o, i) {
  return html`<div class="a-rep-row" data-o="${i}">
    <input class="input" data-of="nombre" value="${o.nombre}" placeholder="Nombre (ej.: $10 o Personal)" aria-label="Nombre de la opción">
    <input class="input" data-of="precio" type="number" inputmode="decimal" step="0.01" min="0" value="${o.precio ?? ''}" placeholder="Precio" aria-label="Precio">
    <button type="button" class="icon-btn" data-a="op-del" aria-label="Quitar opción">${raw(icon('trash-2'))}</button></div>`;
}

function abrirProducto(p) {
  D = nuevoBorrador(p);
  pintarDialogo();
  $('#pdlg').showModal();
}
function pintarDialogo() {
  let d = $('#pdlg');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'pdlg'; d.className = 'a-dlg'; d.setAttribute('aria-label', 'Producto');
    document.body.append(d);
    d.addEventListener('click', onDialogClick);
    d.addEventListener('input', onDialogInput);
    d.addEventListener('change', onDialogInput);
    d.addEventListener('close', () => document.documentElement.classList.remove('lock'));
  }
  const scroll = $('.a-dlg-body', d)?.scrollTop || 0;
  d.innerHTML = html`<div class="a-dlg-head"><h2>${D.orig ? 'Editar producto' : 'Nuevo producto'}</h2>
      <button class="icon-btn" data-a="cerrar-dlg" aria-label="Cerrar">${raw(icon('x'))}</button></div>
    <div class="a-dlg-body">${formProducto()}</div>
    <div class="a-dlg-foot">
      ${D.orig ? html`<button class="btn btn-ghost del" data-a="eliminar">Eliminar</button>` : ''}
      <button class="btn btn-ghost" data-a="cerrar-dlg">Cancelar</button>
      <button class="btn btn-primary" data-a="guardar">Guardar</button></div>`.toString();
  $('.a-dlg-body', d).scrollTop = scroll;
}

function onDialogInput(e) {
  const t = e.target;
  const p = D.p;
  if (t.dataset.talla !== undefined) {
    const v = t.dataset.talla;
    p.tallas = t.checked ? [...new Set([...p.tallas, v])] : p.tallas.filter((x) => x !== v);
    const orden = [...TALLAS_LETRAS, ...TALLAS_NUM];
    p.tallas.sort((a, b) => orden.indexOf(a) - orden.indexOf(b));
    return;
  }
  if (t.dataset.of) {
    const i = Number(t.closest('[data-o]').dataset.o);
    const o = p.opciones[i];
    o[t.dataset.of] = t.dataset.of === 'precio' ? (t.value === '' ? '' : Number(t.value)) : t.value;
    return;
  }
  const f = t.dataset.f;
  if (!f) return;
  const v = t.type === 'checkbox' ? t.checked : t.value;
  if (f === 'cat') {
    p.cat = v;
    p.sub = CATS[v].subs[0]?.[0] || '';
    if (v !== 'ropa') p.tallas = [];
    if (!['recargas', 'digital'].includes(v)) { p.opciones = []; p.campos = []; }
    pintarDialogo(); return;
  }
  if (f === 'sub') { p.sub = v; pintarDialogo(); return; }
  if (f === 'oferta') { p.oferta = v; pintarDialogo(); return; }
  if (f === 'edad18') { if (v) p.edad = 18; else delete p.edad; return; }
  if (f === 'campo') { p.campos = CAMPOS[v] ? [{ ...CAMPOS[v] }] : []; return; }
  if (f === 'precio' || f === 'precio_antes') { p[f] = v === '' ? null : Number(v); return; }
  if (f === 'promo_hasta') { p[f] = v || null; return; }
  p[f] = v;
}

async function onDialogClick(e) {
  const b = e.target.closest('[data-a]');
  if (!b) return;
  const a = b.dataset.a;
  const p = D.p;
  if (a === 'cerrar-dlg') cerrarDlg();
  else if (a === 'op-add') { p.opciones.push({ nombre: '', precio: '' }); pintarDialogo(); }
  else if (a === 'op-rapido') {
    for (const n of [1, 2, 3, 5, 10, 20]) if (!p.opciones.some((o) => o.nombre === `$${n}`)) p.opciones.push({ nombre: `$${n}`, precio: n });
    pintarDialogo();
  } else if (a === 'op-del') { p.opciones.splice(Number(b.closest('[data-o]').dataset.o), 1); pintarDialogo(); }
  else if (a === 'foto') {
    const i = Number(b.dataset.i);
    const archivo = await elegirArchivo();
    if (!archivo) return;
    const [aw, ah] = CATS[p.cat].media.split('/').map((x) => Number(x));
    const portrait = ah > aw;
    const r = await abrirEditor({ archivo, aspecto: [aw, ah], salida: portrait ? [1200, 1600] : [1280, Math.round(1280 * ah / aw)], maxBytes: 220 * 1024 });
    if (r) { D.nuevas[i] = r; D.quitar[i] = false; pintarDialogo(); }
  } else if (a === 'foto-quitar') {
    const i = Number(b.dataset.i);
    D.nuevas[i] = null; D.quitar[i] = true; pintarDialogo();
  } else if (a === 'guardar') guardar();
  else if (a === 'eliminar') {
    if (!confirm(`¿Eliminar “${D.orig.nombre}” de la tienda? Si solo quieres que no se vea, usa “Ocultar”.`)) return;
    eliminar(D.orig.id);
    cerrarDlg(true);
  }
}
function cerrarDlg(silencio) {
  const d = $('#pdlg');
  const hayCambios = D && (D.nuevas.some(Boolean) || D.quitar.some(Boolean) || JSON.stringify(D.p) !== D.base);
  if (!silencio && hayCambios && !confirm('Tienes cambios sin guardar. ¿Cerrar de todos modos?')) return;
  d.close();
  D = null;
}

function elegirArchivo(accept = 'image/*') {
  return new Promise((ok) => {
    const i = document.createElement('input');
    i.type = 'file'; i.accept = accept;
    i.addEventListener('change', () => ok(i.files?.[0] || null), { once: true });
    i.addEventListener('cancel', () => ok(null), { once: true });
    i.click();
  });
}

function validar(p) {
  const e = {};
  if (!p.nombre || p.nombre.trim().length < 2) e.nombre = 'Escribe el nombre del producto.';
  const ops = p.opciones || [];
  const usaOps = p.cat === 'recargas' || (p.cat === 'digital' && ops.length);
  if (p.cat === 'recargas' && !ops.length) e.opciones = 'Agrega al menos un monto.';
  if (ops.some((o) => !String(o.nombre).trim() || !(Number(o.precio) >= 0) || o.precio === '')) e.opciones = 'Cada opción necesita nombre y precio.';
  if (!usaOps && !(Number(p.precio) > 0)) e.precio = 'Escribe un precio mayor a 0.';
  if (p.oferta && !(Number(p.precio_antes) > Number(p.precio))) e.precio_antes = 'El precio anterior debe ser mayor que el precio actual.';
  return e;
}

function limpiar(p, id) {
  const o = { ...p, id };
  o.nombre = o.nombre.trim();
  o.descripcion = (o.descripcion || '').trim();
  o.visible = o.visible !== false;
  o.nuevo = !!o.nuevo; o.agotado = !!o.agotado; o.oferta = !!o.oferta;
  o.estado ||= 'nuevo';
  if (!o.oferta) { o.precio_antes = null; o.promo_hasta = null; }
  else o.promo_hasta = o.promo_hasta || null;
  const ops = (o.opciones || []).map((x) => ({ nombre: String(x.nombre).trim(), precio: Number(x.precio) }));
  if (o.cat === 'recargas' || (o.cat === 'digital' && ops.length)) {
    o.opciones = ops;
    o.precio = Math.min(...ops.map((x) => x.precio));
  } else delete o.opciones;
  if (!(['recargas', 'digital'].includes(o.cat)) || !o.campos?.length) delete o.campos;
  if (o.cat !== 'ropa') delete o.tallas;
  else o.tallas = o.tallas || [];
  if (!(o.cat === 'ropa' && o.sub === 'varios')) { delete o.grupo; delete o.para; }
  else { if (!o.grupo) delete o.grupo; if (!o.para) delete o.para; }
  if (o.cat !== 'recargas') { delete o.operador; delete o.color; delete o.edad; }
  else { if (!o.operador) delete o.operador; }
  if (!o.sub) o.sub = '';
  o.precio = Math.round(Number(o.precio) * 100) / 100;
  if (o.precio_antes != null) o.precio_antes = Math.round(Number(o.precio_antes) * 100) / 100;
  return o;
}

function guardar() {
  const p = D.p;
  const err = validar(p);
  $$('[data-e]').forEach((x) => (x.textContent = err[x.dataset.e] || ''));
  if (Object.keys(err).length) {
    const primero = $(`[data-e="${Object.keys(err)[0]}"]`);
    primero?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return;
  }
  const id = D.orig?.id || idUnico(p.nombre);
  const o = limpiar(p, id);
  // Fotos: las nuevas llevan un nombre con sello para evitar que el navegador muestre la anterior
  const sello = Date.now().toString(36);
  const orig = D.orig?.imagenes || [];
  const fin = [];
  for (let i = 0; i < 2; i++) {
    if (D.nuevas[i]) {
      const ext = D.nuevas[i].blob.type === 'image/webp' ? 'webp' : 'jpg';
      const ruta = `img/productos/${id}-${sello}${i ? '-espalda' : ''}.${ext}`;
      S.pend.imgs.set(ruta, D.nuevas[i].blob);
      S.prev.set(ruta, D.nuevas[i].url);
      fin[i] = ruta;
      if (orig[i]) S.pend.borrarImgs.add(orig[i]);
    } else if (D.quitar[i]) {
      if (orig[i]) S.pend.borrarImgs.add(orig[i]);
    } else if (orig[i]) {
      fin[i] = orig[i];
    }
  }
  o.imagenes = fin.filter(Boolean);
  const k = S.productos.findIndex((x) => x.id === id);
  if (k >= 0) S.productos[k] = o; else S.productos.unshift(o);
  S.pend.deletes.delete(id);
  S.pend.upserts.set(id, o);
  cerrarDlg(true);
  aviso('Guardado. Pulsa Publicar para subirlo a la tienda.');
  render();
}

function eliminar(id) {
  const p = S.productos.find((x) => x.id === id);
  S.productos = S.productos.filter((x) => x.id !== id);
  S.pend.upserts.delete(id);
  S.pend.deletes.add(id);
  (p?.imagenes || []).forEach((r) => S.pend.borrarImgs.add(r));
  render();
}

// ═══════════════════════════════════════════════════════════════════
//  Editor de fotos (recorte, zoom, giro y compresión a WebP)
// ═══════════════════════════════════════════════════════════════════
async function cargarBitmap(archivo) {
  try { return await createImageBitmap(archivo, { imageOrientation: 'from-image' }); } catch { /* sigue */ }
  const url = URL.createObjectURL(archivo);
  try {
    const im = new Image();
    im.src = url;
    await im.decode();
    return im;
  } finally { setTimeout(() => URL.revokeObjectURL(url), 5000); }
}

/**
 * @param {{archivo: File, aspecto: [number, number], salida: [number, number], maxBytes: number, transparente?: boolean, mime?: string}} o
 * @returns {Promise<null | {blob: Blob, url: string}>}
 */
async function abrirEditor(o) {
  let bmp;
  try { bmp = await cargarBitmap(o.archivo); } catch { aviso('No pudimos abrir esa imagen. Prueba con otra foto.', 'err'); return null; }
  const [aw, ah] = o.aspecto;
  const [W, H] = o.salida;
  const vw = Math.min(380, Math.floor(window.innerWidth - 56));
  const vh = Math.round(vw * ah / aw);
  const st = { zoom: 1, tx: 0, ty: 0, rot: 0, modo: 'cover', fondo: o.transparente ? 'transparent' : '#ffffff' };

  const d = document.createElement('dialog');
  d.className = 'a-dlg'; d.setAttribute('aria-label', 'Ajustar foto');
  d.innerHTML = `<div class="a-dlg-head"><h2>Ajusta la foto</h2></div>
    <div class="a-dlg-body"><div class="ed-stage">
      <div class="ed-view" style="width:${vw}px;height:${vh}px"><canvas></canvas></div>
      <input class="ed-zoom" type="range" min="1" max="4" step="0.01" value="1" aria-label="Zoom">
      <div class="ed-ctl">
        <button class="btn btn-ghost btn-sm" data-e="modo" type="button">Mostrar completa</button>
        <button class="btn btn-ghost btn-sm" data-e="rot" type="button">Girar</button>
        ${o.transparente ? '<button class="btn btn-ghost btn-sm" data-e="fondo" type="button">Fondo: transparente</button>' : ''}
      </div>
      <p class="a-muted" style="text-align:center">Arrastra para mover y pellizca o usa la barra para acercar.</p>
      <p class="a-muted" id="ed-info" style="text-align:center"></p>
    </div></div>
    <div class="a-dlg-foot"><button class="btn btn-ghost" data-e="cancel" type="button">Cancelar</button><button class="btn btn-primary" data-e="ok" type="button">Usar esta foto</button></div>`;
  document.body.append(d);
  const cv = $('canvas', d), view = $('.ed-view', d), zoom = $('.ed-zoom', d);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = vw * dpr; cv.height = vh * dpr;
  const ctx = cv.getContext('2d');

  const dims = () => (st.rot % 2 ? [bmp.height, bmp.width] : [bmp.width, bmp.height]);
  function pintar(c, w, h) {
    c.clearRect(0, 0, w, h);
    if (st.fondo !== 'transparent') { c.fillStyle = st.fondo; c.fillRect(0, 0, w, h); }
    const [iw, ih] = dims();
    const baseS = st.modo === 'cover' ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
    const s = baseS * st.zoom;
    const mx = Math.max(0, (iw * s - w) / 2) / w, my = Math.max(0, (ih * s - h) / 2) / h;
    st.tx = Math.max(-mx, Math.min(mx, st.tx)); st.ty = Math.max(-my, Math.min(my, st.ty));
    c.save();
    c.translate(w / 2 + st.tx * w, h / 2 + st.ty * h);
    c.rotate(st.rot * Math.PI / 2);
    c.scale(s, s);
    c.imageSmoothingQuality = 'high';
    c.drawImage(bmp, -bmp.width / 2, -bmp.height / 2);
    c.restore();
  }
  const redibujar = () => pintar(ctx, cv.width, cv.height);
  redibujar();

  // Gestos: arrastrar y pellizcar
  const ptrs = new Map();
  let dist0 = 0, zoom0 = 1;
  view.addEventListener('pointerdown', (e) => {
    view.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; dist0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = st.zoom; }
    view.style.cursor = 'grabbing';
  });
  view.addEventListener('pointermove', (e) => {
    const p = ptrs.get(e.pointerId);
    if (!p) return;
    if (ptrs.size === 1) {
      st.tx += (e.clientX - p.x) / vw; st.ty += (e.clientY - p.y) / vh;
    } else if (ptrs.size === 2 && dist0) {
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...ptrs.values()];
      st.zoom = Math.max(1, Math.min(4, zoom0 * Math.hypot(a.x - b.x, a.y - b.y) / dist0));
      zoom.value = st.zoom;
    }
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    redibujar();
  });
  const fin = (e) => { ptrs.delete(e.pointerId); dist0 = 0; view.style.cursor = 'grab'; };
  view.addEventListener('pointerup', fin); view.addEventListener('pointercancel', fin);
  view.addEventListener('wheel', (e) => { e.preventDefault(); st.zoom = Math.max(1, Math.min(4, st.zoom * (e.deltaY < 0 ? 1.06 : 0.94))); zoom.value = st.zoom; redibujar(); }, { passive: false });
  zoom.addEventListener('input', () => { st.zoom = Number(zoom.value); redibujar(); });

  async function exportar() {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    pintar(c.getContext('2d'), W, H);
    const mime = o.mime || (st.fondo === 'transparent' ? 'image/webp' : 'image/webp');
    let blob = null;
    for (const q of [0.86, 0.8, 0.74, 0.68, 0.6, 0.5, 0.4]) {
      blob = await new Promise((r) => c.toBlob(r, mime, q));
      if (blob && blob.size <= o.maxBytes) break;
    }
    // Navegadores sin WebP devuelven PNG: en ese caso usamos JPEG (sin transparencia)
    if (blob && blob.type !== mime && mime === 'image/webp' && st.fondo !== 'transparent') {
      for (const q of [0.86, 0.78, 0.7, 0.6, 0.5]) {
        blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', q));
        if (blob && blob.size <= o.maxBytes) break;
      }
    }
    return blob;
  }

  return new Promise((ok) => {
    const cerrar = (v) => { d.close(); d.remove(); try { bmp.close?.(); } catch { /* nada */ } ok(v); };
    d.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-e]');
      if (!b) return;
      const k = b.dataset.e;
      if (k === 'cancel') cerrar(null);
      else if (k === 'modo') { st.modo = st.modo === 'cover' ? 'contain' : 'cover'; b.textContent = st.modo === 'cover' ? 'Mostrar completa' : 'Llenar el cuadro'; redibujar(); }
      else if (k === 'rot') { st.rot = (st.rot + 1) % 4; st.tx = 0; st.ty = 0; redibujar(); }
      else if (k === 'fondo') { st.fondo = st.fondo === 'transparent' ? '#ffffff' : 'transparent'; b.textContent = st.fondo === 'transparent' ? 'Fondo: transparente' : 'Fondo: blanco'; redibujar(); }
      else if (k === 'ok') {
        b.disabled = true; b.textContent = 'Procesando…';
        const blob = await exportar();
        if (!blob) { aviso('No pudimos procesar la imagen.', 'err'); b.disabled = false; b.textContent = 'Usar esta foto'; return; }
        cerrar({ blob, url: URL.createObjectURL(blob) });
      }
    });
    d.addEventListener('cancel', (e) => { e.preventDefault(); cerrar(null); });
    d.showModal();
  });
}

// ═══════════════════════════════════════════════════════════════════
//  Publicar
// ═══════════════════════════════════════════════════════════════════
async function publicar() {
  if (S.publicando || !pendCount()) return;
  S.publicando = true;
  const barraPub = $('#a-pub');
  const setEstado = (t) => { barraPub.innerHTML = `<div class="a-spin"></div><span>${esc(t)}</span>`; };
  setEstado('Preparando…');
  try {
    // 1) productos.json más reciente + nuestros cambios
    let arr = JSON.parse(await leerTexto('productos.json'));
    for (const id of S.pend.deletes) arr = arr.filter((p) => p.id !== id);
    for (const [id, p] of S.pend.upserts) {
      const i = arr.findIndex((x) => x.id === id);
      if (i >= 0) arr[i] = p; else arr.unshift(p);
    }
    const archivos = [{ path: 'productos.json', b64: textToB64(JSON.stringify(arr, null, 2) + '\n') }];
    // 2) fotos nuevas
    for (const [ruta, blob] of S.pend.imgs) {
      if (!arr.some((p) => (p.imagenes || []).includes(ruta))) continue; // la foto quedó sin uso
      archivos.push({ path: ruta, b64: await blobToB64(blob) });
    }
    // 3) fotos que ya no se usan (si ningún otro producto las usa)
    const enUso = new Set(arr.flatMap((p) => p.imagenes || []));
    for (const ruta of S.pend.borrarImgs) {
      if (ruta.startsWith('img/productos/') && !enUso.has(ruta)) archivos.push({ path: ruta, borrar: true });
    }
    // 4) logo, foto del local, imagen para compartir
    for (const [ruta, blob] of S.pend.sitio) archivos.push({ path: ruta, b64: await blobToB64(blob) });
    // 5) ajustes
    if (S.pend.ajustes) archivos.push({ path: 'ajustes.json', b64: textToB64(JSON.stringify(S.pend.ajustes, null, 2) + '\n') });

    const n = S.pend.upserts.size, m = S.pend.deletes.size;
    const partes = [];
    if (n) partes.push(`${n} producto${n === 1 ? '' : 's'}`);
    if (m) partes.push(`${m} eliminado${m === 1 ? '' : 's'}`);
    if (S.pend.sitio.size) partes.push('imágenes del sitio');
    if (S.pend.ajustes) partes.push('ajustes');
    await commit(archivos, `Panel: ${partes.join(', ') || 'cambios'}`, (i, t) => setEstado(`Subiendo archivos ${i} de ${t}…`));

    S.pend = { upserts: new Map(), deletes: new Set(), imgs: new Map(), borrarImgs: new Set(), sitio: new Map(), ajustes: null };
    S.productos = arr;
    S.ajustes = JSON.parse(await leerTexto('ajustes.json').catch(() => '{}'));
    S.publicando = false;
    render();
    $('.a-main').insertAdjacentHTML('afterbegin', '<div class="a-ok" role="status">Publicado. Los cambios aparecen en la tienda en 1 o 2 minutos. Si no los ves, recarga la página.</div>');
    aviso('Publicado');
  } catch (err) {
    S.publicando = false;
    console.error(err);
    render();
    aviso(explicar(err), 'err');
  }
}

// ═══════════════════════════════════════════════════════════════════
//  Ajustes: guardar
// ═══════════════════════════════════════════════════════════════════
function guardarAjustes(form) {
  const fd = new FormData(form);
  const salida = JSON.parse(JSON.stringify({
    sorteo: Object.fromEntries(AJUSTES_PERMITIDOS.sorteo.map((k) => [k, CONFIG.sorteo[k]])),
    local: Object.fromEntries(AJUSTES_PERMITIDOS.local.map((k) => [k, CONFIG.local[k]])),
    legal: Object.fromEntries(AJUSTES_PERMITIDOS.legal.map((k) => [k, CONFIG.legal[k]])),
  }));
  salida.sorteo.activo = fd.get('sorteo.activo') === 'on';
  for (const k of ['sorteo.premioDelMes', 'sorteo.fechaDelSorteo', 'local.direccion', 'local.referencia', 'legal.titular', 'legal.ruc', 'legal.ciudad', 'legal.direccion']) {
    const [a, b] = k.split('.');
    salida[a][b] = String(fd.get(k) || '').trim();
  }
  const hist = [];
  $$('#hist [data-h]', form).forEach((r) => {
    const g = (n) => $(`[data-hf="${n}"]`, r).value.trim();
    if (g('mes') || g('numero') || g('premio')) hist.push({ mes: g('mes'), numero: g('numero') === '' ? '' : Number(g('numero')) || g('numero'), premio: g('premio') });
  });
  salida.sorteo.historial = hist;
  const cambioLegal = ['titular', 'ruc', 'ciudad', 'direccion'].some((k) => (S.ajustes?.legal?.[k] || '') !== salida.legal[k]);
  salida.legal.actualizado = cambioLegal || !S.ajustes?.legal?.actualizado ? hoyES() : S.ajustes.legal.actualizado;
  const ruc = salida.legal.ruc;
  if (ruc && !/^\d{13}$/.test(ruc)) { $('#e-aj').textContent = 'El RUC debe tener 13 números.'; return; }
  $('#e-aj').textContent = '';
  S.pend.ajustes = salida;
  aplicarAjustes(salida);
  refrescarBarra();
  aviso('Ajustes guardados. Pulsa Publicar para subirlos.');
}

// ═══════════════════════════════════════════════════════════════════
//  Eventos de la pantalla principal
// ═══════════════════════════════════════════════════════════════════
app.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-a]');
  if (!b) return;
  const a = b.dataset.a;
  if (a === 'vista') { S.vista = b.dataset.v; render(); }
  else if (a === 'salir') {
    if (pendCount() && !confirm('Tienes cambios sin publicar. Si sales, se pierden. ¿Salir?')) return;
    salir();
  } else if (a === 'reintentar') entrar();
  else if (a === 'nuevo') abrirProducto(null);
  else if (a === 'editar') abrirProducto(S.productos.find((p) => p.id === b.dataset.id));
  else if (a === 'ocultar') {
    const p = S.productos.find((x) => x.id === b.dataset.id);
    if (!p) return;
    p.visible = p.visible === false;
    S.pend.upserts.set(p.id, p);
    render();
  } else if (a === 'mas') { S.mostrar += 60; $('#a-lista').innerHTML = listaProductos().toString(); }
  else if (a === 'publicar') publicar();
  else if (a === 'descartar') {
    if (!confirm('¿Descartar todos los cambios sin publicar?')) return;
    S.pend = { upserts: new Map(), deletes: new Set(), imgs: new Map(), borrarImgs: new Set(), sitio: new Map(), ajustes: null };
    S.prev.clear();
    entrar();
  } else if (a === 'hist-add') { $('#hist').insertAdjacentHTML('beforeend', filaHist({}, Date.now()).toString()); }
  else if (a === 'hist-del') b.closest('[data-h]').remove();
  else if (a === 'sitio') {
    const k = b.dataset.k;
    const cfg = {
      logo: { ruta: 'img/logo.webp', aspecto: [1, 1], salida: [1024, 1024], maxBytes: 400 * 1024, transparente: true },
      local: { ruta: 'img/local.webp', aspecto: [16, 10], salida: [1600, 1000], maxBytes: 350 * 1024 },
      og: { ruta: 'img/og.jpg', aspecto: [1200, 630], salida: [1200, 630], maxBytes: 300 * 1024, mime: 'image/jpeg' },
    }[k];
    const archivo = await elegirArchivo();
    if (!archivo) return;
    const r = await abrirEditor({ archivo, ...cfg });
    if (!r) return;
    S.pend.sitio.set(cfg.ruta, r.blob);
    S.prev.set(cfg.ruta, r.url);
    render();
    aviso('Imagen lista. Pulsa Publicar para subirla.');
  }
});
app.addEventListener('input', (e) => {
  if (e.target.id === 'a-q') { S.q = e.target.value; S.mostrar = 60; $('#a-lista').innerHTML = listaProductos().toString(); }
});
app.addEventListener('change', (e) => {
  if (e.target.id === 'a-cat') { S.cat = e.target.value; S.mostrar = 60; $('#a-lista').innerHTML = listaProductos().toString(); }
});
app.addEventListener('submit', (e) => {
  if (e.target.id === 'f-ajustes') { e.preventDefault(); guardarAjustes(e.target); }
});
window.addEventListener('beforeunload', (e) => { if (pendCount()) { e.preventDefault(); e.returnValue = ''; } });

// ═══════════════════════════════════════════════════════════════════
//  Inicio
// ═══════════════════════════════════════════════════════════════════
(async () => {
  const t = leerTokenGuardado();
  if (!t) { pantallaLogin(); return; }
  S.token = t;
  await entrar();
})();
