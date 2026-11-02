import { CatalogoClient } from '../integrations/catalogo.client';
import { CompletarLeccionModuloDto } from '../dto/completar-leccion-modulo.dto';
import { ProgresoModuloRepository } from '../repositories/progreso-modulo.repository';
export declare class ProgresoModuloService {
    private readonly repositorio;
    private readonly catalogo;
    constructor(repositorio: ProgresoModuloRepository, catalogo: CatalogoClient);
    completarLeccion(idUsuario: string, dto: CompletarLeccionModuloDto, token: string, idempotencyKey: string): Promise<{
        idUsuario: string;
        idCurso: string;
        versionCurso: string;
        idModulo: string;
        modulo: {
            leccionesCompletadas: number;
            totalLecciones: number;
            porcentaje: number;
            completado: boolean;
            fechaCompletado: Date | undefined;
        };
        curso: {
            leccionesCompletadas: number;
            totalLecciones: number;
            porcentaje: number;
        };
        ultimaLeccionId: string | undefined;
        ultimoAcceso: Date;
    }>;
    private construirRespuesta;
}
