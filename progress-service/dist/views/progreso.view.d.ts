import { ProgresoCursoDocument } from '../models/progreso-curso.schema';
export declare class ProgresoView {
    static curso(documento: ProgresoCursoDocument): Record<string, unknown>;
    static historial<T extends {
        cursos: ProgresoCursoDocument[];
    }>(resultado: T): T & {
        cursos: Record<string, unknown>[];
    };
}
