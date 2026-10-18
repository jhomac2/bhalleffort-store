// Escena 3D del inicio: una moneda con la marca y siete objetos de las categorías
// girando alrededor. Arrastra para girar, toca un objeto para entrar a su categoría.
// Se carga solo cuando hace falta y se apaga sola si el equipo no la aguanta.
import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';

const TAU = Math.PI * 2;

// ── Materiales y texturas ───────────────────────────────────────────
const mat = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.46, metalness: 0.02, clearcoat: 0.3, clearcoatRoughness: 0.35, ...o });
const matte = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0, ...o });

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
const box = (w, h, d, m, r = 0.06) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), m);

// ── Objetos ─────────────────────────────────────────────────────────
function moneda(logo) {
  const g = new THREE.Group();
  const oro = mat(0xe3a82b, { metalness: 0.92, roughness: 0.24, clearcoat: 0.35 });
  const canto = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.28, 72), oro);
  canto.rotation.x = Math.PI / 2;
  g.add(canto);
  for (const z of [0.14, -0.14]) {
    const aro = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.115, 20, 80), oro);
    aro.position.z = z;
    g.add(aro);
  }
  const t = canvasTex(768, 768, (c, w, h) => {
    const gr = c.createRadialGradient(w * 0.38, h * 0.32, 20, w / 2, h / 2, w * 0.58);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.7, '#e4edf8'); gr.addColorStop(1, '#c4d5ea');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(30,111,184,.18)'; c.lineWidth = 10;
    c.beginPath(); c.arc(w / 2, h / 2, w * 0.43, 0, TAU); c.stroke();
    if (logo) {
      const s = w * 0.7, r = logo.naturalWidth / logo.naturalHeight || 1;
      const lw = r >= 1 ? s : s * r, lh = r >= 1 ? s / r : s;
      c.drawImage(logo, (w - lw) / 2, (h - lh) / 2, lw, lh);
    } else {
      c.fillStyle = '#1e6fb8';
      c.font = '800 470px Bricolage, system-ui, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      c.fillText('B', w / 2, h * 0.72);
    }
  });
  for (const [z, ry] of [[0.146, 0], [-0.146, Math.PI]]) {
    const cara = new THREE.Mesh(new THREE.CircleGeometry(1.29, 64), new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, metalness: 0.1 }));
    cara.position.z = z; cara.rotation.y = ry;
    g.add(cara);
  }
  return g;
}

function camiseta() {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(-0.38, 1.0);
  s.lineTo(-0.98, 0.86); s.lineTo(-1.62, 0.28); s.lineTo(-1.28, -0.12); s.lineTo(-0.9, 0.18);
  s.lineTo(-0.9, -1.2); s.lineTo(0.9, -1.2); s.lineTo(0.9, 0.18);
  s.lineTo(1.28, -0.12); s.lineTo(1.62, 0.28); s.lineTo(0.98, 0.86); s.lineTo(0.38, 1.0);
  s.quadraticCurveTo(0, 0.52, -0.38, 1.0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 6, curveSegments: 14 });
  geo.center();
  g.add(new THREE.Mesh(geo, mat(0x1f78d1, { roughness: 0.72, clearcoat: 0.05 })));
  const cuello = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.045, 10, 36, Math.PI), mat(0x124a7d));
  cuello.rotation.z = Math.PI; cuello.position.set(0, 0.9, 0.2);
  g.add(cuello);
  const etq = box(0.52, 0.3, 0.05, mat(0xe3a82b, { metalness: 0.5, roughness: 0.3 }), 0.05);
  etq.position.set(0, -0.15, 0.3);
  g.add(etq);
  g.scale.setScalar(0.62);
  return g;
}

function rayo() {
  const s = new THREE.Shape();
  s.moveTo(0.18, 0.9); s.lineTo(-0.5, -0.1); s.lineTo(-0.08, -0.1); s.lineTo(-0.22, -0.9);
  s.lineTo(0.5, 0.18); s.lineTo(0.08, 0.18); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 });
  geo.center();
  return new THREE.Mesh(geo, mat(0xffd66b, { metalness: 0.6, roughness: 0.25, emissive: 0x6b4a00, emissiveIntensity: 0.25 }));
}

function celular() {
  const g = new THREE.Group();
  g.add(box(1.0, 1.9, 0.17, mat(0x12264a, { metalness: 0.55, roughness: 0.28 }), 0.15));
  const t = canvasTex(256, 512, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    roundRect(c, 0, 0, w, h, 34); c.save(); c.clip();
    const gr = c.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#5adce6'); gr.addColorStop(0.55, '#1ea5b3'); gr.addColorStop(1, '#1e6fb8');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(w * 0.9, h * 0.1, 120, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.font = '800 54px Bricolage, system-ui, sans-serif'; c.textAlign = 'center';
    c.fillText('Recarga', w / 2, 120);
    c.font = '800 96px Bricolage, system-ui, sans-serif'; c.fillText('$5', w / 2, 330);
    c.fillStyle = 'rgba(255,255,255,.9)'; roundRect(c, 46, 380, w - 92, 64, 20); c.fill();
    c.fillStyle = '#124a7d'; c.font = '800 32px Bricolage, system-ui, sans-serif'; c.fillText('Listo', w / 2, 424);
    c.restore();
  });
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 1.76), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.4, toneMapped: false }));
  pantalla.position.z = 0.088;
  g.add(pantalla);
  const r = rayo(); r.scale.setScalar(0.55); r.position.set(0.62, 0.55, 0.45); r.rotation.z = -0.25;
  g.add(r);
  return g;
}

function tele() {
  const g = new THREE.Group();
  g.add(box(2.25, 1.45, 0.2, mat(0x6c4ce0, { roughness: 0.3 }), 0.13));
  const t = canvasTex(512, 320, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#8a6bff'); gr.addColorStop(1, '#f06aa6');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.arc(w * 0.15, h * 0.1, 150, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.lineJoin = 'round'; c.lineWidth = 34; c.strokeStyle = '#fff';
    c.beginPath(); c.moveTo(w * 0.42, h * 0.3); c.lineTo(w * 0.42, h * 0.7); c.lineTo(w * 0.62, h * 0.5); c.closePath(); c.fill(); c.stroke();
  });
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.24), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
  pantalla.position.z = 0.102;
  g.add(pantalla);
  const pie = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.3, 16), mat(0x3f2a9e));
  pie.position.y = -0.85;
  const base = box(0.95, 0.07, 0.42, mat(0x3f2a9e), 0.03); base.position.y = -1.02;
  g.add(pie, base);
  g.scale.setScalar(0.78);
  g.position.y = 0.1;
  return g;
}

function rosa() {
  const g = new THREE.Group();
  const cabeza = new THREE.Group();
  const petalo = new THREE.SphereGeometry(1, 22, 16);
  const capas = [
    { n: 4, r: 0.1, w: 0.2, h: 0.4, tilt: 0.05, c: 0x9e1646 },
    { n: 5, r: 0.17, w: 0.26, h: 0.46, tilt: 0.28, c: 0xc2204f },
    { n: 6, r: 0.26, w: 0.3, h: 0.5, tilt: 0.52, c: 0xdc3566 },
    { n: 7, r: 0.35, w: 0.33, h: 0.5, tilt: 0.82, c: 0xea5681 },
  ];
  capas.forEach((L, li) => {
    const m = mat(L.c, { roughness: 0.42, clearcoat: 0.4, side: THREE.DoubleSide });
    for (let i = 0; i < L.n; i++) {
      const pivote = new THREE.Group();
      pivote.rotation.y = (i / L.n) * TAU + li * 0.5;
      const inc = new THREE.Group();
      inc.position.z = L.r; inc.rotation.x = L.tilt;
      const p = new THREE.Mesh(petalo, m);
      p.scale.set(L.w, L.h, 0.075);
      p.position.y = L.h * 0.92;
      inc.add(p); pivote.add(inc); cabeza.add(pivote);
    }
  });
  const centro = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 14), mat(0x7a0f36));
  centro.position.y = 0.18;
  cabeza.add(centro);
  cabeza.position.y = 0.45;
  cabeza.scale.setScalar(1.05);
  g.add(cabeza);
  const tallo = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.5, 12), matte(0x1f9d5b));
  tallo.position.y = -0.38;
  g.add(tallo);
  const hoja = new THREE.SphereGeometry(1, 16, 10);
  [[-1, -0.55], [1, -0.85]].forEach(([lado, y]) => {
    const h = new THREE.Mesh(hoja, mat(0x2fbf75, { roughness: 0.5 }));
    h.scale.set(0.34, 0.09, 0.15);
    h.position.set(lado * 0.3, y, 0);
    h.rotation.z = lado * 0.5;
    g.add(h);
  });
  g.scale.setScalar(0.9);
  g.position.y = 0.05;
  return g;
}

function libro() {
  const g = new THREE.Group();
  g.add(box(1.5, 1.05, 0.3, mat(0x0f9d6b), 0.05));
  const hojas = box(1.38, 0.94, 0.24, matte(0xfff3d6), 0.02);
  hojas.position.set(0.06, 0, 0.0);
  g.add(hojas);
  const lomo = box(0.12, 1.07, 0.32, mat(0x0a6d4a), 0.04);
  lomo.position.x = -0.72;
  g.add(lomo);
  const t = canvasTex(512, 384, (c, w, h) => {
    roundRect(c, 0, 0, w, h, 26); c.fillStyle = '#0f9d6b'; c.fill();
    c.strokeStyle = '#ffd66b'; c.lineWidth = 10; roundRect(c, 30, 30, w - 60, h - 60, 18); c.stroke();
    c.fillStyle = '#fff'; c.font = '800 150px Bricolage, system-ui, sans-serif'; c.textAlign = 'center';
    c.fillText('ABC', w / 2, h * 0.62);
  });
  const portada = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), new THREE.MeshBasicMaterial({ map: t, toneMapped: false, transparent: true }));
  portada.position.set(0.05, 0, 0.156);
  g.add(portada);
  const lapiz = new THREE.Group();
  const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.0, 6), mat(0xf6c026));
  const punta = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 6), matte(0xecc9a0)); punta.position.y = -0.61;
  const mina = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 6), matte(0x2b3a55)); mina.position.y = -0.74;
  const aro = new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.076, 0.1, 12), mat(0xcfd8e6, { metalness: 0.9, roughness: 0.25 })); aro.position.y = 0.55;
  const goma = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 12), matte(0xff8fa8)); goma.position.y = 0.65;
  lapiz.add(cuerpo, punta, mina, aro, goma);
  lapiz.rotation.z = 0.95; lapiz.position.set(0.45, 0.42, 0.34);
  g.add(lapiz);
  g.rotation.x = -0.12;
  g.scale.setScalar(0.95);
  return g;
}

function regalo() {
  const g = new THREE.Group();
  const caja = box(1.2, 0.95, 1.2, mat(0xf0583b), 0.05);
  const tapa = box(1.34, 0.28, 1.34, mat(0xff7556), 0.05); tapa.position.y = 0.6;
  const oro = mat(0xffd66b, { metalness: 0.5, roughness: 0.3 });
  const c1 = box(0.22, 0.97, 1.22, oro, 0.02), c2 = box(1.22, 0.97, 0.22, oro, 0.02);
  const c3 = box(0.24, 0.3, 1.36, oro, 0.02); c3.position.y = 0.6;
  const c4 = box(1.36, 0.3, 0.24, oro, 0.02); c4.position.y = 0.6;
  const lazo = new THREE.TorusGeometry(0.22, 0.075, 14, 28);
  const l1 = new THREE.Mesh(lazo, oro), l2 = new THREE.Mesh(lazo, oro);
  l1.scale.set(1, 1.35, 0.7); l2.scale.set(1, 1.35, 0.7);
  l1.position.set(-0.2, 0.95, 0); l1.rotation.z = 0.7;
  l2.position.set(0.2, 0.95, 0); l2.rotation.z = -0.7;
  const nudo = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), oro); nudo.position.y = 0.84;
  g.add(caja, tapa, c1, c2, c3, c4, l1, l2, nudo);
  g.position.y = -0.2;
  g.scale.setScalar(0.88);
  return g;
}

function etiqueta() {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(-0.7, -1.0); s.lineTo(0.7, -1.0); s.lineTo(0.7, 0.5); s.lineTo(0.36, 0.95); s.lineTo(-0.36, 0.95); s.lineTo(-0.7, 0.5); s.closePath();
  const hole = new THREE.Path(); hole.absarc(0, 0.62, 0.12, 0, TAU, true);
  s.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4 });
  geo.center();
  g.add(new THREE.Mesh(geo, mat(0xf2401f, { roughness: 0.6, clearcoat: 0.1 })));
  const t = canvasTex(384, 384, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.fillStyle = '#fff'; c.textAlign = 'center';
    c.font = '800 52px Bricolage, system-ui, sans-serif'; c.fillText('OFERTA', w / 2, 90);
    c.font = '800 150px Bricolage, system-ui, sans-serif'; c.fillStyle = '#ffe08c'; c.fillText('-30%', w / 2, 250);
  });
  const txt = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false }));
  txt.position.set(0, -0.28, 0.17);
  g.add(txt);
  const cuerda = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 28), mat(0xffd66b, { metalness: 0.6 }));
  cuerda.position.set(0, 0.62 + 0.0, 0.0); cuerda.rotation.x = Math.PI / 2.4;
  g.add(cuerda);
  g.rotation.z = 0.18;
  g.scale.setScalar(0.9);
  return g;
}

// ── Escena ──────────────────────────────────────────────────────────
function webglDisponible() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

/**
 * @param {{stage: HTMLElement, canvas: HTMLCanvasElement, tip: HTMLElement, logo?: HTMLImageElement|null,
 *          sorteo?: boolean, onGo: (href: string) => void, onFail?: () => void}} o
 * @returns {null | {dispose: () => void}}
 */
export function iniciarHero(o) {
  const { stage, canvas, tip, logo = null, sorteo = true, onGo, onFail } = o;
  if (!webglDisponible()) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch { return null; }
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environment = envTex;
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const sol = new THREE.DirectionalLight(0xffffff, 1.1);
  sol.position.set(3, 5, 6);
  scene.add(sol);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  const raiz = new THREE.Group();
  scene.add(raiz);

  // Sombra suave en el piso (falsa, barata)
  const sombraTex = canvasTex(256, 256, (c, w, h) => {
    const gr = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(15,37,71,.22)'); gr.addColorStop(1, 'rgba(15,37,71,0)');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
  });
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 5.6), new THREE.MeshBasicMaterial({ map: sombraTex, transparent: true, depthWrite: false, toneMapped: false }));
  sombra.rotation.x = -Math.PI / 2; sombra.position.y = -2.15;
  raiz.add(sombra);

  const centro = moneda(logo);
  centro.position.y = 0.55;
  centro.scale.setScalar(1.05);
  raiz.add(centro);

  const defs = [
    ['Ropa', '#/ropa', camiseta],
    ['Recargas', '#/recargas', celular],
    ['Streaming', '#/streaming', tele],
    ['Rosas', '#/rosas', rosa],
    ['Acompañamiento estudiantil', '#/estudiantil', libro],
    ...(sorteo ? [['Sorteo mensual', '#/sorteo', regalo]] : []),
    ['Promociones', '#/promociones', etiqueta],
  ];
  const Rx = 3.5, Rz = 2.6, BASE = 0.92;
  const items = defs.map(([nombre, href, fn], i) => {
    const grupo = new THREE.Group();
    const modelo = fn();
    grupo.add(modelo);
    grupo.userData = { nombre, href, i, escala: BASE, objetivo: BASE };
    raiz.add(grupo);
    return grupo;
  });

  // ── Tamaño y cámara ──
  const v = new THREE.Vector3();
  function ajustar() {
    const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const medio = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = THREE.MathUtils.clamp((Rx + 1.55) / (medio * camera.aspect), 12, 24);
    camera.position.set(0, dist * 0.27, dist);
    camera.lookAt(0, -0.1, 0);
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(ajustar);
  ro.observe(stage);
  ajustar();

  // ── Interacción ──
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  let giro = 0, vel = 0, hover = -1;
  let drag = null;

  function elegir(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    let mejor = -1, dMin = Infinity;
    items.forEach((it, i) => {
      const hit = ray.intersectObject(it, true)[0];
      if (hit && hit.distance < dMin) { dMin = hit.distance; mejor = i; }
    });
    return mejor;
  }
  function ponerHover(i) {
    if (i === hover) return;
    hover = i;
    items.forEach((it, k) => { it.userData.objetivo = k === i ? BASE * 1.14 : BASE; });
    canvas.style.cursor = i >= 0 ? 'pointer' : 'grab';
    if (i < 0) tip.dataset.on = 'false';
    else tip.textContent = items[i].userData.nombre;
  }
  const onDown = (e) => {
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, last: e.clientX };
    try { canvas.setPointerCapture(e.pointerId); } catch { /* nada */ }
    canvas.style.cursor = 'grabbing';
  };
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ptr.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (drag && drag.id === e.pointerId) {
      const dx = e.clientX - drag.last;
      drag.last = e.clientX;
      drag.moved += Math.abs(dx);
      vel = dx * 0.006;
      giro += vel;
      if (hover >= 0) ponerHover(-1);
    } else if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
      ponerHover(elegir(e));
    }
  };
  const onUp = (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    const toque = drag.moved < 8 && performance.now() - drag.t < 600;
    drag = null;
    canvas.style.cursor = hover >= 0 ? 'pointer' : 'grab';
    if (toque) {
      const i = elegir(e);
      if (i >= 0) onGo(items[i].userData.href);
    }
  };
  const onLeave = () => { if (!drag) ponerHover(-1); };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', () => { drag = null; });
  canvas.addEventListener('pointerleave', onLeave);
  canvas.style.cursor = 'grab';

  // ── Bucle ──
  let raf = 0, visible = true, destruido = false, t0 = 0, anterior = 0, cuadros = 0, acum = 0, nivel = 0;
  function cuadro(ts) {
    raf = 0;
    if (destruido || !visible || document.hidden) return;
    const dt = Math.min(0.05, anterior ? (ts - anterior) / 1000 : 0.016);
    anterior = ts;
    if (!t0) t0 = ts;
    const t = (ts - t0) / 1000;

    // Giro: inercia al soltar, pausa al pasar el cursor por un objeto
    if (!drag) {
      const base = hover >= 0 ? 0 : 0.17;
      vel += (base * dt - vel) * Math.min(1, dt * 2.6);
      giro += vel;
    }
    ptr.sx += (ptr.x - ptr.sx) * 0.07;
    ptr.sy += (ptr.y - ptr.sy) * 0.07;
    raiz.rotation.y = ptr.sx * 0.1;
    raiz.rotation.x = ptr.sy * 0.05;

    const N = items.length;
    items.forEach((it, i) => {
      const a = (i / N) * TAU + giro;
      const x = Math.cos(a) * Rx, z = Math.sin(a) * Rz;
      const bob = Math.sin(t * 1.25 + i * 1.7) * 0.13;
      it.position.set(x, -0.75 - z * 0.2 + bob, z);
      it.rotation.y = Math.sin(t * 0.7 + i * 1.3) * 0.38 + (hover === i ? Math.sin(t * 3) * 0.12 : 0);
      it.rotation.x = Math.sin(t * 0.55 + i) * 0.05;
      it.userData.escala += (it.userData.objetivo - it.userData.escala) * Math.min(1, dt * 9);
      it.scale.setScalar(it.userData.escala);
    });
    centro.rotation.y = Math.sin(t * 0.55) * 0.55 + ptr.sx * 0.35;
    centro.rotation.x = Math.sin(t * 0.4) * 0.08 - ptr.sy * 0.15;
    centro.position.y = 0.55 + Math.sin(t * 1.0) * 0.1;
    sombra.scale.setScalar(1 + Math.sin(t * 1.0) * 0.03);

    if (hover >= 0) {
      v.setFromMatrixPosition(items[hover].matrixWorld).project(camera);
      const w = stage.clientWidth, h = stage.clientHeight;
      tip.style.left = ((v.x * 0.5 + 0.5) * w) + 'px';
      tip.style.top = ((-v.y * 0.5 + 0.5) * h) + 'px';
      tip.dataset.on = 'true';
    }

    renderer.render(scene, camera);

    if (cuadros === 1) stage.classList.add('is-3d');
    cuadros++;
    // Calidad adaptable: si va lento baja la resolución; si sigue lento, se apaga.
    if (cuadros > 24 && cuadros <= 24 + 70) acum += dt;
    if (cuadros === 24 + 70) {
      const prom = acum / 70;
      if (prom > 0.034 && nivel === 0) {
        nivel = 1; dpr = Math.max(1, dpr * 0.68); renderer.setPixelRatio(dpr); ajustar(); acum = 0; cuadros = 24;
      } else if (prom > 0.05) {
        fallar();
        return;
      }
    }
    raf = requestAnimationFrame(cuadro);
  }
  const arrancar = () => { if (!raf && !destruido && visible && !document.hidden) { anterior = 0; raf = requestAnimationFrame(cuadro); } };

  const io = new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) arrancar(); }, { threshold: 0.02 });
  io.observe(stage);
  const onVis = () => { if (!document.hidden) arrancar(); };
  document.addEventListener('visibilitychange', onVis);
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fallar(); });

  function fallar() {
    dispose();
    onFail?.();
  }
  function dispose() {
    if (destruido) return;
    destruido = true;
    cancelAnimationFrame(raf);
    io.disconnect(); ro.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointerleave', onLeave);
    scene.traverse((n) => {
      if (n.geometry) n.geometry.dispose();
      const ms = Array.isArray(n.material) ? n.material : n.material ? [n.material] : [];
      ms.forEach((m) => { m.map?.dispose?.(); m.dispose?.(); });
    });
    envTex.dispose(); pmrem.dispose();
    renderer.dispose();
    try { renderer.forceContextLoss(); } catch { /* nada */ }
    stage.classList.remove('is-3d');
    tip.dataset.on = 'false';
  }

  arrancar();
  return { dispose };
}
