// Ajustes editables desde el panel /admin/ (se guardan en ajustes.json).
// Solo se aceptan estas claves; todo lo demás se configura en config.js.
import { CONFIG } from './config.js';

export const AJUSTES_PERMITIDOS = {
  sorteo: ['activo', 'premioDelMes', 'fechaDelSorteo', 'historial'],
  local: ['direccion', 'referencia'],
  legal: ['titular', 'ruc', 'direccion', 'ciudad', 'actualizado'],
};

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
