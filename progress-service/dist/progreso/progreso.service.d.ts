import { ProgresoCursoDocument } from './models/progreso-curso.schema';
import { CompletarLeccionDto } from '../dto/completar-leccion.dto';
import { DesmarcarLeccionDto } from '../dto/desmarcar-leccion.dto';
import { GuardarPosicionDto } from '../dto/guardar-posicion.dto';
import { InicializarProgresoDto } from '../dto/inicializar-progreso.dto';
import { ProgresoCursoRepository } from '../repositories/progreso-curso.repository';
export declare class ProgresoService {
    private readonly repositorio;
    constructor(repositorio: ProgresoCursoRepository);
    inicializarProgreso(dto: InicializarProgresoDto): Promise<ProgresoCursoDocument>;
    completarLeccion(dto: CompletarLeccionDto): Promise<ProgresoCursoDocument>;
    desmarcarLeccion(dto: DesmarcarLeccionDto): Promise<ProgresoCursoDocument>;
    guardarPosicion(dto: GuardarPosicionDto): Promise<ProgresoCursoDocument>;
    obtenerProgreso(idUsuario: string, idCurso: string): Promise<ProgresoCursoDocument>;
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
    }>;
    obtenerMetricasCurso(idCurso: string): Promise<{
        idCurso: string;
        totalInscritos: number;
        estudiantesCompletados: number;
        estudiantesEnProgreso: number;
        tasaFinalizacion: number;
        promedioAvanceCurso: number;
    }>;
    reiniciarProgreso(idUsuario: string, idCurso: string): Promise<ProgresoCursoDocument>;
    eliminarProgreso(idUsuario: string, idCurso: string): Promise<{
        mensaje: string;
    }>;
    private recalcularProgreso;
}
