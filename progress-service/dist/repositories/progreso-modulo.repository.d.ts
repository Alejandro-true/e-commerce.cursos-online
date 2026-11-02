import { Model } from 'mongoose';
import { ProgresoModulo, ProgresoModuloDocument } from '../models/progreso-modulo.schema';
export declare class ProgresoModuloRepository {
    private readonly modelo;
    constructor(modelo: Model<ProgresoModuloDocument>);
    buscarPorUsuarioCursoVersionModulo(idUsuario: string, idCurso: string, versionCurso: string, idModulo: string): Promise<(import("mongoose").Document<unknown, {}, ProgresoModuloDocument, {}, import("mongoose").DefaultSchemaOptions> & ProgresoModulo & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    listarPorUsuarioCursoVersion(idUsuario: string, idCurso: string, versionCurso: string): Promise<(import("mongoose").Document<unknown, {}, ProgresoModuloDocument, {}, import("mongoose").DefaultSchemaOptions> & ProgresoModulo & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    crear(datos: Partial<ProgresoModulo>): import("mongoose").Document<unknown, {}, ProgresoModuloDocument, {}, import("mongoose").DefaultSchemaOptions> & ProgresoModulo & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
    guardar(documento: ProgresoModuloDocument): Promise<ProgresoModuloDocument>;
    listarPendientes(ahora: Date, limite: number): Promise<(import("mongoose").Document<unknown, {}, ProgresoModuloDocument, {}, import("mongoose").DefaultSchemaOptions> & ProgresoModulo & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    marcarPublicado(id: ProgresoModuloDocument['_id'], eventId: string, fecha: Date): Promise<import("mongoose").UpdateWriteOpResult>;
    programarReintento(id: ProgresoModuloDocument['_id'], eventId: string, esperaHasta: Date, error: string): Promise<import("mongoose").UpdateWriteOpResult>;
}
