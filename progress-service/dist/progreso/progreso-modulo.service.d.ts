import { CatalogoClient } from '../integrations/catalogo.client';
import { CompletarLeccionModuloDto } from '../dto/completar-leccion-modulo.dto';
import { ProgresoModuloRepository } from '../repositories/progreso-modulo.repository';
export declare class ProgresoModuloService {
    private readonly repositorio;
    private readonly catalogo;
    constructor(repositorio: ProgresoModuloRepository, catalogo: CatalogoClient);
    completarLeccion(idUsuario: string, dto: CompletarLeccionModuloDto, token: string, idempotencyKey: string): Promise<{
        idUsuario: any;
        idCurso: any;
        versionCurso: any;
        idModulo: any;
        modulo: {
            leccionesCompletadas: any;
            totalLecciones: any;
            porcentaje: any;
            completado: any;
            fechaCompletado: any;
        };
        curso: {
            leccionesCompletadas: number;
            totalLecciones: number;
            porcentaje: number;
        };
        ultimaLeccionId: any;
        ultimoAcceso: any;
    }>;
    private construirRespuesta;
}
