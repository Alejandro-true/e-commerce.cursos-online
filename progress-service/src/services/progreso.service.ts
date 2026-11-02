import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ProgresoCurso,
  ProgresoCursoDocument,
  EstadoProgreso,
} from '../models/progreso-curso.schema';
import { ProgresoLeccion } from '../models/progreso-leccion.schema';
import { CompletarLeccionDto } from '../dto/completar-leccion.dto';
import { DesmarcarLeccionDto } from '../dto/desmarcar-leccion.dto';
import { GuardarPosicionDto } from '../dto/guardar-posicion.dto';
import { InicializarProgresoDto } from '../dto/inicializar-progreso.dto';
import { ProgresoCursoRepository } from '../repositories/progreso-curso.repository';

@Injectable()
export class ProgresoService {
  constructor(private readonly repositorio: ProgresoCursoRepository) {}

  /**
   * Inicializa el registro de progreso para un estudiante en un curso
   */
  async inicializarProgreso(dto: InicializarProgresoDto): Promise<ProgresoCursoDocument> {
    const { idUsuario, idCurso, totalLecciones, leccionesIds } = dto;

    let progreso = await this.repositorio.buscarPorUsuarioCurso(idUsuario, idCurso);

    if (!progreso) {
      const leccionesIniciales: ProgresoLeccion[] = [...new Set(leccionesIds || [])].map((id) => ({
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
        estado: EstadoProgreso.NO_INICIADO,
        lecciones: leccionesIniciales,
        certificadoElegible: false,
        ultimoAcceso: new Date(),
      });
    } else {
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

  /**
   * Marca una lección como completada/vista y recalcula el porcentaje de avance
   */
  async completarLeccion(dto: CompletarLeccionDto): Promise<ProgresoCursoDocument> {
    const { idUsuario, idCurso, idLeccion, tituloLeccion, totalLecciones, duracionSegundos } = dto;

    let progreso = await this.repositorio.buscarPorUsuarioCurso(idUsuario, idCurso);

    if (!progreso) {
      progreso = this.repositorio.crear({
        idUsuario,
        idCurso,
        totalLecciones: totalLecciones || 1,
        leccionesCompletadas: 0,
        porcentaje: 0,
        estado: EstadoProgreso.NO_INICIADO,
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
      if (tituloLeccion) leccion.tituloLeccion = tituloLeccion;
      if (duracionSegundos !== undefined) {
        leccion.duracionSegundos = duracionSegundos;
        leccion.segundoActual = duracionSegundos;
      }
    } else {
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

  /**
   * Desmarca una lección previamente completada y recalcula el porcentaje
   */
  async desmarcarLeccion(dto: DesmarcarLeccionDto): Promise<ProgresoCursoDocument> {
    const { idUsuario, idCurso, idLeccion } = dto;

    const progreso = await this.repositorio.buscarPorUsuarioCurso(idUsuario, idCurso);
    if (!progreso) {
      throw new NotFoundException(
        `No se encontró registro de progreso para el usuario ${idUsuario} en el curso ${idCurso}`,
      );
    }

    const leccion = progreso.lecciones.find((l) => l.idLeccion === idLeccion);
    if (!leccion) {
      throw new NotFoundException(`No se encontró la lección ${idLeccion} en el progreso del curso`);
    }
    leccion.completada = false;
    leccion.fechaCompletada = undefined;

    progreso.ultimaLeccionId = idLeccion;
    progreso.ultimoAcceso = new Date();

    this.recalcularProgreso(progreso);

    return await this.repositorio.guardar(progreso);
  }

  /**
   * Registra el avance de reproducción de video (posicionamiento de micro-aprendizaje)
   * Si supera el 90% del video o autoCompletar es true, marca la lección automáticamente.
   */
  async guardarPosicion(dto: GuardarPosicionDto): Promise<ProgresoCursoDocument> {
    const {
      idUsuario,
      idCurso,
      idLeccion,
      tituloLeccion,
      segundoActual,
      duracionSegundos,
      autoCompletar,
      totalLecciones,
    } = dto;

    let progreso = await this.repositorio.buscarPorUsuarioCurso(idUsuario, idCurso);

    if (!progreso) {
      progreso = this.repositorio.crear({
        idUsuario,
        idCurso,
        totalLecciones: totalLecciones || 1,
        leccionesCompletadas: 0,
        porcentaje: 0,
        estado: EstadoProgreso.NO_INICIADO,
        lecciones: [],
        certificadoElegible: false,
      });
    }

    if (totalLecciones && totalLecciones > progreso.totalLecciones) {
      progreso.totalLecciones = totalLecciones;
    }

    let leccion = progreso.lecciones.find((l) => l.idLeccion === idLeccion);

    const superaUmbral =
      duracionSegundos && duracionSegundos > 0 && segundoActual / duracionSegundos >= 0.9;
    const debeCompletar = autoCompletar === true || superaUmbral;

    if (leccion) {
      leccion.segundoActual = Math.min(segundoActual, duracionSegundos ?? segundoActual);
      if (duracionSegundos !== undefined) leccion.duracionSegundos = duracionSegundos;
      if (tituloLeccion) leccion.tituloLeccion = tituloLeccion;
      if (debeCompletar && !leccion.completada) {
        leccion.completada = true;
        leccion.fechaCompletada = new Date();
      }
    } else {
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

  /**
   * Obtiene el progreso de un usuario en un curso específico
   */
  async obtenerProgreso(idUsuario: string, idCurso: string): Promise<ProgresoCursoDocument> {
    const progreso = await this.repositorio.buscarPorUsuarioCurso(idUsuario, idCurso);
    if (!progreso) {
      throw new NotFoundException(
        `Progreso no encontrado para el usuario ${idUsuario} en el curso ${idCurso}`,
      );
    }
    return progreso;
  }

  /**
   * Obtiene todos los progresos de un usuario y un resumen consolidado
   */
  async obtenerTodosLosProgresosUsuario(idUsuario: string): Promise<{
    resumen: {
      idUsuario: string;
      totalCursosInscritos: number;
      cursosCompletados: number;
      cursosEnProgreso: number;
      cursosNoIniciados: number;
      promedioAvance: number;
    };
    cursos: ProgresoCursoDocument[];
  }> {
    const cursos = await this.repositorio.listarPorUsuario(idUsuario);

    const totalCursosInscritos = cursos.length;
    const cursosCompletados = cursos.filter((c) => c.estado === EstadoProgreso.COMPLETADO).length;
    const cursosEnProgreso = cursos.filter((c) => c.estado === EstadoProgreso.EN_PROGRESO).length;
    const cursosNoIniciados = cursos.filter((c) => c.estado === EstadoProgreso.NO_INICIADO).length;

    const sumaPorcentajes = cursos.reduce((acc, curr) => acc + (curr.porcentaje || 0), 0);
    const promedioAvance =
      totalCursosInscritos > 0 ? Math.round(sumaPorcentajes / totalCursosInscritos) : 0;

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

  /**
   * Métricas y analíticas globales para un curso específico
   */
  async obtenerMetricasCurso(idCurso: string): Promise<{
    idCurso: string;
    totalInscritos: number;
    estudiantesCompletados: number;
    estudiantesEnProgreso: number;
    tasaFinalizacion: number;
    promedioAvanceCurso: number;
  }> {
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

    const estudiantesCompletados = progresos.filter(
      (p) => p.estado === EstadoProgreso.COMPLETADO,
    ).length;
    const estudiantesEnProgreso = progresos.filter(
      (p) => p.estado === EstadoProgreso.EN_PROGRESO,
    ).length;
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

  /**
   * Resetea el progreso de un usuario en un curso a 0%
   */
  async reiniciarProgreso(idUsuario: string, idCurso: string): Promise<ProgresoCursoDocument> {
    const progreso = await this.repositorio.buscarPorUsuarioCurso(idUsuario, idCurso);
    if (!progreso) {
      throw new NotFoundException(
        `No se encontró progreso para el usuario ${idUsuario} en el curso ${idCurso}`,
      );
    }

    progreso.lecciones.forEach((l) => {
      l.completada = false;
      l.fechaCompletada = undefined;
      l.segundoActual = 0;
    });

    progreso.leccionesCompletadas = 0;
    progreso.porcentaje = 0;
    progreso.estado = EstadoProgreso.NO_INICIADO;
    progreso.certificadoElegible = false;
    progreso.fechaCompletado = undefined;
    progreso.ultimaLeccionId = undefined;
    progreso.ultimoAcceso = new Date();

    return await this.repositorio.guardar(progreso);
  }

  /**
   * Elimina el registro de progreso de un curso para un usuario
   */
  async eliminarProgreso(idUsuario: string, idCurso: string): Promise<{ mensaje: string }> {
    const resultado = await this.repositorio.eliminarPorUsuarioCurso(idUsuario, idCurso);
    if (resultado.deletedCount === 0) {
      throw new NotFoundException(
        `No se encontró registro para eliminar del usuario ${idUsuario} en el curso ${idCurso}`,
      );
    }
    return {
      mensaje: `Registro de progreso eliminado exitosamente para el usuario ${idUsuario} en el curso ${idCurso}`,
    };
  }

  /**
   * Método interno para calcular y actualizar conteos y porcentajes de avance
   */
  private recalcularProgreso(progreso: ProgresoCursoDocument): void {
    const totalCompletadas = progreso.lecciones.filter((l) => l.completada).length;
    progreso.leccionesCompletadas = totalCompletadas;

    if (progreso.totalLecciones <= 0) {
      progreso.totalLecciones = Math.max(progreso.lecciones.length, 1);
    } else if (totalCompletadas > progreso.totalLecciones) {
      progreso.totalLecciones = totalCompletadas;
    }

    const cursoCompleto = totalCompletadas >= progreso.totalLecciones;
    const porcentajeCalculado = Math.round((totalCompletadas / progreso.totalLecciones) * 100);
    progreso.porcentaje = cursoCompleto
      ? 100
      : Math.min(99, Math.max(0, porcentajeCalculado));

    if (progreso.porcentaje === 100) {
      progreso.estado = EstadoProgreso.COMPLETADO;
      progreso.certificadoElegible = true;
      if (!progreso.fechaCompletado) {
        progreso.fechaCompletado = new Date();
      }
    } else if (progreso.porcentaje > 0) {
      progreso.estado = EstadoProgreso.EN_PROGRESO;
      progreso.certificadoElegible = false;
      progreso.fechaCompletado = undefined;
    } else {
      progreso.estado = EstadoProgreso.NO_INICIADO;
      progreso.certificadoElegible = false;
      progreso.fechaCompletado = undefined;
    }
  }
}
