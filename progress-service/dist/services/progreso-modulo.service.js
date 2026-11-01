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
exports.ProgresoModuloService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const catalogo_client_1 = require("../integrations/catalogo.client");
const progreso_modulo_repository_1 = require("../repositories/progreso-modulo.repository");
let ProgresoModuloService = class ProgresoModuloService {
    repositorio;
    catalogo;
    constructor(repositorio, catalogo) {
        this.repositorio = repositorio;
        this.catalogo = catalogo;
    }
    async completarLeccion(idUsuario, dto, token, idempotencyKey) {
        await this.catalogo.verificarAcceso(idUsuario, dto.idCurso, token);
        const estructura = await this.catalogo.obtenerEstructura(dto.idCurso, dto.versionCurso, token);
        const moduloCatalogo = estructura.modulos.find((modulo) => modulo.idModulo === dto.idModulo);
        if (!moduloCatalogo) {
            throw new common_1.NotFoundException('El módulo no existe en la versión del curso');
        }
        const leccionesObligatorias = moduloCatalogo.lecciones
            .filter((leccion) => leccion.obligatoria !== false)
            .map((leccion) => leccion.idLeccion);
        if (leccionesObligatorias.length === 0) {
            throw new common_1.ConflictException('El módulo no tiene lecciones obligatorias');
        }
        if (!leccionesObligatorias.includes(dto.idLeccion)) {
            throw new common_1.NotFoundException('La lección no existe o no es obligatoria en este módulo');
        }
        for (let intento = 0; intento < 3; intento += 1) {
            let progreso = await this.repositorio.buscarPorUsuarioCursoVersionModulo(idUsuario, dto.idCurso, dto.versionCurso, dto.idModulo);
            if (progreso?.leccionesCompletadas.includes(dto.idLeccion)) {
                return this.construirRespuesta(progreso, estructura);
            }
            if (!progreso) {
                progreso = this.repositorio.crear({
                    idUsuario,
                    idCurso: dto.idCurso,
                    versionCurso: dto.versionCurso,
                    idModulo: dto.idModulo,
                    leccionesObligatorias,
                    leccionesCompletadas: [],
                    porcentaje: 0,
                    completado: false,
                    outboxEvents: [],
                });
            }
            else if ([...progreso.leccionesObligatorias].sort().join('|') !==
                [...leccionesObligatorias].sort().join('|')) {
                throw new common_1.ConflictException('La estructura publicada cambió dentro de la misma versión del curso');
            }
            const antesCompletado = progreso.completado;
            progreso.leccionesCompletadas.push(dto.idLeccion);
            progreso.porcentaje = Math.round((progreso.leccionesCompletadas.length / progreso.leccionesObligatorias.length) * 100);
            progreso.completado = progreso.leccionesCompletadas.length >= progreso.leccionesObligatorias.length;
            progreso.ultimaLeccionId = dto.idLeccion;
            progreso.ultimoAcceso = new Date();
            if (progreso.completado && !antesCompletado) {
                progreso.fechaCompletado = new Date();
                const eventId = (0, crypto_1.randomUUID)();
                const evento = {
                    eventId,
                    estado: 'PENDIENTE',
                    creadoEn: progreso.fechaCompletado,
                    reintentarEn: progreso.fechaCompletado,
                    intentos: 0,
                    payload: {
                        idEvento: eventId,
                        idUsuario,
                        idCurso: dto.idCurso,
                        idModulo: dto.idModulo,
                        versionCurso: dto.versionCurso,
                        timestamp: progreso.fechaCompletado.toISOString(),
                        tokenIdempotencia: idempotencyKey,
                    },
                };
                progreso.outboxEvents.push(evento);
            }
            try {
                await this.repositorio.guardar(progreso);
                return this.construirRespuesta(progreso, estructura);
            }
            catch (error) {
                if (!(typeof error === 'object' && error !== null && 'name' in error && error.name === 'VersionError') &&
                    !(typeof error === 'object' && error !== null && 'code' in error && error.code === 11000)) {
                    throw error;
                }
            }
        }
        throw new common_1.ConflictException('No se pudo consolidar el progreso concurrente; vuelve a intentar');
    }
    async construirRespuesta(progreso, estructura) {
        const progresosModulo = await this.repositorio.listarPorUsuarioCursoVersion(progreso.idUsuario, progreso.idCurso, progreso.versionCurso);
        const completadasPorModulo = new Map(progresosModulo.map((item) => [item.idModulo, new Set(item.leccionesCompletadas)]));
        let totalCurso = 0;
        let completadasCurso = 0;
        for (const modulo of estructura.modulos) {
            const obligatorias = modulo.lecciones.filter((leccion) => leccion.obligatoria !== false);
            const completadas = completadasPorModulo.get(modulo.idModulo);
            totalCurso += obligatorias.length;
            completadasCurso += obligatorias.filter((leccion) => completadas?.has(leccion.idLeccion)).length;
        }
        return {
            idUsuario: progreso.idUsuario,
            idCurso: progreso.idCurso,
            versionCurso: progreso.versionCurso,
            idModulo: progreso.idModulo,
            modulo: {
                leccionesCompletadas: progreso.leccionesCompletadas.length,
                totalLecciones: progreso.leccionesObligatorias.length,
                porcentaje: progreso.porcentaje,
                completado: progreso.completado,
                fechaCompletado: progreso.fechaCompletado,
            },
            curso: {
                leccionesCompletadas: completadasCurso,
                totalLecciones: totalCurso,
                porcentaje: totalCurso === 0 ? 0 : Math.round((completadasCurso / totalCurso) * 100),
            },
            ultimaLeccionId: progreso.ultimaLeccionId,
            ultimoAcceso: progreso.ultimoAcceso,
        };
    }
};
exports.ProgresoModuloService = ProgresoModuloService;
exports.ProgresoModuloService = ProgresoModuloService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [progreso_modulo_repository_1.ProgresoModuloRepository,
        catalogo_client_1.CatalogoClient])
], ProgresoModuloService);
//# sourceMappingURL=progreso-modulo.service.js.map