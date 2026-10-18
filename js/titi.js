// Titi: asistente de la tienda. Funciona con reglas (sin servidores ni IA externa):
// responde horario, cómo comprar, ubicación, envíos, sorteo, recargas, rosas, clases
// y busca productos por nombre. Si no entiende, te lleva a WhatsApp.
import { CONFIG } from './config.js';
import { html, money, norm, waLink, waNumeroBonito, estadoLocal, hora12, DIAS_ES, resumenHorario, $ } from './util.js';
import { icon } from './icons.js';
import { buscar, promos, precioDesde } from './data.js';
import { reducedMotion } from './util.js';

const RAPIDOS = [
  ['Horario', 'horario'],
  ['Cómo comprar', 'como comprar'],
  ['Dónde están', 'donde estan'],
  ['Costo de envío', 'envio'],
  ['Sorteo', 'sorteo'],
  ['Recargas', 'recargas'],
  ['Rosas', 'rosas'],
  ['Clases', 'clases'],
  ['Ofertas', 'ofertas'],
  ['Hablar con una persona', 'whatsapp'],
];

const wa = (txt = 'Hola, quiero hacer una consulta.', etiqueta = 'Escribir por WhatsApp') =>
  html`<a href="${waLink(txt)}" target="_blank" rel="noopener">${etiqueta}</a>`;
const ir = (href, etiqueta) => html`<a href="${href}" data-titi-go>${etiqueta}</a>`;

function respuestaHorario() {
  const e = estadoLocal();
  const hoy = CONFIG.horario[e.dia];
  const estado = e.abierto
    ? `Estamos abiertos ahora y cerramos a las ${hora12(e.cierra)}.`
    : `Ahora estamos cerrados. Hoy (${DIAS_ES[e.dia]}) atendemos de ${hora12(hoy[0])} a ${hora12(hoy[1])}. Déjanos tu mensaje por WhatsApp y te respondemos al abrir.`;
  return html`${estado}<br><br>${resumenHorario()}. Hora de Ecuador.`;
}

function respuestaPrecio(q) {
  const quitar = /\b(cuanto|cuesta|cuestan|precio|precios|vale|valen|tienen|tiene|hay|busco|quiero|necesito|dime|dame|me|el|la|los|las|un|una|unos|unas|de|del|para|por|favor|en|que|y|o|a|con|sus|su|es|son|lo)\b/g;
  const resto = norm(q).replace(quitar, ' ').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean)
    .map((t) => (t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t)).join(' ');
  if (resto.length < 2) return null;
  const res = buscar(resto).slice(0, 4);
  if (!res.length) return null;
  return html`Encontré esto:
    <div class="list">${res.map((p) => html`<a href="#/p/${p.id}" data-titi-go><span>${p.nombre}</span><span>${p.opciones.length > 1 ? 'desde ' : ''}${money(precioDesde(p))}</span></a>`)}</div>
    <br>Si buscas otra cosa, escríbela o ${wa(`Hola, estoy buscando: ${q}`, 'pregúntanos por WhatsApp')}.`;
}

// Cada intención: patrón + respuesta. El orden importa (la primera que coincide gana).
const INTENCIONES = [
  [/\b(hola|buenas|buenos dias|buen dia|buenas tardes|buenas noches|hey|saludos|que tal)\b/, () =>
    html`¡Hola! Soy Titi. Te ayudo con horarios, cómo comprar, envíos, el sorteo y precios. ¿Qué necesitas?`],
  [/\b(gracias|muchas gracias|listo|ok gracias|vale gracias)\b/, () =>
    html`¡Con gusto! Si necesitas algo más, aquí estoy.`],
  [/\b(horario|horarios|hora|abren|abierto|cierran|cerrado|atienden|atencion|a que hora|abierta)\b/, respuestaHorario],
  [/\b(donde|ubicacion|ubicados|direccion|local|mapa|llegar|quedan|estan ubicad|tienda fisica|visitar)\b/, () => {
    const L = CONFIG.local;
    const dir = [L.direccion, L.referencia].filter(Boolean).join('. ');
    return html`Tenemos local físico${dir ? ': ' + dir + '.' : '.'}<br><br><a href="${L.enlace}" target="_blank" rel="noopener">Ver cómo llegar en Google Maps</a> · ${ir('#/local', 'Ver horario y mapa')}`;
  }],
  [/\b(como compro|como comprar|como pido|como hago|pedido|pedir|carrito|comprar|proceso de compra)\b/, () =>
    html`Es sencillo:<br>1. Elige tus productos y agrégalos al carrito.<br>2. Escribe tu nombre (y tu dirección si es ropa).<br>3. Pulsa “Comprar por WhatsApp”: tu pedido llega a nuestro chat.<br>4. Confirmamos y pagas a nombre de <b>${CONFIG.pago.titular}</b>.<br><br>${ir('#/como-comprar', 'Ver más detalles')}`],
  [/\b(envio|envios|enviar|entrega|entregan|delivery|courier|despacho|cuanto demora|cuanto tarda|llega)\b/, () =>
    html`<b>Ropa:</b> envío de ${money(CONFIG.envio.costo)} a todo el país, <b>gratis desde ${money(CONFIG.envio.gratisDesde)}</b>. Tarda entre 1 y 5 días hábiles según la ciudad.<br><b>Productos digitales:</b> sin envío, los entregamos por WhatsApp.<br><b>Rosas:</b> el envío se acuerda contigo por WhatsApp (${CONFIG.envio.paisesRosas.join(', ')}).<br><br>${ir('#/legal/envios', 'Ver política de envíos')}`],
  [/\b(pago|pagar|pagos|transferencia|deposito|payphone|cuenta bancaria|banco|tarjeta|efectivo|como pago)\b/, () =>
    html`Aceptamos transferencia, depósito y PayPhone. Te enviamos los datos por WhatsApp al confirmar tu pedido.<br><br><b>Importante:</b> el pago es únicamente a nombre de <b>${CONFIG.pago.titular}</b>. Si alguien te pide pagar a otro nombre, no lo hagas y escríbenos.`],
  [/\b(sorteo|sorteos|rifa|rifas|bingo|bingos|premio|ganador|ganar|participar|numero de la suerte)\b/, () => {
    const s = CONFIG.sorteo;
    if (!s.activo) return html`Por ahora no hay un sorteo activo. Síguenos en redes para enterarte del próximo.`;
    return html`Con una compra desde <b>${money(s.minimo)}</b> recibes un número del 1 al ${s.numeroMaximo} para el Sorteo Mensual. Se reinicia cada mes, el sorteo se puede seguir en nuestras redes y al ganador lo contactamos por WhatsApp.<br><br>${ir('#/sorteo', 'Cómo participar')} · ${ir('#/legal/sorteo', 'Bases')}`;
  }],
  [/\b(ecuabet|apuesta|apuestas|apostar)\b/, () =>
    html`Recargamos saldo de Ecuabet <b>solo a mayores de 18 años</b>. Elige el monto en ${ir('#/recargas/ecuabet', 'Recargas · Ecuabet')}. Juega con responsabilidad.`],
  [/\b(recarga|recargas|claro|movistar|tigo|cnt|saldo|ilimitada|ilimitado|free fire|freefire|videojuego|videojuegos|diamantes)\b/, () =>
    html`Hacemos recargas de <b>Claro, Movistar, Tigo y CNT</b> (normales e ilimitadas), de videojuegos como Free Fire y de Ecuabet (+18). Se entregan por WhatsApp.<br><br>${ir('#/recargas', 'Ver recargas')}`],
  [/\b(rosa|rosas|bonche|bonches|flor|flores|ramo|ramos|exportacion)\b/, () =>
    html`Vendemos rosas por <b>bonche</b> y enviamos a ${CONFIG.envio.paisesRosas.join(', ')}. No hay envío gratis: el costo y la entrega los acordamos contigo por WhatsApp.<br><br>${ir('#/rosas', 'Ver variedades')}`],
  [/\b(clase|clases|refuerzo|tarea|tareas|pedagogico|pedagogica|pedagogia|escuela|colegio|egb|profesora|acompanamiento)\b/, () =>
    html`El acompañamiento pedagógico es para estudiantes de EGB y está a cargo de una Licenciada en Ciencias de la Educación Básica. Los horarios y cupos se confirman por WhatsApp.<br><br>${wa('Hola, quiero consultar horarios y cupos del acompañamiento pedagógico.', 'Consultar horarios y cupos')}`],
  [/\b(devolucion|devolver|cambio|cambios|cambiar|garantia|reclamo|reclamos|queja|talla no|no me queda|reembolso)\b/, () =>
    html`Tienes <b>15 días</b> para pedir un cambio o devolución de productos físicos, en el mismo estado en que los recibiste. Los productos digitales ya entregados tienen garantía de funcionamiento. Si algo llegó mal, escríbenos con fotos.<br><br>${ir('#/legal/devoluciones', 'Ver política')} · ${ir('#/legal/reclamos', 'Reclamos')}`],
  [/\b(oferta|ofertas|promo|promos|promocion|promociones|descuento|descuentos|barato|baratos|rebaja)\b/, () => {
    const n = promos().length;
    return n
      ? html`Ahora hay <b>${n}</b> ${n === 1 ? 'producto' : 'productos'} en promoción. ${ir('#/promociones', 'Ver promociones')}`
      : html`En este momento no hay promociones activas. Síguenos en redes: ahí avisamos primero.`;
  }],
  [/\b(streaming|netflix|disney|spotify|youtube|canva|chatgpt|chat gpt|gemini|capcut|office|windows|licencia|licencias|programa|programas|pantalla|iptv)\b/, null],
  [/\b(whatsapp|asesor|asesora|humano|persona|hablar|contacto|contactar|telefono|celular|numero de contacto|llamar)\b/, () =>
    html`Escríbenos al ${waNumeroBonito()}. ${wa('Hola, quiero hacer una consulta.', 'Abrir WhatsApp')}<br>Atendemos ${resumenHorario().toLowerCase()}.`],
  [/\b(redes|tiktok|instagram|facebook|siguenos|seguir)\b/, () =>
    html`Somos <b>@bhalleffort3</b>: <a href="${CONFIG.redes.tiktok}" target="_blank" rel="noopener">TikTok</a> · <a href="${CONFIG.redes.instagram}" target="_blank" rel="noopener">Instagram</a> · <a href="${CONFIG.redes.facebook}" target="_blank" rel="noopener">Facebook</a>.`],
  [/\b(quien eres|que eres|titi|robot|bot)\b/, () =>
    html`Soy Titi, el asistente de ${CONFIG.marca.nombre}. Respondo preguntas frecuentes y busco productos. Para algo más personal, te paso con una persona por WhatsApp.`],
];

function responder(texto) {
  const q = norm(texto).replace(/[¿?¡!.,;]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!q) return html`Escríbeme tu pregunta o elige una opción de abajo.`;
  const pideProducto = /\b(cuanto|cuesta|cuestan|precio|precios|vale|valen|tienen|tiene|hay|busco|quiero|necesito)\b/.test(q);
  if (pideProducto) {
    const r = respuestaPrecio(q);
    if (r) return r;
  }
  for (const [re, fn] of INTENCIONES) {
    if (re.test(q)) {
      if (fn) return fn(q);
      const r = respuestaPrecio(q);
      if (r) return r;
      return html`Tenemos streaming, IA, programas y licencias. ${ir('#/digital', 'Ver Streaming y Digital')}`;
    }
  }
  const r = respuestaPrecio(q);
  if (r) return r;
  return html`No estoy seguro de haberte entendido. Prueba con una de las opciones de abajo o escríbeme el nombre del producto.<br><br>Si prefieres, ${wa(`Hola, tengo una consulta: ${texto}`, 'habla con una persona por WhatsApp')}.`;
}

// ── Interfaz ────────────────────────────────────────────────────────
export function iniciarTiti() {
  const fab = document.createElement('button');
  fab.className = 'titi-fab';
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Habla con Titi, asistente de la tienda');
  fab.setAttribute('aria-haspopup', 'dialog');
  fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = `<span class="orb" aria-hidden="true"></span><span class="t">Habla con Titi</span>`;

  const panel = document.createElement('section');
  panel.className = 'titi';
  panel.dataset.open = 'false';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Titi, asistente de BHALLEFFORT');
  panel.inert = true;
  panel.innerHTML = `
    <div class="titi-head"><span class="orb" aria-hidden="true"></span>
      <div><b>Titi</b><small>Asistente de ${CONFIG.marca.nombre}</small></div>
      <button class="icon-btn" type="button" data-titi-close aria-label="Cerrar chat">${icon('x')}</button></div>
    <div class="titi-log" role="log" aria-live="polite"></div>
    <div class="quick" aria-label="Preguntas rápidas">${RAPIDOS.map(([t, q]) => `<button type="button" data-q="${q}">${t}</button>`).join('')}</div>
    <form class="titi-form" autocomplete="off">
      <input type="text" name="m" placeholder="Escribe tu pregunta" aria-label="Escribe tu pregunta" enterkeyhint="send" maxlength="160">
      <button class="btn btn-primary" type="submit" aria-label="Enviar">${icon('send')}</button>
    </form>`;
  document.body.append(fab, panel);

  const log = $('.titi-log', panel);
  const form = $('.titi-form', panel);
  const input = form.elements.m;
  let saludado = false;

  const bajar = () => log.scrollTo({ top: log.scrollHeight, behavior: reducedMotion() ? 'auto' : 'smooth' });
  function msg(contenido, quien) {
    const d = document.createElement('div');
    d.className = `msg ${quien}`;
    if (quien === 'me') d.textContent = contenido;
    else d.innerHTML = contenido.toString();
    log.append(d);
    bajar();
    return d;
  }
  function preguntar(texto) {
    msg(texto, 'me');
    const pensando = document.createElement('div');
    pensando.className = 'msg bot';
    pensando.innerHTML = '<span class="dots" aria-label="Titi está escribiendo"><i></i><i></i><i></i></span>';
    log.append(pensando);
    bajar();
    setTimeout(() => {
      pensando.remove();
      msg(responder(texto), 'bot');
    }, reducedMotion() ? 0 : 420);
  }

  function abrir() {
    panel.inert = false;
    panel.dataset.open = 'true';
    fab.dataset.open = 'true';
    fab.setAttribute('aria-expanded', 'true');
    if (!saludado) {
      saludado = true;
      const e = estadoLocal();
      msg(html`¡Hola! Soy <b>Titi</b>. ${e.abierto ? 'Estamos abiertos ahora.' : 'Ahora estamos cerrados, pero puedo ayudarte igual.'} Elige una opción o escríbeme tu pregunta.`, 'bot');
    }
    setTimeout(() => input.focus({ preventScroll: true }), 260);
  }
  function cerrar() {
    panel.dataset.open = 'false';
    fab.dataset.open = 'false';
    fab.setAttribute('aria-expanded', 'false');
    panel.inert = true;
    fab.focus({ preventScroll: true });
  }

  // En el celular el botón se esconde al bajar y reaparece al subir, para no tapar el contenido.
  let yAnt = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (matchMedia('(max-width: 720px)').matches) fab.dataset.dir = y > yAnt && y > 160 ? 'down' : 'up';
    yAnt = y;
  }, { passive: true });
  fab.addEventListener('click', abrir);
  panel.addEventListener('click', (e) => {
    if (e.target.closest('[data-titi-close]')) return cerrar();
    const q = e.target.closest('[data-q]');
    if (q) return preguntar(q.textContent.trim().length ? q.textContent : q.dataset.q);
    const go = e.target.closest('[data-titi-go]');
    if (go && window.matchMedia('(max-width: 520px)').matches) cerrar();
  });
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = input.value.trim();
    if (!t) return;
    input.value = '';
    preguntar(t);
  });
  // Permite abrir a Titi desde cualquier botón con data-titi-open
  document.addEventListener('click', (e) => { if (e.target.closest('[data-titi-open]')) abrir(); });

  return { abrir, cerrar };
}

