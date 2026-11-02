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
exports.ProgresoLeccionSchema = exports.ProgresoLeccion = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
let ProgresoLeccion = class ProgresoLeccion {
    idLeccion;
    tituloLeccion;
    completada;
    fechaCompletada;
    segundoActual;
    duracionSegundos;
    notas;
};
exports.ProgresoLeccion = ProgresoLeccion;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Identificador único de la lección', example: 'leccion-101' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProgresoLeccion.prototype, "idLeccion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Título o nombre de la lección', example: 'Introducción a Microservicios' }),
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], ProgresoLeccion.prototype, "tituloLeccion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Indica si la lección fue completada o vista en su totalidad', example: true }),
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], ProgresoLeccion.prototype, "completada", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fecha y hora en que se completó la lección' }),
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], ProgresoLeccion.prototype, "fechaCompletada", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Última posición del video reproducida en segundos (para reanudación)', example: 120 }),
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], ProgresoLeccion.prototype, "segundoActual", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Duración total del video de la lección en segundos', example: 300 }),
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], ProgresoLeccion.prototype, "duracionSegundos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notas u observaciones del estudiante' }),
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], ProgresoLeccion.prototype, "notas", void 0);
exports.ProgresoLeccion = ProgresoLeccion = __decorate([
    (0, mongoose_1.Schema)({ _id: false, timestamps: true })
], ProgresoLeccion);
exports.ProgresoLeccionSchema = mongoose_1.SchemaFactory.createForClass(ProgresoLeccion);
//# sourceMappingURL=progreso-leccion.schema.js.map