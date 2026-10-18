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
    atencion: 'Atención al instante', // frase que aparece en el inicio y en el botón flotante de WhatsApp
    heroTitulo: 'Todo lo encuentras', // título grande del inicio (primera parte)
    heroResalte: 'aquí.', // segunda parte del título, sale en azul
    heroBajada: 'Ropa, recargas, streaming, rosas y acompañamiento estudiantil en un solo lugar. Arma tu carrito y confirma por WhatsApp.', // texto bajo el título
    heroImagen: 'img/banners/inicio.webp', // imagen de la primera lámina del carrusel (1600 × 640 px)
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

  // ── Redes de cada sección ─────────────────────────────────────────
  // Pega aquí el enlace completo (empieza con https://) de la cuenta de cada sección.
  // - Si lo dejas vacío en Ropa, Recargas, Streaming o Rosas, se usa la cuenta principal de la tienda.
  // - En Acompañamiento estudiantil, lo que esté vacío se muestra como "Próximamente".
  secciones: {
    ropa: { tiktok: '', instagram: '', youtube: '', facebook: '' },
    recargas: { tiktok: '', instagram: '', youtube: '', facebook: '' },
    streaming: { tiktok: '', instagram: '', youtube: '', facebook: '' },
    rosas: { tiktok: '', instagram: '', youtube: '', facebook: '' },
    estudiantil: { tiktok: '', instagram: '', youtube: '', facebook: '' },
  },

  // ── Ecuabet (se muestra en Recargas · Ecuabet) ────────────────────
  ecuabet: {
    activo: true, // false = oculta el cuadro informativo de Ecuabet
    retiroDesde: 5, // USD
    recargaDesde: 1, // USD
    bono: '200 giros gratis en casino o $15 para pronóstico', // regalo al crear tu cuenta con nuestra ayuda
    nota: 'Promoción sujeta a condiciones. Confírmala por WhatsApp antes de crear tu cuenta.',
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
    titulo: 'Diseña conmigo',
    mensaje: 'Yo armo páginas web y tiendas online para negocios, como esta. Mira cómo trabajo en mi TikTok y conversemos de la tuya.',
  },

  // ── Carrusel del inicio ───────────────────────────────────────────
  // La primera lámina usa los textos de "marca" (heroTitulo, heroResalte, heroBajada).
  // Aquí van las demás: puedes cambiar textos, imagen (1600 × 640 px) y enlaces,
  // borrar una lámina completa o copiar una para crear otra. "color" cambia el tono
  // (blue, teal, violet, rose, green, coral o gold). "enlace" empieza con #/ (ej. #/ropa).
  carrusel: [
    { color: 'blue', imagen: 'img/banners/ropa.webp', etiqueta: 'Ropa', titulo: 'Estilo para toda la', resalte: 'familia', texto: 'Conjuntos, chompas, calzado y más para hombre, mujer y niños. Retira en el local o te lo enviamos.', boton: 'Ver ropa', enlace: '#/ropa' },
    { color: 'violet', imagen: 'img/banners/streaming.webp', etiqueta: 'Streaming', titulo: 'Tus cuentas,', resalte: 'al instante', texto: 'Netflix, Disney+, HBO Max, inteligencia artificial y programas. Te los entregamos por WhatsApp.', boton: 'Ver streaming', enlace: '#/streaming' },
    { color: 'coral', imagen: 'img/banners/promociones.webp', etiqueta: 'Promociones', titulo: 'Ofertas', resalte: 'del momento', texto: 'Productos con precio rebajado por tiempo limitado. Aprovecha antes de que terminen.', boton: 'Ver promociones', enlace: '#/promociones' },
    { color: 'blue', imagen: 'img/banners/vende.webp', etiqueta: 'Vende con nosotros', titulo: '¿Tienes algo para', resalte: 'vender?', texto: 'Publica tu producto en BHALLEFFORT y llega a más clientes. Contáctanos y te explicamos cómo.', boton: 'Quiero vender', enlace: '#/vende' },
  ],

  // ── Vende con nosotros ────────────────────────────────────────────
  // Sección para atraer a quienes quieren vender sus productos en la tienda.
  // Aparece en el inicio, en el menú superior, en el pie de página y en la página #/vende.
  vende: {
    activo: true, // false = oculta toda la sección "Vende con nosotros"
    titulo: '¿Quieres vender con nosotros?',
    resalte: 'Contáctanos.',
    texto: 'Si tienes ropa, accesorios, rosas, servicios o productos digitales, podemos publicarlos en BHALLEFFORT y ayudarte a llegar a más clientes.',
    puntos: ['Llegas a más clientes en Tabacundo y todo el país', 'Te ayudamos a publicar y a promocionar tu producto', 'Hablamos directo por WhatsApp, sin trámites largos'],
    mensajeWhatsApp: 'Hola, quiero vender mis productos con BHALLEFFORT.', // mensaje que se envía al tocar "Contáctanos"
  },

  // ── Colores de la marca (se aplican al cargar) ────────────────────
  paleta: {
    principal: '#1352D6', // azul de botones, enlaces y detalles
    oscuro: '#0B2A6B', // azul marino (barra superior, bloques oscuros)
    acento: '#F5A300', // ámbar del contador del carrito y avisos
  },

  provincias: [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas',
    'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo',
    'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas',
    'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe',
  ],
};
