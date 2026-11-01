import type { Request } from 'express';
import { ProgresoService } from './progreso.service';
import { ProgresoModuloService } from './progreso-modulo.service';
import { CompletarLeccionModuloDto } from '../dto/completar-leccion-modulo.dto';
import { CompletarLeccionDto } from '../dto/completar-leccion.dto';
import { DesmarcarLeccionDto } from '../dto/desmarcar-leccion.dto';
import { GuardarPosicionDto } from '../dto/guardar-posicion.dto';
import { InicializarProgresoDto } from '../dto/inicializar-progreso.dto';
interface AuthenticatedRequest extends Request {
    user: {
        idUsuario: string;
        roles: string[];
    };
}
export declare class ProgresoController {
    private readonly servicioProgreso;
    private readonly servicioModulo;
    constructor(servicioProgreso: ProgresoService, servicioModulo: ProgresoModuloService);
    inicializar(dto: InicializarProgresoDto): Promise<Record<string, unknown>>;
    completarLeccion(dto: CompletarLeccionDto): Promise<Record<string, unknown>>;
    completarLeccionModulo(dto: CompletarLeccionModuloDto, authorization: string | undefined, idempotencyKey: string | undefined, request: AuthenticatedRequest): Promise<{
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
    desmarcarLeccion(dto: DesmarcarLeccionDto): Promise<Record<string, unknown>>;
    guardarPosicion(dto: GuardarPosicionDto): Promise<Record<string, unknown>>;
    obtenerTodosLosProgresosUsuario(idUsuario: string): Promise<{
        resumen: {
            idUsuario: string;
            totalCursosInscritos: number;
            cursosCompletados: number;
            cursosEnProgreso: number;
            cursosNoIniciados: number;
            promedioAvance: number;
        };
        cursos: ProgresoCursoDocument[];
    } & {
        cursos: Record<string, unknown>[];
    }>;
    obtenerMetricasCurso(idCurso: string): Promise<{
        idCurso: string;
        totalInscritos: number;
        estudiantesCompletados: number;
        estudiantesEnProgreso: number;
        tasaFinalizacion: number;
        promedioAvanceCurso: number;
    }>;
    obtenerProgreso(idUsuario: string, idCurso: string): Promise<Record<string, unknown>>;
    reiniciarProgreso(idUsuario: string, idCurso: string): Promise<Record<string, unknown>>;
    eliminarProgreso(idUsuario: string, idCurso: string): Promise<{
        mensaje: string;
    }>;
}
export {};
