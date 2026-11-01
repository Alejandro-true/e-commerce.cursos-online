# Servicio de Progreso de Aprendizaje
### Comercio Electrónico de Micro-Aprendizaje (Cursos Online)

Microservicio desarrollado en **NestJS** y **MongoDB** (con base de datos `progresoDB`) encargado de registrar qué lecciones ha completado cada usuario, calcular porcentajes de avance y marcar clases como vistas.

---

## 🎯 Funcionalidades Principales

1. **Registro de Lecciones Vistas / Completadas**: Registra cuando un estudiante finaliza o visualiza una lección.
2. **Cálculo Automático de Porcentaje de Avance**: Calcula el porcentaje de progreso (`0%` a `100%`) en tiempo real según el número de lecciones completadas vs. total de lecciones.
3. **Control de Estados y Certificación**: Transiciona automáticamente entre estados:
   - `NO_INICIADO`: Ninguna clase completada (0%).
   - `EN_PROGRESO`: Progreso parcial (1% - 99%).
   - `COMPLETADO`: 100% completado, activando `certificadoElegible: true`.
4. **Reproducción y Posicionamiento de Video (Micro-Aprendizaje)**: Registra la posición en segundos (`segundoActual`) donde el usuario pausó el video para reanudarlo y auto-completa lecciones al superar el 90% del contenido.
5. **Panel del Estudiante**: Proporciona el resumen consolidado de todos los cursos inscritos, completados y en progreso con el promedio de avance global.
6. **Métricas de Curso**: Estadísticas de matriculados, estudiantes que finalizaron y tasa de finalización global.

---

## 🛠️ Tecnologías

- **Framework**: [NestJS](https://nestjs.com/) v12 (Node.js & TypeScript)
- **Base de Datos NoSQL**: [MongoDB](https://www.mongodb.com/) con [Mongoose](https://mongoosejs.com/)
- **Nombre de Base de Datos**: `progresoDB`
- **Documentación Interactiva**: Swagger / OpenAPI en `/api/docs`
- **Validación de Datos**: `class-validator` y `class-transformer`
- **Pruebas Unitarias**: Jest

---

## ⚙️ Configuración y Variables de Entorno

Archivo `.env` en la raíz de `progress-service` (puedes partir de `.env.example`):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/progresoDB
NODE_ENV=development
```

---

## 🚀 Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Modo desarrollo con recarga automática
npm run dev
# o también: npm run start:dev

# 3. Compilar para producción
npm run build

# 4. Iniciar en producción
npm run start:prod
```

---

## 🧪 Pruebas Unitarias y Calidad

```bash
# Ejecutar pruebas unitarias
npm test

# Ejecutar linter
npm run lint
```

---

## 💻 Vista del Usuario (Frontend)

El frontend está conectado directamente con el backend y puede ser visitado en:

👉 **[http://localhost:3000/vista](http://localhost:3000/vista)** (o directamente en **[http://localhost:3000/](http://localhost:3000/)**)

---

## 📖 Documentación Swagger

Una vez iniciado el servidor, accede a la interfaz Swagger interactiva:

👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

---

## 📡 Referencia de Endpoints API (en Español)

### 1. Inicializar Progreso de Curso
- **POST** `/progreso/inicializar`
- **Body**:
```json
{
  "idUsuario": "usuario-123",
  "idCurso": "curso-nestjs-01",
  "totalLecciones": 10,
  "leccionesIds": ["leccion-1", "leccion-2", "leccion-3"]
}
```

### 2. Marcar Lección como Completada / Vista
- **POST** `/progreso/completar-leccion`
- **Body**:
```json
{
  "idUsuario": "usuario-123",
  "idCurso": "curso-nestjs-01",
  "idLeccion": "leccion-1",
  "tituloLeccion": "Introducción y Arquitectura",
  "totalLecciones": 10,
  "duracionSegundos": 360
}
```

### 3. Registrar Posición de Video (Bookmarking / Auto-Completado)
- **POST** `/progreso/guardar-posicion`
- **Body**:
```json
{
  "idUsuario": "usuario-123",
  "idCurso": "curso-nestjs-01",
  "idLeccion": "leccion-2",
  "segundoActual": 330,
  "duracionSegundos": 360,
  "autoCompletar": true
}
```

### 4. Desmarcar Lección
- **POST** `/progreso/desmarcar-leccion`
- **Body**:
```json
{
  "idUsuario": "usuario-123",
  "idCurso": "curso-nestjs-01",
  "idLeccion": "leccion-1"
}
```

### 5. Consultar Progreso de un Usuario en un Curso Específico
- **GET** `/progreso/:idUsuario/:idCurso`

### 6. Consultar Todos los Cursos y Resumen de un Estudiante
- **GET** `/progreso/usuario/:idUsuario`

### 7. Métricas y Analíticas de un Curso
- **GET** `/progreso/curso/:idCurso/metricas`

### 8. Reiniciar Progreso de un Curso
- **PUT** `/progreso/:idUsuario/:idCurso/reiniciar`

### 9. Eliminar Registro de Progreso
- **DELETE** `/progreso/:idUsuario/:idCurso`


## Integracion con Catalogo y Comunidad

La API exige un JWT OIDC firmado (JWKS, issuer y audience configurables). Copia `.env.example` a `.env` y configura `AUTH_JWKS_URL`, `AUTH_ISSUER`, `AUTH_AUDIENCE`, `CATALOGO_SERVICE_URL` y los dos paths del contrato. Cada operacion de completar leccion valida el acceso activo y consulta la version publicada en CatalogService.

Al completar un modulo se persiste el avance y el evento `ModuloCompletado` dentro del mismo documento Mongo. Un publicador en segundo plano reintenta con backoff, declara la cola durable `community.modulo-completado` y la enlaza al exchange `aulabreve.domain.events` con la routing key `ModuloCompletado`. Asi CommunityService puede estar temporalmente apagado sin perder el evento.

Los endpoints de progreso requieren `Authorization: Bearer <token>`. La ruta `POST /progreso/modulo/completar-leccion` también requiere `Idempotency-Key`. El frontend no obtiene tokens OIDC por sí solo; para usar la API desde una interfaz debe integrarse con el proveedor de identidad configurado.


## Arquitectura MVC

El backend organiza el flujo de progreso con responsabilidades separadas:

- **Modelo:** esquemas de Mongoose en `src/models/` (`ProgresoCurso`, `ProgresoLeccion` y `ProgresoModulo`). Definen la persistencia y sus índices.
- **Controlador:** `src/controllers/progreso.controller.ts` expone las rutas REST, toma parámetros/headers y delega el trabajo. No calcula porcentajes ni accede directamente a Mongo.
- **Repositorio:** `src/repositories/` encapsula las consultas y escrituras Mongoose para progreso de curso y módulo; los servicios no inyectan directamente modelos de base de datos.
- **Servicio:** `src/services/progreso.service.ts` contiene el flujo compatible por curso; `src/services/progreso-modulo.service.ts` valida Catálogo, completa lecciones por versión, recalcula avance y crea el evento outbox.
- **Vista/API:** `src/views/progreso.view.ts` transforma documentos Mongo a respuestas JSON y oculta `_id`/`__v`, manteniendo los campos que usa la interfaz.
- **Integraciones:** `src/integrations/` contiene el cliente de Catálogo; `src/security/` valida JWT; `src/messaging/outbox.publisher.ts` publica eventos a RabbitMQ.

`AppController` cubre infraestructura HTTP general: `GET /api/health` delega en `AppService`, y `GET /vista` entrega la interfaz. El frontend además se sirve como archivos estáticos desde `main.ts`. No contiene reglas de avance.
