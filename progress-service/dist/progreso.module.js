"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgresoModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const progreso_controller_1 = require("./controllers/progreso.controller");
const progreso_service_1 = require("./services/progreso.service");
const progreso_modulo_service_1 = require("./services/progreso-modulo.service");
const catalogo_client_1 = require("./integrations/catalogo.client");
const jwt_auth_guard_1 = require("./security/jwt-auth.guard");
const outbox_publisher_1 = require("./messaging/outbox.publisher");
const progreso_curso_schema_1 = require("./models/progreso-curso.schema");
const progreso_modulo_schema_1 = require("./models/progreso-modulo.schema");
const progreso_curso_repository_1 = require("./repositories/progreso-curso.repository");
const progreso_modulo_repository_1 = require("./repositories/progreso-modulo.repository");
let ProgresoModule = class ProgresoModule {
};
exports.ProgresoModule = ProgresoModule;
exports.ProgresoModule = ProgresoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: progreso_curso_schema_1.ProgresoCurso.name, schema: progreso_curso_schema_1.ProgresoCursoSchema },
                { name: progreso_modulo_schema_1.ProgresoModulo.name, schema: progreso_modulo_schema_1.ProgresoModuloSchema },
            ]),
        ],
        controllers: [progreso_controller_1.ProgresoController],
        providers: [
            progreso_curso_repository_1.ProgresoCursoRepository,
            progreso_modulo_repository_1.ProgresoModuloRepository,
            progreso_service_1.ProgresoService,
            progreso_modulo_service_1.ProgresoModuloService,
            catalogo_client_1.CatalogoClient,
            jwt_auth_guard_1.JwtAuthGuard,
            outbox_publisher_1.OutboxPublisher,
        ],
        exports: [progreso_service_1.ProgresoService, progreso_modulo_service_1.ProgresoModuloService],
    })
], ProgresoModule);
//# sourceMappingURL=progreso.module.js.map