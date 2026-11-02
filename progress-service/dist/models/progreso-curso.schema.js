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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgresoCursoSchema = exports.ProgresoCurso = exports.EstadoProgreso = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
const progreso_leccion_schema_1 = require("./progreso-leccion.schema");
var EstadoProgreso;
(function (EstadoProgreso) {
    EstadoProgreso["NO_INICIADO"] = "NO_INICIADO";
    EstadoProgreso["EN_PROGRESO"] = "EN_PROGRESO";
    EstadoProgreso["COMPLETADO"] = "COMPLETADO";
})(EstadoProgreso || (exports.EstadoProgreso = EstadoProgreso = {}));
let ProgresoCurso = class ProgresoCurso {
    idUsuario;
    idCurso;
    totalLecciones;
    leccionesCompletadas;
    porcentaje;
    estado;
    lecciones;
    ultimaLeccionId;
    ultimoAcceso;
    certificadoElegible;
    fechaCompletado;
};
exports.ProgresoCurso = ProgresoCurso;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del usuario / estudiante', example: 'usuario-001' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ProgresoCurso.prototype, "idUsuario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del curso', example: 'curso-nestjs-microservicios' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ProgresoCurso.prototype, "idCurso", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Número total de lecciones del curso', example: 10, default: 0 }),
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], ProgresoCurso.prototype, "totalLecciones", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cantidad de lecciones completadas', example: 5, default: 0 }),
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], ProgresoCurso.prototype, "leccionesCompletadas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Porcentaje calculado de avance (0 a 100)', example: 50, default: 0 }),
    (0, mongoose_1.Prop)({ required: true, default: 0, min: 0, max: 100 }),
    __metadata("design:type", Number)
], ProgresoCurso.prototype, "porcentaje", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estado general del curso para el usuario',
        enum: EstadoProgreso,
        example: EstadoProgreso.EN_PROGRESO,
    }),
    (0, mongoose_1.Prop)({
        required: true,
        enum: EstadoProgreso,
        default: EstadoProgreso.NO_INICIADO,
    }),
    __metadata("design:type", String)
], ProgresoCurso.prototype, "estado", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detalle de avance por cada lección',
        type: () => [progreso_leccion_schema_1.ProgresoLeccion],
    }),
    (0, mongoose_1.Prop)({ type: [progreso_leccion_schema_1.ProgresoLeccionSchema], default: [] }),
    __metadata("design:type", Array)
], ProgresoCurso.prototype, "lecciones", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID de la última lección vista o accedida', example: 'leccion-101' }),
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], ProgresoCurso.prototype, "ultimaLeccionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fecha y hora del último acceso' }),
    (0, mongoose_1.Prop)({ required: false, default: Date.now }),
    __metadata("design:type", Date)
], ProgresoCurso.prototype, "ultimoAcceso", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Indica si el usuario completó el curso y puede emitir certificado', example: false }),
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], ProgresoCurso.prototype, "certificadoElegible", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fecha de culminación del 100% del curso' }),
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], ProgresoCurso.prototype, "fechaCompletado", void 0);
exports.ProgresoCurso = ProgresoCurso = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'progreso_cursos',
        timestamps: true,
    })
], ProgresoCurso);
exports.ProgresoCursoSchema = mongoose_1.SchemaFactory.createForClass(ProgresoCurso);
exports.ProgresoCursoSchema.index({ idUsuario: 1, idCurso: 1 }, { unique: true });
//# sourceMappingURL=progreso-curso.schema.js.map