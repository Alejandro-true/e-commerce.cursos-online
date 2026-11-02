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
exports.ProgresoService = void 0;
const common_1 = require("@nestjs/common");
const progreso_curso_schema_1 = require("./models/progreso-curso.schema");
const progreso_curso_repository_1 = require("../repositories/progreso-curso.repository");
let ProgresoService = class ProgresoService {
    repositorio;
    constructor(repositorio) {
        this.repositorio = repositorio;
    }
    async inicializarProgreso(dto) {
        const { idUsuario, idCurso, totalLecciones, leccionesIds } = dto;
        let progreso = await this.repositorio.buscarPorUsuarioCurso(idUsuario, idCurso);
        if (!progreso) {
            const leccionesIniciales = [...new Set(leccionesIds || [])].map((id) => ({
                idLeccion: id,
                tituloLeccion: '',
                completada: false,
                segundoActual: 0,
                duracionSegundos: 0,
            }));
            progreso = this.repositorio.crear({
                idUsuario,
                idCurso,
                totalLecciones,
                leccionesCompletadas: 0,
                porcentaje: 0,
                estado: progreso_curso_schema_1.EstadoProgreso.NO_INICIADO,
                lecciones: leccionesIniciales,
                certificadoElegible: false,
                ultimoAcceso: new Date(),
            });
        }
        else {
            progreso.totalLecciones = Math.max(progreso.totalLecciones, totalLecciones);
            if (leccionesIds && leccionesIds.length > 0) {
                for (const id of new Set(leccionesIds)) {
                    const existe = progreso.lecciones.some((l) => l.idLeccion === id);
                    if (!existe) {
                        progreso.lecciones.push({
                            idLeccion: id,
                            tituloLeccion: '',
                            completada: false,
                            segundoActual: 0,
                            duracionSegundos: 0,
                        });
                    }
                }
            }
            this.recalcularProgreso(progreso);
        }
        return await this.repositorio.guardar(progreso);
    }
    async completarLeccion(dto) {
        const { idUsuario, idCurso, idLeccion, tituloLeccion, totalLecciones, duracionSegundos } = dto;
        let progreso = await this.repositorio.buscarPorUsuarioCurso(idUsuario, idCurso);
        if (!progreso) {
            progreso = this.repositorio.crear({
                idUsuario,
                idCurso,
                totalLecciones: totalLecciones || 1,
                leccionesCompletadas: 0,
                porcentaje: 0,
                estado: progreso_curso_schema_1.EstadoProgreso.NO_INICIADO,
                lecciones: [],
                certificadoElegible: false,
            });
        }
        if (totalLecciones && totalLecciones > progreso.totalLecciones) {
            progreso.totalLecciones = totalLecciones;
        }
        let leccion = progreso.lecciones.find((l) => l.idLeccion === idLeccion);
        if (leccion) {
            if (!leccion.completada) {
                leccion.fechaCompletada = new Date();
            }
            leccion.completada = true;
            if (tituloLeccion)
                leccion.tituloLeccion = tituloLeccion;
            if (duracionSegundos !== undefined) {
                leccion.duracionSegundos = duracionSegundos;
                leccion.segundoActual = duracionSegundos;
            }
        }
        else {
            leccion = {
                idLeccion,
                tituloLeccion: tituloLeccion || '',
                completada: true,
                fechaCompletada: new Date(),
                segundoActual: duracionSegundos || 0,
                duracionSegundos: duracionSegundos || 0,
            };
            progreso.lecciones.push(leccion);
        }
        progreso.ultimaLeccionId = idLeccion;
        progreso.ultimoAcceso = new Date();
        this.recalcularProgreso(progreso);
        return await this.repositorio.guardar(progreso);
    }
    async desmarcarLeccion(dto) {
        const { idUsuario, idCurso, idLeccion } = dto;
        const progreso = await this.repositorio.buscarPorUsuarioCurso(idUsuario, idCurso);
        if (!progreso) {
            throw new common_1.NotFoundException(`No se encontró registro de progreso para el usuario ${idUsuario} en el curso ${idCurso}`);
        }
        const leccion = progreso.lecciones.find((l) => l.idLeccion === idLeccion);
        if (!leccion) {
            throw new common_1.NotFoundException(`No se encontró la lección ${idLeccion} en el progreso del curso`);
        }
        leccion.completada = false;
        leccion.fechaCompletada = undefined;
        progreso.ultimaLeccionId = idLeccion;
        progreso.ultimoAcceso = new Date();
        this.recalcularProgreso(progreso);
        return await this.repositorio.guardar(progreso);
    }
    async guardarPosicion(dto) {
        const { idUsuario, idCurso, idLeccion, tituloLeccion, segundoActual, duracionSegundos, autoCompletar, totalLecciones, } = dto;
        let progreso = await this.repositorio.buscarPorUsuarioCurso(idUsuario, idCurso);
        if (!progreso) {
            progreso = this.repositorio.crear({
                idUsuario,
                idCurso,
                totalLecciones: totalLecciones || 1,
                leccionesCompletadas: 0,
                porcentaje: 0,
                estado: progreso_curso_schema_1.EstadoProgreso.NO_INICIADO,
                lecciones: [],
                certificadoElegible: false,
            });
        }
        if (totalLecciones && totalLecciones > progreso.totalLecciones) {
            progreso.totalLecciones = totalLecciones;
        }
        let leccion = progreso.lecciones.find((l) => l.idLeccion === idLeccion);
        const superaUmbral = duracionSegundos && duracionSegundos > 0 && segundoActual / duracionSegundos >= 0.9;
        const debeCompletar = autoCompletar === true || superaUmbral;
        if (leccion) {
            leccion.segundoActual = Math.min(segundoActual, duracionSegundos ?? segundoActual);
            if (duracionSegundos !== undefined)
                leccion.duracionSegundos = duracionSegundos;
            if (tituloLeccion)
                leccion.tituloLeccion = tituloLeccion;
            if (debeCompletar && !leccion.completada) {
                leccion.completada = true;
                leccion.fechaCompletada = new Date();
            }
        }
        else {
            leccion = {
                idLeccion,
                tituloLeccion: tituloLeccion || '',
                completada: Boolean(debeCompletar),
                fechaCompletada: debeCompletar ? new Date() : undefined,
                segundoActual: Math.min(segundoActual, duracionSegundos ?? segundoActual),
                duracionSegundos: duracionSegundos || 0,
            };
            progreso.lecciones.push(leccion);
        }
        progreso.ultimaLeccionId = idLeccion;
        progreso.ultimoAcceso = new Date();
        this.recalcularProgreso(progreso);
        return await this.repositorio.guardar(progreso);
    }
    async obtenerProgreso(idUsuario, idCurso) {
        const progreso = await this.repositorio.buscarPorUsuarioCurso(idUsuario, idCurso);
        if (!progreso) {
            throw new common_1.NotFoundException(`Progreso no encontrado para el usuario ${idUsuario} en el curso ${idCurso}`);
        }
        return progreso;
    }
    async obtenerTodosLosProgresosUsuario(idUsuario) {
        const cursos = await this.repositorio.listarPorUsuario(idUsuario);
        const totalCursosInscritos = cursos.length;
        const cursosCompletados = cursos.filter((c) => c.estado === progreso_curso_schema_1.EstadoProgreso.COMPLETADO).length;
        const cursosEnProgreso = cursos.filter((c) => c.estado === progreso_curso_schema_1.EstadoProgreso.EN_PROGRESO).length;
        const cursosNoIniciados = cursos.filter((c) => c.estado === progreso_curso_schema_1.EstadoProgreso.NO_INICIADO).length;
        const sumaPorcentajes = cursos.reduce((acc, curr) => acc + (curr.porcentaje || 0), 0);
        const promedioAvance = totalCursosInscritos > 0 ? Math.round(sumaPorcentajes / totalCursosInscritos) : 0;
        return {
            resumen: {
                idUsuario,
                totalCursosInscritos,
                cursosCompletados,
                cursosEnProgreso,
                cursosNoIniciados,
                promedioAvance,
            },
            cursos,
        };
    }
    async obtenerMetricasCurso(idCurso) {
        const progresos = await this.repositorio.listarPorCurso(idCurso);
        const totalInscritos = progresos.length;
        if (totalInscritos === 0) {
            return {
                idCurso,
                totalInscritos: 0,
                estudiantesCompletados: 0,
                estudiantesEnProgreso: 0,
                tasaFinalizacion: 0,
                promedioAvanceCurso: 0,
            };
        }
        const estudiantesCompletados = progresos.filter((p) => p.estado === progreso_curso_schema_1.EstadoProgreso.COMPLETADO).length;
        const estudiantesEnProgreso = progresos.filter((p) => p.estado === progreso_curso_schema_1.EstadoProgreso.EN_PROGRESO).length;
        const sumaPorcentajes = progresos.reduce((acc, curr) => acc + (curr.porcentaje || 0), 0);
        return {
            idCurso,
            totalInscritos,
            estudiantesCompletados,
            estudiantesEnProgreso,
            tasaFinalizacion: Math.round((estudiantesCompletados / totalInscritos) * 100),
            promedioAvanceCurso: Math.round(sumaPorcentajes / totalInscritos),
        };
    }
    async reiniciarProgreso(idUsuario, idCurso) {
        const progreso = await this.repositorio.buscarPorUsuarioCurso(idUsuario, idCurso);
        if (!progreso) {
            throw new common_1.NotFoundException(`No se encontró progreso para el usuario ${idUsuario} en el curso ${idCurso}`);
        }
        progreso.lecciones.forEach((l) => {
            l.completada = false;
            l.fechaCompletada = undefined;
            l.segundoActual = 0;
        });
        progreso.leccionesCompletadas = 0;
        progreso.porcentaje = 0;
        progreso.estado = progreso_curso_schema_1.EstadoProgreso.NO_INICIADO;
        progreso.certificadoElegible = false;
        progreso.fechaCompletado = undefined;
        progreso.ultimaLeccionId = undefined;
        progreso.ultimoAcceso = new Date();
        return await this.repositorio.guardar(progreso);
    }
    async eliminarProgreso(idUsuario, idCurso) {
        const resultado = await this.repositorio.eliminarPorUsuarioCurso(idUsuario, idCurso);
        if (resultado.deletedCount === 0) {
            throw new common_1.NotFoundException(`No se encontró registro para eliminar del usuario ${idUsuario} en el curso ${idCurso}`);
        }
        return {
            mensaje: `Registro de progreso eliminado exitosamente para el usuario ${idUsuario} en el curso ${idCurso}`,
        };
    }
    recalcularProgreso(progreso) {
        const totalCompletadas = progreso.lecciones.filter((l) => l.completada).length;
        progreso.leccionesCompletadas = totalCompletadas;
        if (progreso.totalLecciones <= 0) {
            progreso.totalLecciones = Math.max(progreso.lecciones.length, 1);
        }
        else if (totalCompletadas > progreso.totalLecciones) {
            progreso.totalLecciones = totalCompletadas;
        }
        const cursoCompleto = totalCompletadas >= progreso.totalLecciones;
        const porcentajeCalculado = Math.round((totalCompletadas / progreso.totalLecciones) * 100);
        progreso.porcentaje = cursoCompleto
            ? 100
            : Math.min(99, Math.max(0, porcentajeCalculado));
        if (progreso.porcentaje === 100) {
            progreso.estado = progreso_curso_schema_1.EstadoProgreso.COMPLETADO;
            progreso.certificadoElegible = true;
            if (!progreso.fechaCompletado) {
                progreso.fechaCompletado = new Date();
            }
        }
        else if (progreso.porcentaje > 0) {
            progreso.estado = progreso_curso_schema_1.EstadoProgreso.EN_PROGRESO;
            progreso.certificadoElegible = false;
            progreso.fechaCompletado = undefined;
        }
        else {
            progreso.estado = progreso_curso_schema_1.EstadoProgreso.NO_INICIADO;
            progreso.certificadoElegible = false;
            progreso.fechaCompletado = undefined;
        }
    }
};
exports.ProgresoService = ProgresoService;
exports.ProgresoService = ProgresoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [progreso_curso_repository_1.ProgresoCursoRepository])
], ProgresoService);
//# sourceMappingURL=progreso.service.js.map