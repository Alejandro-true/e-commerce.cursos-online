import { Document } from 'mongoose';
import { ProgresoLeccion } from './progreso-leccion.schema';
export type ProgresoCursoDocument = ProgresoCurso & Document;
export declare enum EstadoProgreso {
    NO_INICIADO = "NO_INICIADO",
    EN_PROGRESO = "EN_PROGRESO",
    COMPLETADO = "COMPLETADO"
}
export declare class ProgresoCurso {
    idUsuario: string;
    idCurso: string;
    totalLecciones: number;
    leccionesCompletadas: number;
    porcentaje: number;
    estado: EstadoProgreso;
    lecciones: ProgresoLeccion[];
    ultimaLeccionId?: string;
    ultimoAcceso?: Date;
    certificadoElegible: boolean;
    fechaCompletado?: Date;
}
export declare const ProgresoCursoSchema: import("mongoose").Schema<ProgresoCurso, import("mongoose").Model<ProgresoCurso, any, any, any, any, any, ProgresoCurso & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProgresoCurso, Document<unknown, {}, ProgresoCurso, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoCurso & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    idUsuario?: import("mongoose").SchemaDefinitionProperty<string, ProgresoCurso, Document<unknown, {}, ProgresoCurso, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoCurso & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    idCurso?: import("mongoose").SchemaDefinitionProperty<string, ProgresoCurso, Document<unknown, {}, ProgresoCurso, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoCurso & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalLecciones?: import("mongoose").SchemaDefinitionProperty<number, ProgresoCurso, Document<unknown, {}, ProgresoCurso, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoCurso & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    leccionesCompletadas?: import("mongoose").SchemaDefinitionProperty<number, ProgresoCurso, Document<unknown, {}, ProgresoCurso, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoCurso & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    porcentaje?: import("mongoose").SchemaDefinitionProperty<number, ProgresoCurso, Document<unknown, {}, ProgresoCurso, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoCurso & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    estado?: import("mongoose").SchemaDefinitionProperty<EstadoProgreso, ProgresoCurso, Document<unknown, {}, ProgresoCurso, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoCurso & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    lecciones?: import("mongoose").SchemaDefinitionProperty<ProgresoLeccion[], ProgresoCurso, Document<unknown, {}, ProgresoCurso, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoCurso & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    ultimaLeccionId?: import("mongoose").SchemaDefinitionProperty<string | undefined, ProgresoCurso, Document<unknown, {}, ProgresoCurso, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoCurso & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    ultimoAcceso?: import("mongoose").SchemaDefinitionProperty<Date | undefined, ProgresoCurso, Document<unknown, {}, ProgresoCurso, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoCurso & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    certificadoElegible?: import("mongoose").SchemaDefinitionProperty<boolean, ProgresoCurso, Document<unknown, {}, ProgresoCurso, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoCurso & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    fechaCompletado?: import("mongoose").SchemaDefinitionProperty<Date | undefined, ProgresoCurso, Document<unknown, {}, ProgresoCurso, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoCurso & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, ProgresoCurso>;
