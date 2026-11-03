# Comunidad Service — AulaBreve

Microservicio desarrollado con Python, FastAPI, PostgreSQL,
SQLAlchemy y Alembic.

## Responsabilidad

Community Service es únicamente un backend HTTP. No incluye ni sirve archivos de interfaz; la interfaz única del sistema está en `frontend-service` (Angular).

Incluye:

- Creación y consulta de reseñas.
- Moderación con registro de administrador, motivo y fecha.
- Recompensas de una insignia y 10 puntos por módulo completado.
- Prevención de recompensas duplicadas por estudiante y módulo.
- Consulta de insignias y puntos del estudiante.

Community consulta el acceso del estudiante en Catalog mediante `X-Service-Key`. También consume el evento `ModuloCompletado` desde RabbitMQ y registra puntos e insignias de forma idempotente.

## Requisitos

- Python 3.11.
- PostgreSQL 17.
- Base de datos `comunidad_db`, propiedad de `comunidad_user`.

Para una instalación nueva, crear el usuario y la base desde
SQL Shell (psql), conectado como administrador de PostgreSQL:

```text
CREATE USER comunidad_user;
\password comunidad_user
CREATE DATABASE comunidad_db OWNER comunidad_user;
```

## Instalación en Windows

Ejecutar desde la carpeta `community-service`:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Crear el archivo de configuración si todavía no existe:

```powershell
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
}
```

Completar `DB_PASSWORD` en `.env` con la contraseña del usuario
`comunidad_user` y ajustar los datos de conexión.

## Migraciones

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m alembic current
```

## Ejecutar en desarrollo

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Documentación interactiva:
[Swagger UI](http://127.0.0.1:8000/docs).

## Pruebas

```powershell
.\.venv\Scripts\python.exe -m pytest tests -q
```

Resultado de referencia: `21 passed`.

## Endpoints

| Método | Ruta | Función |
|---|---|---|
| GET | `/health` | Estado de la API |
| GET | `/health/db` | Comprobar conexión a PostgreSQL |
| GET | `/resenas?curso_id=<uuid>` | Consultar reseñas visibles |
| POST | `/resenas` | Crear una reseña |
| PATCH | `/resenas/{resena_id}/ocultar` | Ocultar y registrar moderación |
| GET | `/logros/me` | Consultar logros del estudiante autenticado |

La creación de reseñas requiere identidad validada y acceso
vigente confirmado por Catálogo. La moderación requiere rol
administrador.

## Organización

| Carpeta | Responsabilidad |
|---|---|
| `app/core` | Configuración, seguridad y excepciones |
| `app/clients` | Adaptadores de servicios externos |
| `app/database` | Conexión, sesiones y base de modelos |
| `app/models` | Tablas de la base de datos |
| `app/schemas` | Validación de solicitudes y respuestas |
| `app/services` | Lógica de negocio |
| `app/routers` | Endpoints HTTP |
| `migrations` | Migraciones de Alembic |
| `tests` | Pruebas automatizadas |

## Comunicación entre servicios

- **Catalog:** valida el acceso antes de publicar una reseña mediante `GET /api/internal/progreso/cursos/{cursoId}/acceso/{estudianteId}`.
- **Progress:** publica `ModuloCompletado` en RabbitMQ; Community lo consume desde la cola `community.modulo-completado`.
- **Frontend:** Angular consume esta API en `http://localhost:8000`; Community no tiene rutas `/panel` ni recursos estáticos.

En `AUTH_MODE=development`, las rutas protegidas aceptan `X-Student-Id` y `X-Admin-Id` para desarrollo local. No uses este modo en producción; allí se debe conectar el proveedor de identidad del sistema.
