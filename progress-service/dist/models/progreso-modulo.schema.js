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
exports.ProgresoModuloSchema = exports.ProgresoModulo = exports.EventoOutboxSchema = exports.EventoOutbox = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let EventoOutbox = class EventoOutbox {
    eventId;
    estado;
    payload;
    creadoEn;
    reintentarEn;
    intentos;
    publicadoEn;
    ultimoError;
};
exports.EventoOutbox = EventoOutbox;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EventoOutbox.prototype, "eventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'PENDIENTE' }),
    __metadata("design:type", String)
], EventoOutbox.prototype, "estado", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Object }),
    __metadata("design:type", Object)
], EventoOutbox.prototype, "payload", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], EventoOutbox.prototype, "creadoEn", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], EventoOutbox.prototype, "reintentarEn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], EventoOutbox.prototype, "intentos", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], EventoOutbox.prototype, "publicadoEn", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EventoOutbox.prototype, "ultimoError", void 0);
exports.EventoOutbox = EventoOutbox = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], EventoOutbox);
exports.EventoOutboxSchema = mongoose_1.SchemaFactory.createForClass(EventoOutbox);
let ProgresoModulo = class ProgresoModulo {
    idUsuario;
    idCurso;
    versionCurso;
    idModulo;
    leccionesObligatorias;
    leccionesCompletadas;
    porcentaje;
    completado;
    fechaCompletado;
    ultimaLeccionId;
    ultimoAcceso;
    outboxEvents;
};
exports.ProgresoModulo = ProgresoModulo;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ProgresoModulo.prototype, "idUsuario", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ProgresoModulo.prototype, "idCurso", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProgresoModulo.prototype, "versionCurso", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProgresoModulo.prototype, "idModulo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: [String] }),
    __metadata("design:type", Array)
], ProgresoModulo.prototype, "leccionesObligatorias", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ProgresoModulo.prototype, "leccionesCompletadas", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0, min: 0, max: 100 }),
    __metadata("design:type", Number)
], ProgresoModulo.prototype, "porcentaje", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ProgresoModulo.prototype, "completado", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ProgresoModulo.prototype, "fechaCompletado", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProgresoModulo.prototype, "ultimaLeccionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], ProgresoModulo.prototype, "ultimoAcceso", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.EventoOutboxSchema], default: [] }),
    __metadata("design:type", Array)
], ProgresoModulo.prototype, "outboxEvents", void 0);
exports.ProgresoModulo = ProgresoModulo = __decorate([
    (0, mongoose_1.Schema)({ collection: 'progreso_modulos', timestamps: true, optimisticConcurrency: true })
], ProgresoModulo);
exports.ProgresoModuloSchema = mongoose_1.SchemaFactory.createForClass(ProgresoModulo);
exports.ProgresoModuloSchema.index({ idUsuario: 1, idCurso: 1, versionCurso: 1, idModulo: 1 }, { unique: true });
exports.ProgresoModuloSchema.index({ 'outboxEvents.estado': 1, 'outboxEvents.reintentarEn': 1 });
//# sourceMappingURL=progreso-modulo.schema.js.map