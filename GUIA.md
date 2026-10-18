# Guía de BHALLEFFORT

Esta guía explica cómo manejar la tienda sin saber programar. Casi todo se hace desde el **panel**: `https://bhalleffort.com/admin/`

Hay una versión en PDF con imágenes y tablas (`Guia-BHALLEFFORT.pdf`).

## ¿Dónde cambio cada cosa?

| Quiero… | Dónde |
|---|---|
| Agregar, editar u ocultar un producto (y subir sus fotos) | Panel → **Productos** (sección 3) |
| Cambiar logo, foto del local o imagen para compartir | Panel → **Logo y fotos** (sección 4) |
| Cambiar el banner de una sección o la imagen del carrusel | Panel → **Logo y fotos** → Banners (sección 5) |
| Poner el **TikTok**, Instagram, YouTube o Facebook de una sección | Panel → **Ajustes del sitio** → Cuentas de cada sección (sección 6) |
| Cambiar el TikTok / Instagram / Facebook **principales** | Archivo `js/config.js` → `redes` (sección 6) |
| Cambiar textos del carrusel o de «Vende con nosotros» | Archivo `js/config.js` → `carrusel`, `vende` (sección 7) |
| Cambiar Ecuabet | Panel → Ajustes del sitio → Ecuabet (sección 8) |
| Cambiar título del inicio, nombre, eslogan, **colores** | Archivo `js/config.js` → `marca`, `paleta` (sección 9) |
| Sorteo, datos legales | Panel → Ajustes del sitio (sección 10) |

---

## 1. Entrar al panel (token de GitHub, una sola vez)

El panel publica cambios en GitHub usando un "token", que es una llave con permiso limitado. Es más seguro que usar tu contraseña.

1. Entra a **github.com** con tu cuenta (`jhomac2`).
2. Ve a **Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
3. Pulsa **Generate new token**.
4. Nombre: `Panel BHALLEFFORT`. Vencimiento: **90 días** (cuando venza, creas otro igual).
5. En **Repository access** elige **Only select repositories** y marca solo **bhalleffort-store**.
6. En **Permissions → Repository permissions** pon **Contents: Read and write**. No actives nada más.
7. Pulsa **Generate token** y **copia el token** (empieza con `github_pat_…`). GitHub solo lo muestra una vez.
8. Abre `/admin/`, pégalo y pulsa **Entrar**.

Reglas de seguridad:
- No compartas el token con nadie ni lo pegues en chats.
- Se guarda solo en tu navegador y solo se envía a `api.github.com`.
- En un celular o computador ajeno, desmarca **Recordarme en este dispositivo** y pulsa **Salir** al terminar.
- Si crees que alguien lo vio: en GitHub, bórralo (Settings → Developer settings) y crea otro.
- Activa la **verificación en dos pasos (2FA)** en GitHub y donde compraste el dominio.

---

## 2. Mapa de la tienda

| Sección | Nombre en la web | Dirección |
|---|---|---|
| Ropa | Ropa (Hombre, Mujer, Niños y Niñas, Varios) | `#/ropa` |
| Recargas | Recargas (Celulares, Videojuegos, Ecuabet +18) | `#/recargas` |
| Streaming | Streaming (IA, Programas y Licencias, Video y Entretenimiento) | `#/streaming` |
| Rosas | Rosas (por bonche) | `#/rosas` |
| Acompañamiento estudiantil | Acompañamiento estudiantil (EGB) | `#/estudiantil` |
| Promociones | Se llena sola con los productos "En promoción" | `#/promociones` |
| Sorteo | Sorteo mensual | `#/sorteo` |
| Vende con nosotros | ¿Quieres vender con nosotros? Contáctanos | `#/vende` |

Los enlaces viejos `#/digital` y `#/clases` siguen funcionando y te llevan a las nuevas direcciones.

---

## 3. Subir un producto (en cualquier sección)

Panel → pestaña **Productos** → **Nuevo producto**.

1. **Categoría y subcategoría**: por ejemplo Streaming → IA.
2. **Nombre, descripción y precio**.
3. **Fotos**: elige la foto y ajusta el encuadre con el dedo. El panel la recorta al formato de la sección y la comprime.
4. Campos propios de cada sección:
   - **Ropa**: tallas disponibles (el cliente elige una).
   - **Recargas**: operador o juego, color de la tarjeta, montos (botón "Montos rápidos") y el dato que pedimos (número de celular, ID de jugador, usuario).
   - **Streaming**: precio, o varias opciones con su precio (por ejemplo 1 mes, 3 meses). Si necesitas un dato del cliente (correo para entregar la cuenta), elígelo en "Dato que pedimos".
   - **Rosas**: precio **por bonche**. El envío se acuerda por WhatsApp.
   - **Acompañamiento estudiantil**: nombre del servicio, descripción y precio. El cliente consulta horarios y cupos por WhatsApp.
5. **Promoción**: marca "En promoción" y escribe el **precio anterior** (el tachado). Aparece sola en Promociones.
6. **Agotado** o **Visible en la tienda** (desmárcalo para ocultar sin borrar).
7. Pulsa **Guardar** y luego, abajo, **Publicar**. El sitio se actualiza en **1 o 2 minutos**.

### Medidas de fotos de producto

| Sección | Formato | Medidas |
|---|---|---|
| Ropa y Rosas | Vertical 3:4 | 1200 × 1600 |
| Streaming | Horizontal 16:9 | 1280 × 720 |
| Recargas y Acompañamiento estudiantil | Horizontal 16:10 | 1280 × 800 |

---

## 4. Logo, foto del local e imagen para compartir

Panel → pestaña **Logo y fotos** → **Subir o reemplazar**.

| Imagen | Archivo que se crea | Medidas |
|---|---|---|
| **Logo BHALLEFFORT** | `img/logo.webp` | Cuadrado 1024 × 1024, mejor con fondo transparente |
| Foto del local | `img/local.webp` | Horizontal 1600 × 1000 |
| Imagen para compartir | `img/og.jpg` | 1200 × 630 |

Hasta que subas el logo, la tienda muestra una "B" como monograma. Hasta que subas la foto del local, la sección "Nuestro local" muestra un collage con fotos de tus productos (`img/local-vitrina.webp`); al subir `img/local.webp`, tu foto la reemplaza. El mapa de esa sección se carga solo, con las coordenadas de `js/config.js` → `local.lat` y `local.lon`.

---

## 5. Banners de cada sección y del carrusel

Cada sección tiene un banner arriba y el inicio tiene un carrusel con varias láminas. Hoy **Inicio, Ropa, Streaming y Promociones** usan fotos de tus propios productos; Recargas, Rosas, Acompañamiento estudiantil, Sorteo y «Vende con nosotros» tienen imágenes **de ejemplo**. Reemplázalas con tus fotos reales cuando quieras.

Panel → **Logo y fotos** → bloque **Banners de cada sección** → **Subir o reemplazar**. El panel recorta a **1600 × 640** y usa este nombre de archivo:

| Dónde sale | Archivo |
|---|---|
| Inicio (primera lámina del carrusel) | `img/banners/inicio.webp` |
| Ropa (y lámina del carrusel) | `img/banners/ropa.webp` |
| Recargas | `img/banners/recargas.webp` |
| Streaming (y lámina del carrusel) | `img/banners/streaming.webp` |
| Rosas | `img/banners/rosas.webp` |
| Acompañamiento estudiantil | `img/banners/estudiantil.webp` |
| Promociones (y lámina del carrusel) | `img/banners/promociones.webp` |
| Sorteo mensual | `img/banners/sorteo.webp` |
| Vende con nosotros | `img/banners/vende.webp` |

Consejo: pon tus productos a la derecha y deja libre la parte izquierda de la imagen; ahí se escribe el título.

Si prefieres subirlos directo en GitHub: abre la carpeta `img/banners`, **Add file → Upload files** y sube el archivo **con el mismo nombre** (formato WebP o convierte a `.webp`).

---

## 6. Cuentas de TikTok, Instagram, YouTube y Facebook de cada sección

Panel → **Ajustes del sitio** → **Cuentas de cada sección**. Pega el enlace completo (empieza con `https://`) y pulsa **Guardar ajustes** → **Publicar**.

- **Ropa, Recargas, Streaming y Rosas**: si dejas un enlace vacío, se usa la cuenta principal de la tienda (`@bhalleffort3`).
- **Acompañamiento estudiantil**: muestra botones de **TikTok, YouTube e Instagram**. Lo que esté vacío aparece como **«Próximamente»**.
- Las cuentas principales de la tienda (pie de página, sorteo y botones «Síguenos») se cambian en `js/config.js` → `redes`:

```js
redes: {
  tiktok: 'https://www.tiktok.com/@bhalleffort3',
  instagram: 'https://www.instagram.com/bhalleffort3',
  facebook: 'https://www.facebook.com/share/…',
},
```

Cada botón lleva a tu cuenta: ahí publicas tus videos y la gente los ve en TikTok.

**Cómo copiar el enlace de una cuenta:** TikTok → tu perfil → **Compartir** → **Copiar enlace**. Instagram → perfil → **Compartir perfil** → **Copiar enlace**. YouTube y Facebook → abre tu canal o página y copia la dirección del navegador.

---

## 7. Carrusel del inicio y «Vende con nosotros»

Se editan en `js/config.js` (cómo abrirlo: sección 9). Cambia solo lo que está **entre comillas**.

**Carrusel.** La **primera lámina** usa los textos de `marca` (`heroTitulo`, `heroResalte`, `heroBajada`) y la imagen `marca.heroImagen`. Las demás están en `carrusel`: cada línea es una lámina. Puedes cambiar textos, imagen y enlace, **borrar una línea completa** o **copiarla** para crear otra.

```js
carrusel: [
  { color: 'blue', imagen: 'img/banners/ropa.webp', etiqueta: 'Ropa',
    titulo: 'Estilo para toda la', resalte: 'familia',
    texto: 'Conjuntos, chompas, calzado y más…',
    boton: 'Ver ropa', enlace: '#/ropa' },
],
```

`color` cambia el tono (blue, teal, violet, rose, green, coral o gold). `enlace` empieza con `#/` (por ejemplo `#/ropa`).

**Vende con nosotros.** Aparece en el inicio (banda azul), en la barra superior, en el menú, en el pie de página y en su propia página `#/vende`, con un formulario que abre WhatsApp. Las solicitudes llegan a tu WhatsApp.

```js
vende: {
  activo: true,                       // false = oculta toda la sección
  titulo: '¿Quieres vender con nosotros?',
  resalte: 'Contáctanos.',
  texto: 'Si tienes ropa, accesorios, rosas…',
  puntos: ['Llegas a más clientes…', '…', '…'],
  mensajeWhatsApp: 'Hola, quiero vender mis productos con BHALLEFFORT.',
},
```

La imagen de la página se cambia en `img/banners/vende.webp` (sección 5).

---

## 8. Ecuabet (+18)

Panel → **Ajustes del sitio** → **Ecuabet (+18)**:

- Mostrar el cuadro informativo (sí/no).
- **Recargas desde** (hoy $1) y **Retiros desde** (hoy $5).
- **Regalo al crear cuenta** (hoy: 200 giros gratis en casino o $15 para pronóstico).
- **Aviso de condiciones**.

Para ocultar la recarga de Ecuabet completa: Productos → busca Ecuabet → **Ocultar** → **Publicar**.

**Importante:** confirma que la promoción es real y que puedes ofrecerla, y revisa la normativa vigente sobre juegos de azar en línea en Ecuador. El sitio siempre indica "solo mayores de 18 años" y "juega con responsabilidad".

---

## 9. Cambiar nombres, frases y colores

Se editan en GitHub: abre el archivo → botón del **lápiz** → cambia solo el texto entre comillas → **Commit changes**.

| Qué quieres cambiar | Archivo | Dónde |
|---|---|---|
| Nombre de la tienda y eslogan | `js/config.js` | `marca.nombre`, `marca.eslogan` |
| Título grande del inicio ("Todo lo encuentras aquí.") | `js/config.js` | `marca.heroTitulo`, `marca.heroResalte`, `marca.heroBajada` |
| "Atención al instante" | `js/config.js` | `marca.atencion` |
| Banda "Diseña conmigo" (tu TikTok y mensaje) | `js/config.js` | `creditos.titulo`, `creditos.mensaje`, `creditos.tiktok` |
| Nombre de una sección (Streaming, Acompañamiento estudiantil…) | `js/schema.js` | en cada bloque: `nombre` y `bajada` |
| Nombre corto del menú ("Estudiantil") | `js/main.js` | `NOMBRE_CORTO` |
| Horario, WhatsApp, redes principales, envío, pago | `js/config.js` | bloques con esos nombres |
| Imagen de la primera lámina del carrusel | `js/config.js` | `marca.heroImagen` |
| **Colores** (azul de botones, azul marino, ámbar) | `js/config.js` | `paleta.principal`, `paleta.oscuro`, `paleta.acento` |

Cómo editar un archivo: abre `github.com/jhomac2/bhalleffort-store` → carpeta `js` → `config.js` → botón del **lápiz** → cambia solo lo que está entre comillas o los números (no borres comas, llaves ni corchetes) → **Commit changes**. El sitio se actualiza en 1 o 2 minutos. Si algo se rompe, abre el archivo → **History** → vuelve a la versión anterior (**Revert**).

---

## 10. Sorteo y datos legales

Panel → **Ajustes del sitio**.

- **Sorteo mensual**: actívalo o apágalo, escribe el premio del mes, la fecha y agrega ganadores al historial.
- **Local**: dirección y referencia.
- **Datos legales**: nombre legal del titular, RUC (13 dígitos), ciudad y dirección legal. **Deben completarse antes de publicar el sitio.**

---

## 11. Lo que debes confirmar tú

1. Nombre legal del titular y RUC (Términos, Privacidad, Aviso legal).
2. Dirección exacta del local y una **foto real de la fachada** (`img/local.webp`).
3. Autorización y bases del sorteo con un asesor.
4. Que la promoción de Ecuabet sea real y permitida.
5. Los enlaces de TikTok, YouTube e Instagram de cada sección.
6. Fotos reales para los banners de Recargas, Rosas, Estudiantil, Sorteo y «Vende con nosotros» (hoy son de ejemplo).

---

## 12. Después de publicar el sitio

1. **Google Search Console**: verifica `bhalleffort.com` y envía `sitemap.xml`.
2. **Google Business Profile**: cambia el nombre de la ficha a BHALLEFFORT y revisa horario y fotos.
3. Prueba un pedido completo desde tu celular.

---

## 13. Problemas frecuentes

- **No veo mi cambio**: espera 2 minutos y recarga con fuerza (en celular, cierra y abre el navegador).
- **El panel dice que el token no sirve**: venció o está mal copiado. Crea uno nuevo (sección 1).
- **Error al publicar**: revisa que el token tenga **Contents: Read and write** y que el repositorio sea `bhalleffort-store`.
- **Una foto se ve cortada**: edita el producto, elige **Cambiar** y ajusta el encuadre.

