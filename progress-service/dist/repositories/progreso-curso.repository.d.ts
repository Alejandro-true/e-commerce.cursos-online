import { Model } from 'mongoose';
import { ProgresoCurso, ProgresoCursoDocument } from '../models/progreso-curso.schema';
export declare class ProgresoCursoRepository {
    private readonly modelo;
    constructor(modelo: Model<ProgresoCursoDocument>);
    buscarPorUsuarioCurso(idUsuario: string, idCurso: string): Promise<(import("mongoose").Document<unknown, {}, ProgresoCursoDocument, {}, import("mongoose").DefaultSchemaOptions> & ProgresoCurso & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    crear(datos: Partial<ProgresoCurso>): import("mongoose").Document<unknown, {}, ProgresoCursoDocument, {}, import("mongoose").DefaultSchemaOptions> & ProgresoCurso & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
    guardar(documento: ProgresoCursoDocument): Promise<ProgresoCursoDocument>;
    listarPorUsuario(idUsuario: string): Promise<(import("mongoose").Document<unknown, {}, ProgresoCursoDocument, {}, import("mongoose").DefaultSchemaOptions> & ProgresoCurso & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    listarPorCurso(idCurso: string): Promise<(import("mongoose").Document<unknown, {}, ProgresoCursoDocument, {}, import("mongoose").DefaultSchemaOptions> & ProgresoCurso & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    eliminarPorUsuarioCurso(idUsuario: string, idCurso: string): Promise<import("mongodb").DeleteResult>;
}
