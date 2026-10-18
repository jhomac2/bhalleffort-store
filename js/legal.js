// Documentos legales de la tienda. Los datos del titular salen de js/config.js.
// Donde falta un dato aparece "PENDIENTE" resaltado: debe completarse antes de publicar.
import { esc } from './util.js';

export const LEGAL_ORDER = ['terminos', 'privacidad', 'cookies', 'envios', 'devoluciones', 'sorteo', 'aviso', 'reclamos', 'juego-responsable'];

const ident = (C, h) => `
  <table>
    <tr><th>Nombre comercial</th><td>${esc(C.marca.nombre)}</td></tr>
    <tr><th>Titular</th><td>${h.pend(C.legal.titular, 'nombre legal del titular')}</td></tr>
    <tr><th>RUC</th><td>${h.pend(C.legal.ruc, 'RUC')}</td></tr>
    <tr><th>Dirección</th><td>${C.legal.direccion ? esc(C.legal.direccion) : esc([C.local.direccion, C.local.referencia].filter(Boolean).join('. ')) || h.pend('', 'dirección del establecimiento')}</td></tr>
    <tr><th>WhatsApp</th><td>${h.waNumeroBonito()}</td></tr>
    <tr><th>Correo</th><td><a href="mailto:${esc(C.legal.correo)}">${esc(C.legal.correo)}</a></td></tr>
    <tr><th>Sitio web</th><td>${esc(C.marca.dominio.replace('https://', ''))}</td></tr>
  </table>`;

const horario = (C) => {
  const x = C.horario;
  return `Lunes a sábado de ${x.lunes[0]}:00 a ${x.lunes[1]}:00 y domingo de ${x.domingo[0]}:00 a ${x.domingo[1]}:00 (hora de Ecuador)`;
};

export const LEGAL = {
  // ═════════════════════════════════════════════════════════════════
  terminos: {
    corto: 'Términos y Condiciones',
    titulo: 'Términos y Condiciones',
    resumen: 'Condiciones de uso del sitio y de compra de productos y servicios de BHALLEFFORT.',
    html: (C, h) => `
      <p>Estos términos regulan el uso del sitio ${esc(C.marca.dominio.replace('https://', ''))} y las compras que realices a través de él. Al usar el sitio o enviar un pedido aceptas estas condiciones. Si no estás de acuerdo, no uses el sitio.</p>

      <h2>1. Quiénes somos</h2>
      ${ident(C, h)}

      <h2>2. Cómo funciona una compra</h2>
      <ul>
        <li>El sitio es un catálogo con carrito. <b>No procesa pagos</b>: al finalizar, tu pedido se envía por WhatsApp a nuestro número oficial.</li>
        <li>El pedido <b>no es definitivo</b> hasta que confirmemos disponibilidad, precio y forma de entrega contigo por WhatsApp.</li>
        <li>Nos reservamos el derecho de rechazar o cancelar un pedido por falta de stock, error evidente de precio o sospecha de fraude. Si ya pagaste, te devolvemos el dinero.</li>
      </ul>

      <h2>3. Precios</h2>
      <p>Los precios están en dólares de los Estados Unidos de América (USD) y, salvo que se indique lo contrario, son el valor final del producto. El costo de envío se muestra aparte, antes de enviar tu pedido. Podemos actualizar precios y promociones sin aviso previo; el precio aplicable es el confirmado por WhatsApp antes del pago. Una promoción termina cuando se agota el stock o vence su fecha.</p>

      <h2>4. Formas de pago</h2>
      <ul>
        <li>Transferencia bancaria, depósito y PayPhone. Los datos de pago los enviamos por WhatsApp al confirmar el pedido.</li>
        <li><b>El pago se hace únicamente a nombre de ${esc(C.pago.titular)}.</b> Si alguien te pide pagar a otro nombre o cuenta, no lo hagas y escríbenos a nuestro WhatsApp oficial o a ${esc(C.pago.correo)}.</li>
        <li>Nunca te pediremos contraseñas, códigos de verificación ni datos de tarjetas por el sitio.</li>
      </ul>

      <h2>5. Productos físicos (ropa, calzado y accesorios)</h2>
      <p>Las fotos son referenciales. El color puede variar levemente según tu pantalla. La IA solo se usa para mejorar el brillo de las fotos: el producto final no varía. Elige tu talla con cuidado; si tienes dudas, consúltanos antes de comprar.</p>

      <h2>6. Productos y servicios digitales</h2>
      <p>Recargas, cuentas de streaming, programas, licencias, plantillas y similares se entregan por WhatsApp, sin envío físico, una vez confirmado el pago. Eres responsable de dar datos correctos (número de teléfono, usuario o ID). Las marcas de terceros (Netflix, Spotify, Claro, Movistar, etc.) pertenecen a sus dueños y se mencionan solo para identificar el producto; BHALLEFFORT no está afiliada a ellas. El uso de cada plataforma se rige por sus propias condiciones. La garantía se explica en <a href="#/legal/devoluciones">Cambios, Devoluciones y Garantías</a>.</p>

      <h2>7. Rosas</h2>
      <p>Las rosas son productos perecederos. Se venden por bonche, sin envío gratis: el costo, la fecha y la forma de entrega a Ecuador, Perú o Colombia se acuerdan contigo por WhatsApp. Los trámites de importación del país de destino son responsabilidad del comprador. Más detalles en <a href="#/legal/envios">Envíos</a>.</p>

      <h2>8. Acompañamiento estudiantil</h2>
      <p>Servicio de apoyo escolar para Educación General Básica (EGB) a cargo de una Licenciada en Ciencias de la Educación Básica. Los horarios, cupos y condiciones se confirman por WhatsApp antes de iniciar. Para estudiantes menores de edad, el representante legal debe autorizar el servicio y el tratamiento de sus datos.</p>

      <h2>9. Recargas de Ecuabet</h2>
      <p>Servicio solo para <b>mayores de 18 años</b>. BHALLEFFORT no es una casa de apuestas ni organiza juegos: acreditamos saldo en la cuenta que tú indicas. No garantizamos resultados de ningún juego. Lee <a href="#/legal/juego-responsable">Juego Responsable</a>.</p>

      <h2>10. Sorteo mensual</h2>
      <p>La participación se rige por las <a href="#/legal/sorteo">Bases del Sorteo Mensual</a>.</p>

      <h2>11. Propiedad intelectual</h2>
      <p>El diseño y desarrollo del sitio es obra de Jhordy Cabascango. Los textos, logotipos y fotos propios de ${esc(C.marca.nombre)} no pueden copiarse ni usarse sin autorización.</p>

      <h2>12. Responsabilidad</h2>
      <p>Procuramos que la información del sitio sea correcta, pero puede haber errores o cambios. No respondemos por interrupciones del sitio, fallos de WhatsApp o de terceros, ni por hechos de fuerza mayor. Esto no limita los derechos que la ley reconoce al consumidor.</p>

      <h2>13. Datos personales</h2>
      <p>Tratamos tus datos según la <a href="#/legal/privacidad">Política de Privacidad</a> y la Ley Orgánica de Protección de Datos Personales.</p>

      <h2>14. Ley aplicable y reclamos</h2>
      <p>Estos términos se rigen por las leyes de la República del Ecuador. Para reclamos usa los canales de <a href="#/legal/reclamos">Reclamos y Atención</a>. Si la controversia continúa, podrás acudir a la Defensoría del Pueblo o a los jueces competentes de ${C.legal.ciudad ? esc(C.legal.ciudad) : h.pend('', 'ciudad')}, sin perjuicio de tus derechos como consumidor.</p>

      <h2>15. Cambios a estos términos</h2>
      <p>Podemos modificar estos términos. La versión vigente es la publicada aquí, con su fecha de actualización.</p>
    `,
  },

  // ═════════════════════════════════════════════════════════════════
  privacidad: {
    corto: 'Privacidad',
    titulo: 'Política de Privacidad',
    resumen: 'Cómo BHALLEFFORT trata tus datos personales conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador.',
    html: (C, h) => `
      <p>En ${esc(C.marca.nombre)} cuidamos tus datos. Esta política explica qué datos tratamos, para qué, con quién los compartimos, cuánto tiempo los conservamos y cómo ejerces tus derechos, conforme a la Ley Orgánica de Protección de Datos Personales (LOPDP) y su reglamento.</p>

      <h2>1. Responsable del tratamiento</h2>
      ${ident(C, h)}

      <h2>2. Qué datos tratamos</h2>
      <ul>
        <li><b>Datos de tu pedido:</b> nombre, provincia, ciudad y dirección de entrega (solo si compras productos físicos), país de destino (rosas) y número de WhatsApp desde el que nos escribes.</li>
        <li><b>Datos del servicio que compras:</b> por ejemplo el número a recargar, el usuario o ID de un juego, o el correo para entregar una cuenta digital.</li>
        <li><b>Conversaciones de WhatsApp</b> contigo para atender tu pedido o consulta.</li>
        <li><b>Datos de estudiantes</b> (acompañamiento estudiantil): nombre, grado y datos de contacto del representante. Solo con autorización del representante legal.</li>
        <li><b>Sorteo:</b> tu nombre y el número asignado.</li>
        <li>Este sitio <b>no usa analítica ni publicidad</b> y no te rastrea. Lo que escribes en el carrito se guarda solo en tu dispositivo hasta que tú envías el pedido por WhatsApp (ver <a href="#/legal/cookies">Cookies y almacenamiento local</a>).</li>
      </ul>

      <h2>3. Para qué los usamos</h2>
      <ul>
        <li>Confirmar, cobrar, entregar y dar seguimiento a tu pedido (ejecución de la compra).</li>
        <li>Atender consultas, cambios, garantías y reclamos.</li>
        <li>Cumplir obligaciones legales, tributarias y contables.</li>
        <li>Administrar el Sorteo Mensual si participas (con tu consentimiento al participar).</li>
        <li>Enviarte información comercial <b>solo si tú lo aceptas</b>; puedes retirar ese consentimiento cuando quieras.</li>
      </ul>

      <h2>4. Con quién los compartimos</h2>
      <ul>
        <li><b>Empresas de transporte (courier)</b>: nombre, teléfono y dirección, solo para entregar tu pedido.</li>
        <li><b>Plataformas y operadores</b> necesarios para prestar el servicio que compraste (por ejemplo, para acreditar una recarga o activar una cuenta).</li>
        <li><b>WhatsApp (Meta)</b>, donde ocurre la conversación del pedido.</li>
        <li><b>GitHub Pages</b>, donde está alojado el sitio; al visitarlo, el proveedor puede registrar tu dirección IP en sus servidores.</li>
        <li><b>Google Maps</b>, únicamente si tú pulsas "Cargar mapa".</li>
        <li><b>Autoridades</b>, cuando la ley lo exija.</li>
      </ul>
      <p>No vendemos tus datos. Algunos de estos proveedores están fuera de Ecuador, por lo que tus datos pueden tratarse en otros países bajo sus propias políticas.</p>

      <h2>5. Cuánto tiempo los conservamos</h2>
      <p>Solo el tiempo necesario para cumplir la finalidad y los plazos que exigen las normas tributarias, contables y de protección al consumidor. Después los eliminamos, bloqueamos o anonimizamos. Los datos de un sorteo se conservan hasta cerrar el sorteo y los posibles reclamos.</p>

      <h2>6. Tus derechos</h2>
      <p>Puedes pedirnos en cualquier momento: <b>acceso</b> a tus datos, <b>rectificación y actualización</b>, <b>eliminación</b>, <b>oposición</b>, <b>portabilidad</b>, <b>suspensión</b> del tratamiento, y no ser objeto de decisiones basadas únicamente en tratamientos automatizados. También puedes <b>retirar tu consentimiento</b> cuando se haya basado en él.</p>
      <p>Para ejercerlos escribe a <a href="mailto:${esc(C.legal.correo)}">${esc(C.legal.correo)}</a> o a nuestro WhatsApp ${h.waNumeroBonito()}, indicando tu nombre completo, número de cédula o pasaporte, el derecho que quieres ejercer y una descripción clara de tu solicitud. Te responderemos dentro de los plazos que establece la ley. Podemos pedirte una aclaración o que confirmes tu identidad.</p>

      <h2>7. Menores de edad</h2>
      <p>No tratamos datos de niñas, niños ni adolescentes sin autorización de su representante legal. Si eres menor de 18 años, pide a un adulto que haga la compra. Las recargas de Ecuabet y el sorteo son solo para mayores de edad.</p>

      <h2>8. Seguridad</h2>
      <p>Aplicamos medidas técnicas y organizativas razonables: sitio con HTTPS, no almacenamos datos de tarjetas ni claves, y limitamos el acceso a los pedidos al personal que los necesita. Si ocurre una vulneración que afecte tus derechos, la notificaremos como exige la ley.</p>

      <h2>9. Reclamos ante la autoridad</h2>
      <p>Si consideras que no atendimos bien tu solicitud, puedes reclamar ante la Superintendencia de Protección de Datos Personales del Ecuador.</p>

      <h2>10. Cambios</h2>
      <p>Si cambiamos esta política, publicaremos la nueva versión aquí con su fecha.</p>
    `,
  },

  // ═════════════════════════════════════════════════════════════════
  cookies: {
    corto: 'Cookies',
    titulo: 'Política de Cookies y Almacenamiento Local',
    resumen: 'Qué guarda este sitio en tu dispositivo: solo lo necesario. Sin analítica ni publicidad.',
    html: (C, h) => `
      <p>Este sitio <b>no usa cookies de analítica, publicidad ni seguimiento</b>. Solo guarda en tu navegador (almacenamiento local) lo necesario para que el carrito y tus preferencias funcionen. Nada de esto se envía a nuestros servidores.</p>

      <h2>Lo que guardamos en tu dispositivo</h2>
      <table>
        <tr><th>Nombre</th><th>Para qué sirve</th><th>Duración</th></tr>
        <tr><td><code>bh-cart-v2</code></td><td>Recuerda los productos de tu carrito.</td><td>Hasta que lo vacíes o borres los datos.</td></tr>
        <tr><td><code>bh-cliente</code></td><td>Recuerda tu nombre, provincia y dirección para no escribirlos otra vez.</td><td>Hasta que borres los datos.</td></tr>
        <tr><td><code>bh-cookies-ok</code></td><td>Recuerda que ya viste el aviso de cookies.</td><td>Hasta que borres los datos.</td></tr>
        <tr><td><code>bh-mapa-ok</code></td><td>Recuerda que aceptaste cargar el mapa de Google.</td><td>Hasta que borres los datos.</td></tr>
      </table>
      <p>Son necesarios para el funcionamiento del sitio, por eso no piden consentimiento previo.</p>

      <h2>Servicios de terceros (opcionales)</h2>
      <ul>
        <li><b>Google Maps</b>: <b>no se carga</b> hasta que pulsas "Cargar mapa". Al cargarlo, Google puede usar sus propias cookies según su <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">política de privacidad</a>.</li>
        <li><b>Redes sociales y WhatsApp</b>: solo son enlaces. No incrustamos sus botones ni píxeles; si los abres, se aplican sus políticas.</li>
        <li><b>Tipografías</b>: se sirven desde este mismo sitio, no desde Google.</li>
      </ul>

      <h2>Cómo borrar estos datos</h2>
      <p>Puedes borrar todo lo que este sitio guardó en este dispositivo con el botón de abajo, o desde la configuración de tu navegador (Chrome: Privacidad y seguridad → Borrar datos de navegación; Safari: Ajustes → Safari → Borrar historial y datos).</p>
      <p><button class="btn btn-ghost" data-clear-local>Borrar mis datos guardados</button></p>
      <div class="callout">Si más adelante agregamos herramientas de medición o publicidad, te pediremos tu consentimiento antes de activarlas y actualizaremos esta página.</div>
    `,
  },

  // ═════════════════════════════════════════════════════════════════
  envios: {
    corto: 'Envíos',
    titulo: 'Política de Envíos y Entregas',
    resumen: 'Costos, tiempos y cobertura de envíos de BHALLEFFORT: ropa a todo Ecuador, rosas a Ecuador, Perú y Colombia.',
    html: (C, h) => `
      <h2>Ropa, calzado y accesorios</h2>
      <ul>
        <li><b>Cobertura:</b> todo el Ecuador, mediante empresas de transporte (courier).</li>
        <li><b>Costo:</b> ${h.money(C.envio.costo)} de tarifa fija en pedidos menores a ${h.money(C.envio.gratisDesde)}, sin importar la ciudad. <b>Envío gratis</b> desde ${h.money(C.envio.gratisDesde)} de compra. El carrito lo calcula automáticamente.</li>
        <li><b>Tiempos estimados</b> (días hábiles, desde que confirmamos el envío):
          <ul>
            <li>Tabacundo y alrededores: el mismo día o el siguiente.</li>
            <li>Quito y ciudades principales: 1 a 3 días.</li>
            <li>Resto del país: 3 a 5 días.</li>
            <li>Zonas rurales o alejadas: 5 a 8 días.</li>
          </ul>
        </li>
        <li><b>Cómo se coordina:</b> confirmas tu pedido por WhatsApp, pagas a nombre de ${esc(C.pago.titular)}, te enviamos el número de guía del courier y puedes rastrear tu paquete.</li>
        <li>Los tiempos son estimados y pueden variar por feriados, clima o alta demanda. Te avisamos si hay retraso.</li>
      </ul>

      <h2>Productos digitales</h2>
      <p>Recargas, cuentas, licencias, programas y plantillas no tienen costo de envío. Se entregan por WhatsApp durante nuestro horario de atención, una vez confirmado el pago.</p>

      <h2>Rosas (Ecuador, Perú y Colombia)</h2>
      <ul>
        <li>Se venden por bonche. <b>No hay envío gratis</b>: el costo, la fecha y la forma de entrega se acuerdan contigo por WhatsApp antes de pagar.</li>
        <li>Contamos con certificado fitosanitario para la exportación de flores.</li>
        <li>Cada país tiene sus propios requisitos de importación (permisos, inspecciones, aranceles). <b>Verifica los de tu país</b>; los trámites y costos de importación en destino son responsabilidad del comprador.</li>
        <li>Son productos perecederos: revisa el paquete al recibirlo y, si hay daño, avísanos <b>el mismo día</b> con fotos.</li>
      </ul>

      <h2>Al recibir tu pedido</h2>
      <ul>
        <li>Revisa que el paquete esté en buen estado y que el contenido corresponda a lo pedido.</li>
        <li>Si la dirección o el teléfono eran incorrectos y el courier no puede entregar, coordinamos una nueva entrega; el costo adicional lo asume quien dio el dato errado.</li>
      </ul>
      <p>¿Dudas? Escríbenos por WhatsApp al ${h.waNumeroBonito()}. Atendemos ${horario(C)}.</p>
    `,
  },

  // ═════════════════════════════════════════════════════════════════
  devoluciones: {
    corto: 'Cambios y garantías',
    titulo: 'Cambios, Devoluciones y Garantías',
    resumen: 'Cómo pedir un cambio, una devolución o una garantía en BHALLEFFORT, conforme a la Ley Orgánica de Defensa del Consumidor.',
    html: (C, h) => `
      <h2>Productos físicos (ropa, calzado, accesorios)</h2>
      <ul>
        <li>Tienes <b>15 días</b> desde que recibes el producto para pedir un cambio o la devolución, según el Art. 45 de la Ley Orgánica de Defensa del Consumidor.</li>
        <li>El producto debe estar en el mismo estado en que lo recibiste: sin uso, sin alteraciones y con sus etiquetas.</li>
        <li>Si pides la devolución, te <b>devolvemos el dinero</b>; no te imponemos una nota de crédito.</li>
        <li>Si el producto llegó <b>dañado, defectuoso o no corresponde</b> a lo que pediste (modelo o talla), avísanos lo antes posible, idealmente dentro de las 48 horas, con fotos claras. Así lo resolvemos con prioridad. Si el error es nuestro, asumimos el costo del envío.</li>
        <li>Los productos usados se venden en el estado indicado en su descripción. Si el estado no corresponde a lo descrito, procede el cambio.</li>
        <li>En los demás casos, el costo del envío de la devolución se acuerda por WhatsApp.</li>
      </ul>

      <h2>Productos y servicios digitales</h2>
      <ul>
        <li>Una <b>recarga ya acreditada</b>, un <b>código o cuenta ya entregado y activado</b>, o un <b>programa ya entregado</b> no se devuelven, porque el servicio ya fue prestado.</li>
        <li><b>Garantía:</b> si el producto falla (la recarga no se acredita, la cuenta no funciona o no coincide con lo ofrecido), lo <b>reponemos o te devolvemos el dinero</b>. Avísanos por WhatsApp apenas notes el problema y durante el período contratado.</li>
        <li>La garantía no cubre el mal uso, cambios de contraseña hechos por ti en cuentas compartidas ni datos incorrectos que nos hayas dado.</li>
        <li>Las plataformas pueden cambiar sus condiciones; en ese caso buscaremos una solución equivalente.</li>
      </ul>

      <h2>Rosas</h2>
      <p>Son perecederas. Si llegan dañadas, avísanos <b>el mismo día</b> de la recepción con fotos. Evaluamos el caso y reponemos o reembolsamos de forma total o parcial según el daño comprobado.</p>

      <h2>Acompañamiento estudiantil</h2>
      <p>Las condiciones para cambiar un horario o cancelar se acuerdan al reservar el cupo. Si no recibes el servicio acordado, te devolvemos lo que corresponda.</p>

      <h2>Cómo hacer una solicitud</h2>
      <ol style="padding-left:22px;display:grid;gap:6px;margin-top:10px">
        <li>Toma fotos claras del producto o captura del problema.</li>
        <li>Escríbenos por WhatsApp al ${h.waNumeroBonito()} o a <a href="mailto:${esc(C.legal.correo)}">${esc(C.legal.correo)}</a> con tu nombre y el detalle del pedido.</li>
        <li>Procuramos responder en menos de 24 horas.</li>
        <li>Coordinamos el cambio, la reposición o el reembolso.</li>
      </ol>
      <div class="callout">Estas condiciones no limitan los derechos que la ley te reconoce como consumidor.</div>
    `,
  },

  // ═════════════════════════════════════════════════════════════════
  sorteo: {
    corto: 'Bases del sorteo',
    titulo: 'Bases del Sorteo Mensual',
    resumen: 'Condiciones para participar en el sorteo mensual de BHALLEFFORT: compra desde $30, un número del 1 al 100 por compra.',
    html: (C, h) => `
      <p>Estas bases regulan el Sorteo Mensual de ${esc(C.marca.nombre)}. Al participar aceptas estas condiciones.</p>

      <h2>1. Organizador</h2>
      ${ident(C, h)}

      <h2>2. Qué es</h2>
      <p>Es una promoción para nuestros clientes. <b>No se venden números ni boletos</b>: la participación se otorga por compras ya realizadas.</p>

      <h2>3. Quiénes participan</h2>
      <ul>
        <li>Personas <b>mayores de 18 años</b> con compra confirmada y pagada de <b>${h.money(C.sorteo.minimo)} o más</b> en productos (sin contar el envío).</li>
        <li>Cada compra válida equivale a <b>un número del 1 al ${C.sorteo.numeroMaximo}</b>.</li>
        <li>Los números se reinician cada mes. Si se asignan los ${C.sorteo.numeroMaximo}, se cierra la participación de ese mes y se avisa en redes.</li>
      </ul>

      <h2>4. Cómo recibes tu número</h2>
      <p>Al confirmar tu compra te enviamos tu número por WhatsApp. Guarda ese mensaje: es tu comprobante de participación.</p>

      <h2>5. Premio y fecha</h2>
      <p>${C.sorteo.premioDelMes || C.sorteo.fechaDelSorteo
        ? `${C.sorteo.premioDelMes ? 'Premio de este mes: ' + esc(C.sorteo.premioDelMes) + '. ' : ''}${C.sorteo.fechaDelSorteo ? 'Fecha del sorteo: ' + esc(C.sorteo.fechaDelSorteo) + '.' : ''}`
        : 'El premio y la fecha del sorteo se anuncian cada mes en nuestras redes sociales, antes del sorteo.'}</p>

      <h2>6. El sorteo</h2>
      <p>Se realiza al azar entre los números asignados del mes y se puede seguir en nuestras redes sociales (<a href="${esc(C.redes.tiktok)}" target="_blank" rel="noopener">TikTok</a>, <a href="${esc(C.redes.instagram)}" target="_blank" rel="noopener">Instagram</a> y <a href="${esc(C.redes.facebook)}" target="_blank" rel="noopener">Facebook</a>). El número ganador se publica ahí.</p>

      <h2>7. El ganador</h2>
      <ul>
        <li>Lo contactamos por WhatsApp al número con el que hizo la compra.</li>
        <li>Debe responder y reclamar su premio dentro de <b>15 días</b> desde el aviso. Si no lo hace, se repite el sorteo entre los demás números.</li>
        <li>El premio se entrega junto con su siguiente pedido o por envío directo. No es canjeable por dinero.</li>
        <li>Con su autorización, publicaremos su nombre o inicial y el número ganador.</li>
      </ul>

      <h2>8. Datos personales</h2>
      <p>Usamos tus datos solo para administrar el sorteo, según la <a href="#/legal/privacidad">Política de Privacidad</a>.</p>

      <h2>9. Cambios, suspensión y autoridad</h2>
      <ul>
        <li>Podemos modificar estas bases con aviso previo en redes, sin afectar los números ya asignados.</li>
        <li>Podemos suspender el sorteo por fuerza mayor o si una autoridad competente lo exige, hasta contar con la autorización correspondiente.</li>
        <li>Quedan excluidas las compras anuladas, devueltas o no pagadas.</li>
      </ul>

      <h2>10. Reclamos</h2>
      <p>Escríbenos por WhatsApp al ${h.waNumeroBonito()} o a ${esc(C.legal.correo)}.</p>
    `,
  },

  // ═════════════════════════════════════════════════════════════════
  aviso: {
    corto: 'Aviso legal',
    titulo: 'Aviso Legal',
    resumen: 'Identificación del proveedor y datos de contacto de BHALLEFFORT.',
    html: (C, h) => `
      <p>En cumplimiento de la normativa ecuatoriana de comercio electrónico y de defensa del consumidor, estos son los datos del proveedor de este sitio.</p>
      ${ident(C, h)}
      <h2>Horario de atención</h2>
      <p>${horario(C)}.</p>
      <h2>Local</h2>
      <p>${esc([C.local.direccion, C.local.referencia].filter(Boolean).join('. ')) || h.pend('', 'dirección del local')}</p>
      <p><a href="${esc(C.local.enlace)}" target="_blank" rel="noopener">Cómo llegar</a></p>
      <h2>Canales oficiales</h2>
      <ul>
        <li>WhatsApp: ${h.waNumeroBonito()}</li>
        <li>TikTok: <a href="${esc(C.redes.tiktok)}" target="_blank" rel="noopener">@bhalleffort3</a></li>
        <li>Instagram: <a href="${esc(C.redes.instagram)}" target="_blank" rel="noopener">@bhalleffort3</a></li>
        <li>Facebook: <a href="${esc(C.redes.facebook)}" target="_blank" rel="noopener">BHALLEFFORT</a></li>
        <li>Correo: ${esc(C.pago.correo)}</li>
      </ul>
      <div class="callout"><b>Pago oficial.</b> Los pagos se reciben únicamente a nombre de <b>${esc(C.pago.titular)}</b>. Si te piden pagar a otro nombre o cuenta, no lo hagas y verifica con nosotros por los canales de arriba.</div>
      <h2>Diseño del sitio</h2>
      <p>Diseñado por <a href="${esc(C.creditos.tiktok)}" target="_blank" rel="noopener">${esc(C.creditos.nombre)}</a>.</p>
    `,
  },

  // ═════════════════════════════════════════════════════════════════
  reclamos: {
    corto: 'Reclamos',
    titulo: 'Reclamos y Atención al Cliente',
    resumen: 'Cómo presentar un reclamo o una solicitud sobre tus datos en BHALLEFFORT y a qué autoridades acudir.',
    html: (C, h) => `
      <h2>Escríbenos primero</h2>
      <p>Queremos resolver tu caso rápido. Envía tu reclamo por:</p>
      <ul>
        <li>WhatsApp: ${h.waNumeroBonito()} (${horario(C)}).</li>
        <li>Correo: <a href="mailto:${esc(C.legal.correo)}">${esc(C.legal.correo)}</a>.</li>
        <li>En persona, en nuestro local.</li>
      </ul>
      <p>Incluye tu nombre, el producto o servicio, la fecha de compra, qué pasó y lo que esperas como solución, con fotos o capturas si las tienes. Procuramos responder en menos de 24 horas y damos una solución dentro de los plazos que fija la ley.</p>

      <h2>Si no quedas conforme</h2>
      <ul>
        <li><b>Consumidor:</b> puedes presentar tu reclamo ante la Defensoría del Pueblo del Ecuador.</li>
        <li><b>Datos personales:</b> puedes reclamar ante la Superintendencia de Protección de Datos Personales.</li>
      </ul>

      <h2>Alertas de fraude</h2>
      <p>Solo cobramos a nombre de <b>${esc(C.pago.titular)}</b> y atendemos por los canales oficiales. Si alguien dice ser de ${esc(C.marca.nombre)} y te pide otra cuenta, un código o una clave, no pagues y avísanos.</p>
    `,
  },

  // ═════════════════════════════════════════════════════════════════
  'juego-responsable': {
    corto: 'Juego responsable',
    titulo: 'Juego Responsable (solo mayores de 18)',
    resumen: 'Información sobre las recargas de Ecuabet: solo mayores de 18 años y juego responsable.',
    html: (C, h) => `
      <p>Las recargas de Ecuabet son un servicio <b>solo para mayores de 18 años</b>. ${esc(C.marca.nombre)} no es una casa de apuestas, no organiza juegos ni garantiza resultados: acreditamos saldo en la cuenta que tú nos indicas.</p>
      <h2>Juega con responsabilidad</h2>
      <ul>
        <li>Apostar no es una forma de ganar dinero ni de resolver deudas. Puedes perder lo que apuestas.</li>
        <li>Fija un monto máximo que puedas perder sin afectar tus gastos y respétalo.</li>
        <li>No uses dinero destinado a alimentación, salud, educación o deudas.</li>
        <li>Nunca recargues para recuperar lo perdido.</li>
        <li>Si eres menor de edad, no puedes usar este servicio.</li>
      </ul>
      <h2>Señales de alerta</h2>
      <p>Pensar en apostar todo el tiempo, apostar más de lo planeado, mentir sobre cuánto juegas, pedir prestado para jugar o sentir ansiedad cuando no juegas. Si te pasa algo de esto, busca ayuda de un profesional de salud mental o acude a un centro de salud. En una emergencia llama al <b>ECU 911</b>.</p>
      <p>Si prefieres dejar de recibir este servicio, escríbenos y no te volveremos a ofrecer recargas de este tipo.</p>
    `,
  },
};
