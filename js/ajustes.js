// Ajustes editables desde el panel /admin/ (se guardan en ajustes.json).
// Solo se aceptan estas claves; todo lo demás se configura en config.js.
import { CONFIG } from './config.js';

export const AJUSTES_PERMITIDOS = {
  sorteo: ['activo', 'premioDelMes', 'fechaDelSorteo', 'historial'],
  local: ['direccion', 'referencia'],
  legal: ['titular', 'ruc', 'direccion', 'ciudad', 'actualizado'],
  ecuabet: ['activo', 'retiroDesde', 'recargaDesde', 'bono', 'nota'],
};
export const SECCIONES = ['ropa', 'recargas', 'streaming', 'rosas', 'estudiantil'];
export const REDES_SECCION = ['tiktok', 'instagram', 'youtube', 'facebook'];

// Un enlace de red social debe ser https:// (o quedar vacío)
export const enlaceValido = (v) => v === '' || /^https:\/\/[^\s<>"']+$/i.test(v);

export function aplicarAjustes(data) {
  if (!data || typeof data !== 'object') return;
  for (const [sec, claves] of Object.entries(AJUSTES_PERMITIDOS)) {
    const src = data[sec];
    if (!src || typeof src !== 'object') continue;
    for (const k of claves) {
      if (!(k in src)) continue;
      const v = src[k];
      const actual = CONFIG[sec][k];
      if (Array.isArray(actual) ? Array.isArray(v) : typeof v === typeof actual) CONFIG[sec][k] = v;
    }
  }
  const redes = data.secciones;
  if (redes && typeof redes === 'object') {
    for (const s of SECCIONES) {
      for (const r of REDES_SECCION) {
        const v = redes[s]?.[r];
        if (typeof v === 'string' && enlaceValido(v.trim())) CONFIG.secciones[s][r] = v.trim();
      }
    }
  }
}

export async function cargarAjustes(url = 'ajustes.json') {
  try {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) return null;
    const data = await r.json();
    aplicarAjustes(data);
    return data;
  } catch {
    return null;
  }
}
