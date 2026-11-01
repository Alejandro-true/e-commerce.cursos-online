# Comunidad Service — AulaBreve

Microservicio desarrollado con Python, FastAPI, PostgreSQL,
SQLAlchemy y Alembic.

## Estado

Lógica interna implementada y validada mediante 21 pruebas:

- Creación y consulta de reseñas.
- Moderación con registro de administrador, motivo y fecha.
- Recompensas de una insignia y 10 puntos por módulo completado.
- Prevención de recompensas duplicadas por estudiante y módulo.
- Consulta de insignias y puntos del estudiante.

Las pruebas utilizan SQLite en memoria y simulaciones de las
dependencias externas.

Están pendientes las integraciones reales de autenticación,
Catálogo y recepción de eventos de Progreso. Actualmente, las
rutas que requieren identidad responden 503 mientras la
autenticación está pendiente.

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
| GET | `/resenas?curso_id=1` | Consultar reseñas visibles |
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

## Integraciones pendientes

- Autenticación: implementar `get_current_student_id` y
  `get_current_admin_id` con identidad verificada y validación
  del rol administrador.
- Catálogo: conectar `CatalogClient.has_active_access` con el
  contrato real de consulta de acceso vigente.
- Progreso: conectar la recepción de `ModuloCompletado` y
  adaptar sus datos a `ModuleCompletedData`.

El procesamiento interno de recompensas está implementado en
`app/services/reward_service.py`. Su integración con el
transporte de eventos se realizará al definir el contrato con
Progreso.