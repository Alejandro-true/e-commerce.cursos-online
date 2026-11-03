# Acceso adquirido y editor de contenido

Cambio preparado sobre `feature/desarrollo`, commit
`9459bed0f4172a295ebd1b794d1239fbc912162c`, conservando el panel administrativo
existente. El flujo de contenido toma como referencia el archivo `aula-admin.html`.

## Botón de solicitud de acceso

El frontend consulta `GET /api/cuenta/mis-cursos`, que utiliza la sesión de
Catálogo. El backend devuelve los derechos ACTIVO que siguen vigentes.

- Si el curso está adquirido, muestra «Ya tienes acceso a este curso».
- Si la consulta confirma que no hay acceso, permite solicitarlo.
- Durante la consulta o si falla, mantiene oculta la solicitud y permite reintentar.
- El progreso no se utiliza para decidir si un curso está comprado.
- Cambiar de cuenta o salir cancela la consulta anterior y borra el estado en memoria.

La comprobación se repite al abrir un curso y al confirmar la identidad. Las
validaciones de compra y autorización del backend se mantienen como autoridad.

## Editor del administrador

En Administración → Cursos, usa **Lecciones y video** en el curso elegido.
Se conservan el formulario de datos básicos, la lista de cursos y la pestaña Compras.

1. Crea una versión BORRADOR, por ejemplo `1.0`.
2. Agrega un módulo a esa versión.
3. Agrega una lección de tipo VIDEO, marcada como obligatoria. También puedes
   agregar lecciones de lectura y referencias a recursos PDF, ZIP o DOCX.
4. En la lección de video, usa **Subir MP4**. Se admiten hasta 200 MB.
5. Tras finalizar la carga, el editor vuelve a consultar el estado al servidor.
6. **Publicar versión** se habilita cuando se cumplen todos los requisitos.

El listado de requisitos refleja RN02/RN09: versión borrador, curso sin archivar,
precio y moneda, un módulo, una lección y un video LISTO en una lección obligatoria.
La petición de publicación sigue pasando por las validaciones de Catálogo.
Un video pendiente, fallido o solamente opcional no habilita publicar.

Las versiones publicadas se consultan sin controles de edición. Para cambiar su
temario se crea otra versión borrador. El archivo de cursos conserva su historial.
Los recursos documentales se registran por referencia; este cambio no añade un
almacenamiento de documentos. Los videos se cargan mediante el endpoint existente.

## Organización y despliegue

- `frontend-service/src/app/features/learning/`: estado de los accesos vigentes.
- `frontend-service/src/app/features/admin/content/`: editor, API, tipos y reglas.
- `frontend-service/src/app/testing/`: datos exclusivos de pruebas.

Las escrituras usan la sesión y el token CSRF; el backend conserva la exigencia
del rol ADMIN. Nginx admite peticiones multipart de 205 MB, según el límite de
petición ya configurado en Catálogo para archivos de hasta 200 MB.

Después de aplicar el cambio, con los demás servicios de Docker ya funcionando,
desde la raíz del proyecto:

```powershell
docker compose up -d --build --no-deps frontend-service
```

Abre `http://localhost:4200`, recarga con Ctrl + F5 e ingresa con la cuenta que
corresponda. El cambio no necesita migraciones ni reinicializar las bases de datos.

## Verificación

Desde `frontend-service`:

```powershell
npm run build
npm test -- --watch=false
```

Prueba manual con Docker: entra como alumno con una compra aprobada, abre el
curso y comprueba que no aparece Solicitar acceso. Como administrador, crea un
borrador y entra en Lecciones y video. Crea versión, módulo y lección de video;
comprueba que Publicar esté bloqueado hasta completar la carga del MP4. Publica y
verifica que el curso aparece en el catálogo y que esa versión queda inmutable.
