"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgresoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const progreso_service_1 = require("../services/progreso.service");
const progreso_modulo_service_1 = require("../services/progreso-modulo.service");
const jwt_auth_guard_1 = require("../security/jwt-auth.guard");
const completar_leccion_modulo_dto_1 = require("../dto/completar-leccion-modulo.dto");
const completar_leccion_dto_1 = require("../dto/completar-leccion.dto");
const desmarcar_leccion_dto_1 = require("../dto/desmarcar-leccion.dto");
const guardar_posicion_dto_1 = require("../dto/guardar-posicion.dto");
const inicializar_progreso_dto_1 = require("../dto/inicializar-progreso.dto");
const progreso_view_1 = require("../views/progreso.view");
let ProgresoController = class ProgresoController {
    servicioProgreso;
    servicioModulo;
    constructor(servicioProgreso, servicioModulo) {
        this.servicioProgreso = servicioProgreso;
        this.servicioModulo = servicioModulo;
    }
    async inicializar(dto) {
        return progreso_view_1.ProgresoView.curso(await this.servicioProgreso.inicializarProgreso(dto));
    }
    async completarLeccion(dto) {
        return progreso_view_1.ProgresoView.curso(await this.servicioProgreso.completarLeccion(dto));
    }
    async completarLeccionModulo(dto, authorization, idempotencyKey, request) {
        if (!idempotencyKey?.trim()) {
            throw new common_1.BadRequestException('Se requiere el encabezado Idempotency-Key');
        }
        const token = authorization?.replace(/^Bearer\s+/i, '');
        if (!token)
            throw new common_1.BadRequestException('Falta el token Bearer');
        return this.servicioModulo.completarLeccion(request.user.idUsuario, dto, token, idempotencyKey.trim());
    }
    async desmarcarLeccion(dto) {
        return progreso_view_1.ProgresoView.curso(await this.servicioProgreso.desmarcarLeccion(dto));
    }
    async guardarPosicion(dto) {
        return progreso_view_1.ProgresoView.curso(await this.servicioProgreso.guardarPosicion(dto));
    }
    async obtenerTodosLosProgresosUsuario(idUsuario) {
        return progreso_view_1.ProgresoView.historial(await this.servicioProgreso.obtenerTodosLosProgresosUsuario(idUsuario));
    }
    async obtenerMetricasCurso(idCurso) {
        return await this.servicioProgreso.obtenerMetricasCurso(idCurso);
    }
    async obtenerProgreso(idUsuario, idCurso) {
        return progreso_view_1.ProgresoView.curso(await this.servicioProgreso.obtenerProgreso(idUsuario, idCurso));
    }
    async reiniciarProgreso(idUsuario, idCurso) {
        return progreso_view_1.ProgresoView.curso(await this.servicioProgreso.reiniciarProgreso(idUsuario, idCurso));
    }
    async eliminarProgreso(idUsuario, idCurso) {
        return await this.servicioProgreso.eliminarProgreso(idUsuario, idCurso);
    }
};
exports.ProgresoController = ProgresoController;
__decorate([
    (0, common_1.Post)('inicializar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inicializar_progreso_dto_1.InicializarProgresoDto]),
    __metadata("design:returntype", Promise)
], ProgresoController.prototype, "inicializar", null);
__decorate([
    (0, common_1.Post)('completar-leccion'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ deprecated: true, summary: 'Compatibilidad con el flujo anterior por curso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [completar_leccion_dto_1.CompletarLeccionDto]),
    __metadata("design:returntype", Promise)
], ProgresoController.prototype, "completarLeccion", null);
__decorate([
    (0, common_1.Post)('modulo/completar-leccion'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Registrar una finalización idempotente de lección dentro de un módulo y versión',
        description: 'Valida el token, el acceso vigente en Catálogo y la estructura publicada; al completar el módulo guarda ModuloCompletado en el outbox.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avance del módulo y curso actualizado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('idempotency-key')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [completar_leccion_modulo_dto_1.CompletarLeccionModuloDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProgresoController.prototype, "completarLeccionModulo", null);
__decorate([
    (0, common_1.Post)('desmarcar-leccion'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [desmarcar_leccion_dto_1.DesmarcarLeccionDto]),
    __metadata("design:returntype", Promise)
], ProgresoController.prototype, "desmarcarLeccion", null);
__decorate([
    (0, common_1.Post)('guardar-posicion'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [guardar_posicion_dto_1.GuardarPosicionDto]),
    __metadata("design:returntype", Promise)
], ProgresoController.prototype, "guardarPosicion", null);
__decorate([
    (0, common_1.Get)('usuario/:idUsuario'),
    (0, swagger_1.ApiParam)({ name: 'idUsuario', description: 'ID del usuario del token' }),
    __param(0, (0, common_1.Param)('idUsuario')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProgresoController.prototype, "obtenerTodosLosProgresosUsuario", null);
__decorate([
    (0, common_1.Get)('curso/:idCurso/metricas'),
    __param(0, (0, common_1.Param)('idCurso')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProgresoController.prototype, "obtenerMetricasCurso", null);
__decorate([
    (0, common_1.Get)(':idUsuario/:idCurso'),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Progreso no encontrado' }),
    __param(0, (0, common_1.Param)('idUsuario')),
    __param(1, (0, common_1.Param)('idCurso')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProgresoController.prototype, "obtenerProgreso", null);
__decorate([
    (0, common_1.Put)(':idUsuario/:idCurso/reiniciar'),
    __param(0, (0, common_1.Param)('idUsuario')),
    __param(1, (0, common_1.Param)('idCurso')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProgresoController.prototype, "reiniciarProgreso", null);
__decorate([
    (0, common_1.Delete)(':idUsuario/:idCurso'),
    __param(0, (0, common_1.Param)('idUsuario')),
    __param(1, (0, common_1.Param)('idCurso')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProgresoController.prototype, "eliminarProgreso", null);
exports.ProgresoController = ProgresoController = __decorate([
    (0, swagger_1.ApiTags)('Progreso de Aprendizaje'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('progreso'),
    __metadata("design:paramtypes", [progreso_service_1.ProgresoService,
        progreso_modulo_service_1.ProgresoModuloService])
], ProgresoController);
//# sourceMappingURL=progreso.controller.js.map