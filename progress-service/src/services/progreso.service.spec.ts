import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProgresoService } from './progreso.service';
import { ProgresoCurso, EstadoProgreso } from '../models/progreso-curso.schema';

describe('ProgresoService', () => {
  let servicio: ProgresoService;

  class MockProgresoCursoModelo {
    save: jest.Mock;

    constructor(dto: any) {
      Object.assign(this, dto);
      this.save = jest.fn().mockImplementation(() => Promise.resolve(this));
    }

    static findOne = jest.fn();
    static find = jest.fn();
    static deleteOne = jest.fn();
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        ProgresoService,
        {
          provide: getModelToken(ProgresoCurso.name),
          useValue: MockProgresoCursoModelo,
        },
      ],
    }).compile();

    servicio = modulo.get<ProgresoService>(ProgresoService);
  });

  it('debe estar definido', () => {
    expect(servicio).toBeDefined();
  });

  describe('completarLeccion', () => {
    it('debe registrar lección completada y calcular 25% si total de lecciones es 4', async () => {
      const mockGuardar = jest.fn();
      const mockDoc: any = {
        idUsuario: 'usuario-1',
        idCurso: 'curso-1',
        totalLecciones: 4,
        leccionesCompletadas: 0,
        porcentaje: 0,
        estado: EstadoProgreso.NO_INICIADO,
        lecciones: [],
        certificadoElegible: false,
      };
      mockDoc.save = mockGuardar.mockImplementation(() => Promise.resolve(mockDoc));

      MockProgresoCursoModelo.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      const resultado = await servicio.completarLeccion({
        idUsuario: 'usuario-1',
        idCurso: 'curso-1',
        idLeccion: 'leccion-101',
        tituloLeccion: 'Introducción',
      });

      expect(resultado.leccionesCompletadas).toBe(1);
      expect(resultado.porcentaje).toBe(25);
      expect(resultado.estado).toBe(EstadoProgreso.EN_PROGRESO);
      expect(resultado.certificadoElegible).toBe(false);
      expect(resultado.lecciones.length).toBe(1);
      expect(resultado.lecciones[0].completada).toBe(true);
      expect(mockGuardar).toHaveBeenCalled();
    });

    it('debe marcar curso como COMPLETADO y certificadoElegible si llega al 100%', async () => {
      const mockDoc: any = {
        idUsuario: 'usuario-1',
        idCurso: 'curso-1',
        totalLecciones: 2,
        leccionesCompletadas: 1,
        porcentaje: 50,
        estado: EstadoProgreso.EN_PROGRESO,
        lecciones: [
          {
            idLeccion: 'leccion-1',
            completada: true,
            fechaCompletada: new Date(),
            segundoActual: 60,
          },
        ],
        certificadoElegible: false,
      };
      mockDoc.save = jest.fn().mockImplementation(() => Promise.resolve(mockDoc));

      MockProgresoCursoModelo.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      const resultado = await servicio.completarLeccion({
        idUsuario: 'usuario-1',
        idCurso: 'curso-1',
        idLeccion: 'leccion-2',
      });

      expect(resultado.leccionesCompletadas).toBe(2);
      expect(resultado.porcentaje).toBe(100);
      expect(resultado.estado).toBe(EstadoProgreso.COMPLETADO);
      expect(resultado.certificadoElegible).toBe(true);
      expect(resultado.fechaCompletado).toBeDefined();
    });
  });

  describe('guardarPosicion', () => {
    it('debe marcar automáticamente como completada si supera el 90% del video', async () => {
      const mockDoc: any = {
        idUsuario: 'usuario-1',
        idCurso: 'curso-1',
        totalLecciones: 1,
        leccionesCompletadas: 0,
        porcentaje: 0,
        estado: EstadoProgreso.NO_INICIADO,
        lecciones: [],
        certificadoElegible: false,
      };
      mockDoc.save = jest.fn().mockImplementation(() => Promise.resolve(mockDoc));

      MockProgresoCursoModelo.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      const resultado = await servicio.guardarPosicion({
        idUsuario: 'usuario-1',
        idCurso: 'curso-1',
        idLeccion: 'leccion-1',
        segundoActual: 95,
        duracionSegundos: 100, // 95% visto
      });

      expect(resultado.lecciones[0].completada).toBe(true);
      expect(resultado.porcentaje).toBe(100);
      expect(resultado.estado).toBe(EstadoProgreso.COMPLETADO);
    });
  });

  describe('desmarcarLeccion', () => {
    it('debe desmarcar la lección y recalcular el avance hacia abajo', async () => {
      const mockDoc: any = {
        idUsuario: 'usuario-1',
        idCurso: 'curso-1',
        totalLecciones: 2,
        leccionesCompletadas: 2,
        porcentaje: 100,
        estado: EstadoProgreso.COMPLETADO,
        lecciones: [
          { idLeccion: 'leccion-1', completada: true },
          { idLeccion: 'leccion-2', completada: true },
        ],
        certificadoElegible: true,
      };
      mockDoc.save = jest.fn().mockImplementation(() => Promise.resolve(mockDoc));

      MockProgresoCursoModelo.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      const resultado = await servicio.desmarcarLeccion({
        idUsuario: 'usuario-1',
        idCurso: 'curso-1',
        idLeccion: 'leccion-2',
      });

      expect(resultado.leccionesCompletadas).toBe(1);
      expect(resultado.porcentaje).toBe(50);
      expect(resultado.estado).toBe(EstadoProgreso.EN_PROGRESO);
      expect(resultado.certificadoElegible).toBe(false);
    });
  });
});
