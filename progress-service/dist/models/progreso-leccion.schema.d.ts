export declare class ProgresoLeccion {
    idLeccion: string;
    tituloLeccion?: string;
    completada: boolean;
    fechaCompletada?: Date;
    segundoActual: number;
    duracionSegundos?: number;
    notas?: string;
}
export declare const ProgresoLeccionSchema: import("mongoose").Schema<ProgresoLeccion, import("mongoose").Model<ProgresoLeccion, any, any, any, any, any, ProgresoLeccion & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProgresoLeccion, import("mongoose").Document<unknown, {}, ProgresoLeccion, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoLeccion & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    idLeccion?: import("mongoose").SchemaDefinitionProperty<string, ProgresoLeccion, import("mongoose").Document<unknown, {}, ProgresoLeccion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoLeccion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    tituloLeccion?: import("mongoose").SchemaDefinitionProperty<string | undefined, ProgresoLeccion, import("mongoose").Document<unknown, {}, ProgresoLeccion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoLeccion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    completada?: import("mongoose").SchemaDefinitionProperty<boolean, ProgresoLeccion, import("mongoose").Document<unknown, {}, ProgresoLeccion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoLeccion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    fechaCompletada?: import("mongoose").SchemaDefinitionProperty<Date | undefined, ProgresoLeccion, import("mongoose").Document<unknown, {}, ProgresoLeccion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoLeccion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    segundoActual?: import("mongoose").SchemaDefinitionProperty<number, ProgresoLeccion, import("mongoose").Document<unknown, {}, ProgresoLeccion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoLeccion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    duracionSegundos?: import("mongoose").SchemaDefinitionProperty<number | undefined, ProgresoLeccion, import("mongoose").Document<unknown, {}, ProgresoLeccion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoLeccion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    notas?: import("mongoose").SchemaDefinitionProperty<string | undefined, ProgresoLeccion, import("mongoose").Document<unknown, {}, ProgresoLeccion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProgresoLeccion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, ProgresoLeccion>;
