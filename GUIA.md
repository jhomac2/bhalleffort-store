# Guía de BHALLEFFORT

Esta guía explica cómo manejar la tienda sin tocar código. Todo se hace desde el **panel**: `https://bhalleffort.com/admin/`

---

## 1. Crear tu token de GitHub (una sola vez)

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
- Activa la **verificación en dos pasos (2FA)** en GitHub y en el lugar donde compraste el dominio.

---

## 2. Subir el logo, la foto del local y la imagen para compartir

Panel → pestaña **Logo y fotos** → **Subir o reemplazar**.

| Imagen | Archivo que se crea | Medidas ideales | Notas |
|---|---|---|---|
| Logo | `img/logo.webp` | Cuadrado 1024 × 1024 | Mejor con fondo transparente (PNG). Se usa en cabecera, moneda 3D e ícono |
| Foto del local | `img/local.webp` | Horizontal 16:10 (1600 × 1000) | Fachada con luz de día. Aparece en "Nuestro local" |
| Imagen para compartir | `img/og.jpg` | 1200 × 630 | Ya hay una. Se ve al compartir el enlace por WhatsApp o redes |

El panel te deja **acercar, mover y girar** la foto con el dedo, y la convierte al tamaño y peso correctos. No necesitas editarla antes.

Hasta que subas el logo, la tienda muestra un monograma "B" azul. Hasta que subas la foto del local, esa sección muestra solo el mapa y el botón "Cómo llegar".

---

## 3. Subir un producto

Panel → pestaña **Productos** → **Nuevo producto**.

1. **Fotos**: elige la foto y ajusta el encuadre. Puedes subir varias (por ejemplo, frente y espalda).
2. **Categoría y subcategoría**: por ejemplo Ropa → Hombre.
3. **Nombre, descripción y precio**.
4. Según la categoría aparecen campos propios:
   - **Ropa**: tallas disponibles (el cliente elige una). No hay selector de color.
   - **Recargas**: operador o juego, montos (botón "Montos rápidos") y el dato que pedimos (número de celular, ID de jugador…).
   - **Rosas**: precio **por bonche**. El envío se acuerda por WhatsApp.
   - **Ecuabet**: marca "Solo mayores de 18 años".
5. **Promoción**: marca "En promoción" y escribe el **precio anterior** (el tachado). Aparece sola en Promociones. Opcional: fecha "hasta".
6. **Agotado** o **Visible en la tienda** (desmárcalo para ocultar sin borrar).
7. Pulsa **Guardar**.

Luego, abajo, pulsa **Publicar**. Todos los cambios se envían juntos y el sitio se actualiza en **1 o 2 minutos**. Si te equivocas antes de publicar, pulsa **Descartar**.

Para editar, ocultar o mostrar un producto usa los botones de su fila.

### Medidas de fotos

| Tipo | Formato | Medidas | Peso máximo |
|---|---|---|---|
| Ropa, calzado y rosas | Vertical 3:4 | 1200 × 1600 | 200 KB |
| Streaming y digital | Horizontal 16:9 | 1280 × 720 | 200 KB |

El panel ajusta el peso automáticamente. Para mejores resultados: fondo limpio, buena luz, sin marcas de agua de otras tiendas.

---

## 4. Ajustes del sitio

Panel → pestaña **Ajustes del sitio**.

- **Sorteo mensual**: actívalo o apágalo (si lo apagas, desaparece de todo el sitio), escribe el premio del mes, la fecha y agrega ganadores al historial.
- **Local**: dirección y referencia.
- **Datos legales**: nombre legal del titular, RUC (13 dígitos), ciudad y dirección legal. Aparecen en Términos, Privacidad y Reclamos. **Deben completarse antes de publicar el sitio.**

Pulsa **Guardar ajustes** y luego **Publicar**.

---

## 5. Cosas que se editan en `js/config.js`

Para cambios poco frecuentes, edita el archivo `js/config.js` directamente en GitHub (botón del lápiz):

- Horario de atención.
- WhatsApp, redes sociales y enlace de Google Maps.
- Costo de envío (`costo`) y envío gratis desde (`gratisDesde`).
- Titular del pago (Katherine Pineda) y correo oficial.
- Colores de la marca.

Edita solo lo que está entre comillas o los números. No borres comas ni llaves.

---

## 6. Cómo ocultar Ecuabet (si lo necesitas)

Panel → Productos → busca Ecuabet → **Ocultar** → **Publicar**. Desaparece de la tienda sin borrarse. Se recomienda revisar antes la normativa vigente sobre juegos de azar en línea en Ecuador.

---

## 7. Después de publicar el sitio

1. **Google Search Console**: verifica `bhalleffort.com` y envía `sitemap.xml`.
2. **Google Business Profile**: cambia el nombre de la ficha del local a BHALLEFFORT y revisa horario y fotos.
3. Revisa los datos legales (sección 4) y las bases del sorteo con un asesor.
4. Prueba un pedido completo desde tu celular.

---

## 8. Problemas frecuentes

- **No veo mi cambio**: espera 2 minutos y recarga con fuerza (en celular, cierra y abre el navegador).
- **El panel dice que el token no sirve**: venció o está mal copiado. Crea uno nuevo (sección 1).
- **Error al publicar**: revisa que el token tenga **Contents: Read and write** y que el repositorio sea `bhalleffort-store`.
- **Una foto se ve cortada**: edita el producto, elige **Cambiar** y usa **Mostrar completa**.
