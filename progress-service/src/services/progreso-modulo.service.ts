import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CatalogoClient, EstructuraCursoCatalogo } from '../integrations/catalogo.client';
import {
  EventoOutbox,
  ProgresoModulo,
  ProgresoModuloDocument,
} from '../models/progreso-modulo.schema';
import { CompletarLeccionModuloDto } from '../dto/completar-leccion-modulo.dto';
import { ProgresoModuloRepository } from '../repositories/progreso-modulo.repository';

@Injectable()
export class ProgresoModuloService {
  constructor(
    private readonly repositorio: ProgresoModuloRepository,
    private readonly catalogo: CatalogoClient,
  ) {}

  async completarLeccion(
    idUsuario: string,
    dto: CompletarLeccionModuloDto,
    token: string,
    idempotencyKey: string,
  ) {
    await this.catalogo.verificarAcceso(idUsuario, dto.idCurso, token);
    const estructura = await this.catalogo.obtenerEstructura(
      dto.idCurso,
      dto.versionCurso,
      token,
    );
    const moduloCatalogo = estructura.modulos.find((modulo) => modulo.idModulo === dto.idModulo);
    if (!moduloCatalogo) {
      throw new NotFoundException('El módulo no existe en la versión del curso');
    }
    const leccionesObligatorias = moduloCatalogo.lecciones
      .filter((leccion) => leccion.obligatoria !== false)
      .map((leccion) => leccion.idLeccion);
    if (leccionesObligatorias.length === 0) {
      throw new ConflictException('El módulo no tiene lecciones obligatorias');
    }
    if (!leccionesObligatorias.includes(dto.idLeccion)) {
      throw new NotFoundException('La lección no existe o no es obligatoria en este módulo');
    }

    for (let intento = 0; intento < 3; intento += 1) {
      let progreso = await this.repositorio.buscarPorUsuarioCursoVersionModulo(
        idUsuario, dto.idCurso, dto.versionCurso, dto.idModulo);

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
      } else if (
        [...progreso.leccionesObligatorias].sort().join('|') !==
        [...leccionesObligatorias].sort().join('|')
      ) {
        throw new ConflictException(
          'La estructura publicada cambió dentro de la misma versión del curso',
        );
      }

      const antesCompletado = progreso.completado;
      progreso.leccionesCompletadas.push(dto.idLeccion);
      progreso.porcentaje = Math.round(
        (progreso.leccionesCompletadas.length / progreso.leccionesObligatorias.length) * 100,
      );
      progreso.completado = progreso.leccionesCompletadas.length >= progreso.leccionesObligatorias.length;
      progreso.ultimaLeccionId = dto.idLeccion;
      progreso.ultimoAcceso = new Date();

      if (progreso.completado && !antesCompletado) {
        progreso.fechaCompletado = new Date();
        const eventId = randomUUID();
        const evento: EventoOutbox = {
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
      } catch (error) {
        if (
          !(typeof error === 'object' && error !== null && 'name' in error && error.name === 'VersionError') &&
          !(typeof error === 'object' && error !== null && 'code' in error && error.code === 11000)
        ) {
          throw error;
        }
      }
    }
    throw new ConflictException('No se pudo consolidar el progreso concurrente; vuelve a intentar');
  }

  private async construirRespuesta(
    progreso: ProgresoModuloDocument,
    estructura: EstructuraCursoCatalogo,
  ) {
    const progresosModulo = await this.repositorio.listarPorUsuarioCursoVersion(
      progreso.idUsuario, progreso.idCurso, progreso.versionCurso);
    const completadasPorModulo = new Map(
      progresosModulo.map((item) => [item.idModulo, new Set(item.leccionesCompletadas)]),
    );
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
}
