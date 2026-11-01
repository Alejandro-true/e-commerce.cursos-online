import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProgresoCurso, ProgresoCursoDocument } from '../models/progreso-curso.schema';

@Injectable()
export class ProgresoCursoRepository {
  constructor(@InjectModel(ProgresoCurso.name) private readonly modelo: Model<ProgresoCursoDocument>) {}

  buscarPorUsuarioCurso(idUsuario: string, idCurso: string) {
    return this.modelo.findOne({ idUsuario, idCurso }).exec();
  }

  crear(datos: Partial<ProgresoCurso>) {
    return new this.modelo(datos);
  }

  guardar(documento: ProgresoCursoDocument) {
    return documento.save();
  }

  listarPorUsuario(idUsuario: string) {
    return this.modelo.find({ idUsuario }).sort({ updatedAt: -1 }).exec();
  }

  listarPorCurso(idCurso: string) {
    return this.modelo.find({ idCurso }).exec();
  }

  eliminarPorUsuarioCurso(idUsuario: string, idCurso: string) {
    return this.modelo.deleteOne({ idUsuario, idCurso }).exec();
  }
}
