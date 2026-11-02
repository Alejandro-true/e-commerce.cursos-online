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
exports.ProgresoModuloRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const progreso_modulo_schema_1 = require("../models/progreso-modulo.schema");
let ProgresoModuloRepository = class ProgresoModuloRepository {
    modelo;
    constructor(modelo) {
        this.modelo = modelo;
    }
    buscarPorUsuarioCursoVersionModulo(idUsuario, idCurso, versionCurso, idModulo) {
        return this.modelo.findOne({ idUsuario, idCurso, versionCurso, idModulo }).exec();
    }
    listarPorUsuarioCursoVersion(idUsuario, idCurso, versionCurso) {
        return this.modelo.find({ idUsuario, idCurso, versionCurso }).exec();
    }
    crear(datos) {
        return new this.modelo(datos);
    }
    guardar(documento) {
        return documento.save();
    }
    listarPendientes(ahora, limite) {
        return this.modelo.find({
            outboxEvents: {
                $elemMatch: {
                    estado: 'PENDIENTE',
                    $or: [{ reintentarEn: { $exists: false } }, { reintentarEn: { $lte: ahora } }],
                },
            },
        }).limit(limite).exec();
    }
    marcarPublicado(id, eventId, fecha) {
        return this.modelo.updateOne({ _id: id, 'outboxEvents.eventId': eventId }, { $set: { 'outboxEvents.$.estado': 'PUBLICADO', 'outboxEvents.$.publicadoEn': fecha, 'outboxEvents.$.ultimoError': undefined } }).exec();
    }
    programarReintento(id, eventId, esperaHasta, error) {
        return this.modelo.updateOne({ _id: id, 'outboxEvents.eventId': eventId }, { $inc: { 'outboxEvents.$.intentos': 1 }, $set: { 'outboxEvents.$.reintentarEn': esperaHasta, 'outboxEvents.$.ultimoError': error } }).exec();
    }
};
exports.ProgresoModuloRepository = ProgresoModuloRepository;
exports.ProgresoModuloRepository = ProgresoModuloRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(progreso_modulo_schema_1.ProgresoModulo.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProgresoModuloRepository);
//# sourceMappingURL=progreso-modulo.repository.js.map