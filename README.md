# Bodas de oro · Luis y Aurora

Invitación breve en HTML, CSS y JavaScript, con fondo crema y tipografía en dorado sobrio. Incluye portones animados, la foto actual y la de casamiento juntas en la portada, detalles de la celebración, tarjetas destacadas de regalos y asistencia, música opcional y confirmación por WhatsApp.

## Desplegar en Vercel

1. Abre [Vercel](https://vercel.com/new) e importa el repositorio `luis12312312/invitacionbdo`.
2. Conserva la raíz del proyecto en `./`. Si Vercel pregunta por un framework, selecciona **Other**.
3. Pulsa **Deploy**. `vercel.json` ya establece el comando `npm run build` y la carpeta de salida `build`.

No hay dependencias que instalar, base de datos ni claves de API. El despliegue solo necesita Node.js para copiar los archivos y ajustar los metadatos de la página.

El build utiliza `VERCEL_PROJECT_PRODUCTION_URL` para que la imagen de vista previa apunte al dominio de producción. Mantén habilitado el acceso a las variables de entorno del sistema de Vercel. Puedes definir `SITE_URL` con tu dominio completo si deseas reemplazar esa dirección. [Documentación de Vercel](https://vercel.com/docs/environment-variables/system-environment-variables#vercel_project_production_url).

## Editar los datos

Modifica `dist/config.js`:

- Nombres: Luis y Aurora.
- Fecha: sábado 6 de marzo; horario pendiente.
- Lugar: Aculeo; dirección pendiente.
- WhatsApp de confirmación: +56 9 7476 0287.
- CuentaRUT: 7860990.

Los textos y la estructura están en `dist/index.html`, los estilos en `dist/styles.css` y las interacciones en `dist/script.js`. Las tres fotografías originales se encuentran en `dist/assets/`.

La foto de casamiento de la portada se puede ampliar. Los accesos de regalos y asistencia llevan directamente a sus respectivas tarjetas; los datos bancarios se muestran al pulsar **Ver datos para el regalo**.

El botón de confirmación abre WhatsApp con un mensaje preparado; el invitado lo revisa y envía. La página no guarda confirmaciones automáticamente.

## Ver en tu computador

Puedes abrir `dist/index.html` directamente. Para probar exactamente la carpeta que se publicará:

```sh
npm run build
python -m http.server 8080 --directory build
```

Visita `http://localhost:8080`. La música comienza al pulsar **Abrir invitación**; las animaciones respetan la preferencia de movimiento reducido.

## Música

La grabación proporcionada es **The Godfather – Orchestral Suite · The Danish National Symphony Orchestra (Live)**. Se encuentra en `dist/assets/music/the-godfather-orchestral-suite.mp3`.

La página prepara los metadatos del archivo y la música comienza al pulsar **Abrir invitación** o **Saltar introducción**, al mismo tiempo que se abren los portones. El audio se inicia directamente dentro de ese clic para conservar la interacción que necesitan los navegadores móviles.

Se reproduce en bucle con un volumen de fondo del 28 %. El botón **Silenciar** lo pausa sin perder la posición y **Música** lo reanuda. También se pausa al ocultar la pestaña y continúa al regresar si el visitante tenía la música activada.

## Estructura

```text
dist/
  index.html
  styles.css
  script.js
  config.js
  assets/
    foto1.png
    foto2.png
    Casamiento.png
    favicon.svg
    music/
      the-godfather-orchestral-suite.mp3
scripts/
  build.mjs
package.json
vercel.json
```

`build/` se genera al desplegar y está excluida de Git. Los cambios futuros deben hacerse en `dist/` y subirse al repositorio.
