// ═══════════════════════════════════════════════════════════════════
//  BHALLEFFORT · CONFIGURACIÓN EDITABLE
//  Aquí cambias datos de la tienda sin tocar el resto del código.
//  Edita solo lo que está entre comillas o los números. No borres comas.
//  Lo marcado con "PENDIENTE" lo debe completar el dueño antes de publicar.
// ═══════════════════════════════════════════════════════════════════

export const CONFIG = {
  // ── Marca ─────────────────────────────────────────────────────────
  marca: {
    nombre: 'BHALLEFFORT',
    eslogan: 'Lo mejor al mejor precio',
    logo: 'img/logo.webp', // se sube con el panel /admin/ (ver GUIA.md). Si no existe, se usa un monograma.
    dominio: 'https://bhalleffort.com',
  },

  // ── Contacto y redes ──────────────────────────────────────────────
  whatsapp: '593963923399', // sin + ni espacios
  redes: {
    tiktok: 'https://www.tiktok.com/@bhalleffort3',
    instagram: 'https://www.instagram.com/bhalleffort3',
    facebook: 'https://www.facebook.com/share/19ebXpEdQa/',
  },

  // ── Local físico ──────────────────────────────────────────────────
  local: {
    nombre: 'BHALLEFFORT',
    direccion: 'La Y de Tabacundo, Pedro Moncayo, Pichincha', // CONFIRMAR: agrega calle exacta si quieres. Ejemplo: "Av. Principal y Calle 2, Ciudad"
    referencia: '', // opcional: "Frente a ...", "Junto a ..."
    lat: 0.0459604,
    lon: -78.201443,
    enlace: 'https://share.google/B1a4CIvKGOHao5C0b', // botón "Cómo llegar"
    foto: 'img/local.webp', // se sube con el panel /admin/
  },

  // ── Horario de atención [hora de apertura, hora de cierre] (formato 24 h) ──
  horario: {
    lunes: [8, 20],
    martes: [8, 20],
    miercoles: [8, 20],
    jueves: [8, 20],
    viernes: [8, 20],
    sabado: [8, 20],
    domingo: [8, 17],
  },
  zonaHoraria: 'America/Guayaquil',

  // ── Pagos oficiales (aviso antifraude) ────────────────────────────
  pago: {
    titular: 'Katherine Pineda',
    correo: 'agromhasvida5@gmail.com',
  },

  // ── Envíos ────────────────────────────────────────────────────────
  envio: {
    costo: 3.5, // productos físicos (ropa) cuando el pedido no llega al mínimo
    gratisDesde: 50, // envío gratis desde este total
    paisesRosas: ['Ecuador', 'Perú', 'Colombia'], // las rosas se acuerdan por WhatsApp
  },

  // ── Sorteo mensual ────────────────────────────────────────────────
  sorteo: {
    activo: true, // false = oculta el sorteo en todo el sitio (ver GUIA.md)
    minimo: 30, // compra mínima para participar (USD)
    numeroMaximo: 100, // se asigna un número del 1 al 100 por compra válida
    premioDelMes: '', // ejemplo: "Audífonos inalámbricos". Vacío = "se anuncia en nuestras redes"
    fechaDelSorteo: '', // ejemplo: "30 de octubre". Vacío = "se anuncia en nuestras redes"
    historial: [], // ejemplo: [{ mes: 'Octubre 2026', numero: 42, premio: 'Audífonos', enlace: 'https://...' }]
  },

  // ── Datos legales (se muestran en el Aviso Legal y en las políticas) ──
  legal: {
    titular: '', // PENDIENTE: nombre legal completo del titular del negocio
    ruc: '', // PENDIENTE: RUC (si tiene)
    correo: 'agromhasvida5@gmail.com', // correo para reclamos y solicitudes sobre datos personales
    direccion: '', // PENDIENTE: dirección del establecimiento
    ciudad: 'Tabacundo', // ciudad (se usa para la jurisdicción)
    actualizado: '18 de octubre de 2026',
  },

  // ── Créditos del diseño ───────────────────────────────────────────
  creditos: {
    nombre: 'Jhordy Cabascango',
    tiktok: 'https://www.tiktok.com/@mr_jhordy21',
  },

  // ── Paleta (se aplica como variables CSS al cargar) ───────────────
  paleta: {
    niebla: '#EEF3F8',
    tinta: '#0F2547',
    azul: '#1E6FB8',
    turquesa: '#18B6C2',
    dorado: '#E3A82B',
  },

  provincias: [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas',
    'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo',
    'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas',
    'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe',
  ],
};
