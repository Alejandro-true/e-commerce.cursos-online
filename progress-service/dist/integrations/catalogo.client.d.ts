export interface LeccionCatalogo {
    idLeccion: string;
    obligatoria?: boolean;
    tituloLeccion?: string;
    duracionSegundos?: number;
}
export interface ModuloCatalogo {
    idModulo: string;
    lecciones: LeccionCatalogo[];
}
export interface EstructuraCursoCatalogo {
    idCurso: string;
    versionCurso: string;
    modulos: ModuloCatalogo[];
}
export declare class CatalogoClient {
    verificarAcceso(idUsuario: string, idCurso: string, token: string): Promise<void>;
    obtenerEstructura(idCurso: string, versionCurso: string, token: string): Promise<EstructuraCursoCatalogo>;
    private path;
    private get;
}
