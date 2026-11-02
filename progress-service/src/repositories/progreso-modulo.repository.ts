import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProgresoModulo, ProgresoModuloDocument } from '../models/progreso-modulo.schema';

@Injectable()
export class ProgresoModuloRepository {
  constructor(@InjectModel(ProgresoModulo.name) private readonly modelo: Model<ProgresoModuloDocument>) {}

  buscarPorUsuarioCursoVersionModulo(idUsuario: string, idCurso: string, versionCurso: string, idModulo: string) {
    return this.modelo.findOne({ idUsuario, idCurso, versionCurso, idModulo }).exec();
  }

  listarPorUsuarioCursoVersion(idUsuario: string, idCurso: string, versionCurso: string) {
    return this.modelo.find({ idUsuario, idCurso, versionCurso }).exec();
  }

  crear(datos: Partial<ProgresoModulo>) {
    return new this.modelo(datos);
  }

  guardar(documento: ProgresoModuloDocument) {
    return documento.save();
  }

  listarPendientes(ahora: Date, limite: number) {
    return this.modelo.find({
      outboxEvents: {
        $elemMatch: {
          estado: 'PENDIENTE',
          $or: [{ reintentarEn: { $exists: false } }, { reintentarEn: { $lte: ahora } }],
        },
      },
    }).limit(limite).exec();
  }

  marcarPublicado(id: ProgresoModuloDocument['_id'], eventId: string, fecha: Date) {
    return this.modelo.updateOne(
      { _id: id, 'outboxEvents.eventId': eventId },
      { $set: { 'outboxEvents.$.estado': 'PUBLICADO', 'outboxEvents.$.publicadoEn': fecha, 'outboxEvents.$.ultimoError': undefined } },
    ).exec();
  }

  programarReintento(id: ProgresoModuloDocument['_id'], eventId: string, esperaHasta: Date, error: string) {
    return this.modelo.updateOne(
      { _id: id, 'outboxEvents.eventId': eventId },
      { $inc: { 'outboxEvents.$.intentos': 1 }, $set: { 'outboxEvents.$.reintentarEn': esperaHasta, 'outboxEvents.$.ultimoError': error } },
    ).exec();
  }
}
