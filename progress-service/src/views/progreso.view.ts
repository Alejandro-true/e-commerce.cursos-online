import { ProgresoCursoDocument } from '../models/progreso-curso.schema';

/**
 * Capa de presentacion MVC: transforma documentos de Mongo en respuestas HTTP.
 * Los nombres y datos de negocio se conservan, pero no se expone la identidad
 * interna del documento ni la version tecnica de MongoDB.
 */
export class ProgresoView {
  static curso(documento: ProgresoCursoDocument): Record<string, unknown> {
    const respuesta = documento.toObject({ virtuals: false }) as Record<string, unknown>;
    delete respuesta._id;
    delete respuesta.__v;
    return respuesta;
  }

  static historial<T extends { cursos: ProgresoCursoDocument[] }>(resultado: T) {
    return {
      ...resultado,
      cursos: resultado.cursos.map((curso) => this.curso(curso)),
    };
  }
}
