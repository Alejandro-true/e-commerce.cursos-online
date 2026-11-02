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
exports.GuardarPosicionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GuardarPosicionDto {
    idUsuario;
    idCurso;
    idLeccion;
    tituloLeccion;
    segundoActual;
    duracionSegundos;
    autoCompletar;
    totalLecciones;
}
exports.GuardarPosicionDto = GuardarPosicionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del usuario / estudiante', example: 'usuario-001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GuardarPosicionDto.prototype, "idUsuario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del curso', example: 'Programacion Orientada a Objetos' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GuardarPosicionDto.prototype, "idCurso", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la lección', example: 'leccion-101' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GuardarPosicionDto.prototype, "idLeccion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Título de la lección', example: 'Clases y Objetos' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GuardarPosicionDto.prototype, "tituloLeccion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Posición actual del video en segundos', example: 180 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GuardarPosicionDto.prototype, "segundoActual", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Duración total del video en segundos', example: 200 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GuardarPosicionDto.prototype, "duracionSegundos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Si es true o si el progreso del video supera el 90%, se marca como completada automáticamente',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], GuardarPosicionDto.prototype, "autoCompletar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total de lecciones del curso', example: 10 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GuardarPosicionDto.prototype, "totalLecciones", void 0);
//# sourceMappingURL=guardar-posicion.dto.js.map