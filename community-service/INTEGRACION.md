# AulaBreve Comunidad · Frontend

Panel responsive, sin dependencias de compilación. HTML, CSS y módulos JavaScript separados por responsabilidad.

## Llevarlo a tu servicio FastAPI

1. Extrae el ZIP dentro de `community-service`. Debe quedar una carpeta `frontend` junto a `app`, `tests` y `migrations`.
2. En `app/main.py`, añade estos imports junto a los existentes:

```python
from pathlib import Path
from fastapi.staticfiles import StaticFiles
```

3. Al final del archivo, después de registrar los routers, añade:

```python
FRONTEND_DIR = Path(__file__).resolve().parents[1] / "frontend"

app.mount(
    "/panel",
    StaticFiles(directory=str(FRONTEND_DIR), html=True),
    name="comunidad-panel",
)
```

4. Inicia el servicio como ya lo hacías:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

5. Abre **http://127.0.0.1:8000/panel/**. Mantén la barra final.

El panel empieza en demostración. Para consultar el servicio real, entra en **Conexión**, selecciona **Conectar mi API**, deja vacía la dirección y pulsa **Guardar y comprobar conexión**. El navegador usará el mismo origen de FastAPI y no necesitarás agregar CORS para esta instalación.

## Dos modos explícitos

- **Demostración:** datos ficticios en `localStorage`. Permite publicar, buscar y filtrar reseñas, ocultarlas con motivo, revisar auditorías, obtener insignias y probar que los reintentos no duplican puntos. Restablece los datos desde Conexión.
- **API:** envía solicitudes reales a los endpoints existentes. Un error de la API se muestra al usuario; nunca se reemplaza por datos ficticios de forma automática. La cabecera Authorization es opcional y solo se mantiene en la memoria de la pestaña.

La vista de estudiante/administrador organiza la interfaz. La autorización real corresponde al backend. No se envían identificadores de estudiante o administrador en las solicitudes de reseñas y moderación.

## Endpoints utilizados

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/health` | Estado de la API |
| GET | `/health/db` | Estado de PostgreSQL |
| GET | `/resenas?curso_id=1&limit=100&offset=0` | Reseñas visibles del curso |
| POST | `/resenas` | Crear con curso, calificación y comentario |
| PATCH | `/resenas/{id}/ocultar` | Ocultar enviando solo el motivo |
| GET | `/logros/me` | Insignias y puntos de la identidad autenticada |

Las rutas protegidas pueden responder **503** mientras autenticación y Catálogo sigan pendientes, igual que en tu backend actual. El frontend explica ese estado. La simulación de módulos se limita al modo demostración: no inventa un endpoint de Progreso.

El backend actual no tiene consulta de auditorías ni de reseñas ocultas. En modo API, el panel conserva las auditorías confirmadas durante la sesión. En demostración, el historial es local y completo.

## Organización

- `frontend/index.html`: estructura del panel.
- `frontend/assets/css/styles.css`: diseño responsive y estilos.
- `frontend/assets/js/app.js`: navegación, formularios y coordinación.
- `frontend/assets/js/api.js`: adaptador HTTP de FastAPI.
- `frontend/assets/js/domain.js`: reglas de la demostración.
- `frontend/assets/js/store.js`: persistencia local de datos ficticios.
- `frontend/assets/js/icons.js`: iconos e insignias SVG.
- `frontend/assets/js/ui.js`: componentes y formatos compartidos.
- `frontend/assets/js/views/`: resumen, reseñas, moderación, logros, actividad y conexión.

## Vista alojada

La vista privada alojada permite explorar la demostración. Para una API que solo corre en tu PC, utiliza la copia local descrita arriba: los navegadores pueden restringir solicitudes desde una página HTTPS a `localhost` HTTP.

Si después sirves el frontend desde un origen distinto, configura en el backend los orígenes CORS específicos de tu despliegue y el mecanismo de autenticación que defina el equipo.

## Comprobaciones del frontend

El paquete incluye 24 comprobaciones de reglas y generación de vistas. Si tienes Node.js, ejecútalas desde `community-service`:

```sh
node frontend/tests/check.mjs
```

En el proyecto fuente alojado, el comando equivalente es `node tests/check.mjs`.

Son independientes de las 21 pruebas de tu backend. La previsualización visual del entorno de construcción no estuvo disponible; estas comprobaciones no sustituyen una revisión visual en navegador.
