import { Document } from 'mongoose';
export type ProgresoModuloDocument = ProgresoModulo & Document;
export declare class EventoOutbox {
    eventId: string;
    estado: string;
    payload: Record<string, unknown>;
    creadoEn: Date;
    reintentarEn?: Date;
    intentos: number;
    publicadoEn?: Date;
    ultimoError?: string;
}
export declare const EventoOutboxSchema: import("mongoose").Schema<EventoOutbox, import("mongoose").Model<EventoOutbox, any, any, any, any, any, EventoOutbox & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EventoOutbox, Document<unknown, {}, EventoOutbox, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<EventoOutbox & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    eventId?: import("mongoose").SchemaDefinitionProperty<string, EventoOutbox, Document<unknown, {}, EventoOutbox, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventoOutbox & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    estado?: import("mongoose").SchemaDefinitionProperty<string, EventoOutbox, Document<unknown, {}, EventoOutbox, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventoOutbox & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    payload?: import("mongoose").SchemaDefinitionProperty<Record<string, unknown>, EventoOutbox, Document<unknown, {}, EventoOutbox, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventoOutbox & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    creadoEn?: import("mongoose").SchemaDefinitionProperty<Date, EventoOutbox, Document<unknown, {}, EventoOutbox, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventoOutbox & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    reintentarEn?: import("mongoose").SchemaDefinitionProperty<Date | undefined, EventoOutbox, Document<unknown, {}, EventoOutbox, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventoOutbox & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    intentos?: import("mongoose").SchemaDefinitionProperty<number, EventoOutbox, Document<unknown, {}, EventoOutbox, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventoOutbox & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    publicadoEn?: import("mongoose").SchemaDefinitionProperty<Date | undefined, EventoOutbox, Document<unknown, {}, EventoOutbox, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventoOutbox & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    ultimoError?: import("mongoose").SchemaDefinitionProperty<string | undefined, EventoOutbox, Document<unknown, {}, EventoOutbox, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EventoOutbox & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, EventoOutbox>;
export declare class ProgresoModulo {
    idUsuario: string;
    idCurso: string;
    versionCurso: string;
    idModulo: string;
    leccionesObligatorias: string[];
    leccionesCompletadas: string[];
    porcentaje: number;
    completado: boolean;
    fechaCompletado?: Date;
    ultimaLeccionId?: string;
    ultimoAcceso: Date;
    outboxEvents: EventoOutbox[];
}
export declare const ProgresoModuloSchema: import("mongoose").Schema<ProgresoModulo, import("mongoose").Model<ProgresoModulo, any, any, any, any, any, ProgresoModulo & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProgresoModulo, Document<unknown, {}, ProgresoModulo, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoModulo & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    idUsuario?: import("mongoose").SchemaDefinitionProperty<string, ProgresoModulo, Document<unknown, {}, ProgresoModulo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoModulo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    idCurso?: import("mongoose").SchemaDefinitionProperty<string, ProgresoModulo, Document<unknown, {}, ProgresoModulo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoModulo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    versionCurso?: import("mongoose").SchemaDefinitionProperty<string, ProgresoModulo, Document<unknown, {}, ProgresoModulo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoModulo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    idModulo?: import("mongoose").SchemaDefinitionProperty<string, ProgresoModulo, Document<unknown, {}, ProgresoModulo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoModulo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    leccionesObligatorias?: import("mongoose").SchemaDefinitionProperty<string[], ProgresoModulo, Document<unknown, {}, ProgresoModulo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoModulo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    leccionesCompletadas?: import("mongoose").SchemaDefinitionProperty<string[], ProgresoModulo, Document<unknown, {}, ProgresoModulo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoModulo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    porcentaje?: import("mongoose").SchemaDefinitionProperty<number, ProgresoModulo, Document<unknown, {}, ProgresoModulo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoModulo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    completado?: import("mongoose").SchemaDefinitionProperty<boolean, ProgresoModulo, Document<unknown, {}, ProgresoModulo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoModulo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    fechaCompletado?: import("mongoose").SchemaDefinitionProperty<Date | undefined, ProgresoModulo, Document<unknown, {}, ProgresoModulo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoModulo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    ultimaLeccionId?: import("mongoose").SchemaDefinitionProperty<string | undefined, ProgresoModulo, Document<unknown, {}, ProgresoModulo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoModulo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    ultimoAcceso?: import("mongoose").SchemaDefinitionProperty<Date, ProgresoModulo, Document<unknown, {}, ProgresoModulo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoModulo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    outboxEvents?: import("mongoose").SchemaDefinitionProperty<EventoOutbox[], ProgresoModulo, Document<unknown, {}, ProgresoModulo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoModulo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, ProgresoModulo>;
