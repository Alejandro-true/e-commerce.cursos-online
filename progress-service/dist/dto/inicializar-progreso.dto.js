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
exports.InicializarProgresoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class InicializarProgresoDto {
    idUsuario;
    idCurso;
    totalLecciones;
    leccionesIds;
}
exports.InicializarProgresoDto = InicializarProgresoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del usuario / estudiante', example: 'usuario-001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InicializarProgresoDto.prototype, "idUsuario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del curso', example: 'Programacion Orientada a Objetos' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InicializarProgresoDto.prototype, "idCurso", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total de lecciones que componen el curso', example: 12 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InicializarProgresoDto.prototype, "totalLecciones", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Lista de IDs de lecciones iniciales para precargar el temario del curso',
        example: ['leccion-101', 'leccion-102', 'leccion-103'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], InicializarProgresoDto.prototype, "leccionesIds", void 0);
//# sourceMappingURL=inicializar-progreso.dto.js.map