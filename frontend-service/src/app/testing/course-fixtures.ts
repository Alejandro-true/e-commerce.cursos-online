import {
  AcquiredCourse,
  AdminCourse,
  CourseDetail,
  CourseProgress,
  CurrentStudent,
} from '../core/api.service';
import { CourseContent, ContentVersion } from '../features/admin/content/content.types';
export const student: CurrentStudent = {
  id: 'alumno-1',
  nombre: 'Estudiante',
  email: 'alumno@ejemplo.test',
  rol: 'ESTUDIANTE',
};
export const draft: AdminCourse = {
  id: 'curso-1',
  categoriaId: 'categoria-1',
  categoria: 'Programación',
  titulo: 'Java inicial',
  slug: 'java-inicial',
  descripcion: 'Curso inicial',
  nivel: 'BASICO',
  miniaturaUrl: null,
  estado: 'BORRADOR',
  precioBase: 50,
  moneda: 'PEN',
};
export const acquired: AcquiredCourse = {
  cursoId: draft.id,
  titulo: draft.titulo,
  cursoVersionId: 'version-1',
  numeroVersion: '1.0',
  fechaOtorgamiento: '2026-01-01T00:00:00Z',
  fechaExpiracion: null,
};
export const version: ContentVersion = {
  id: 'version-1',
  numeroVersion: '1.0',
  estado: 'BORRADOR',
  ofertada: false,
  modulos: [
    {
      id: 'modulo-1',
      titulo: 'Introducción',
      descripcion: '',
      orden: 1,
      lecciones: [
        {
          id: 'leccion-1',
          titulo: 'Bienvenida',
          tipo: 'VIDEO',
          estadoVideo: 'PENDIENTE',
          obligatorio: true,
          orden: 1,
          recursos: [],
        },
      ],
    },
  ],
};
export const content: CourseContent = {
  cursoId: draft.id,
  titulo: draft.titulo,
  estado: 'BORRADOR',
  versiones: [version],
};
export const detail: CourseDetail = {
  id: draft.id,
  titulo: draft.titulo,
  slug: draft.slug,
  descripcion: draft.descripcion,
  nivel: draft.nivel,
  cursoVersionId: 'version-1',
  numeroVersion: '1.0',
  modulos: [
    {
      id: 'modulo-1',
      titulo: 'Introducción',
      orden: 1,
      lecciones: [
        { id: 'leccion-1', titulo: 'Bienvenida', tipo: 'VIDEO', obligatorio: true, orden: 1 },
      ],
    },
  ],
};
export const fullProgress: CourseProgress = {
  idUsuario: student.id,
  idCurso: draft.id,
  versionCurso: 'version-1',
  curso: { leccionesCompletadas: 1, totalLecciones: 1, porcentaje: 100 },
  modulos: [
    {
      idModulo: 'modulo-1',
      leccionesCompletadasIds: ['leccion-1'],
      leccionesCompletadas: 1,
      totalLecciones: 1,
      porcentaje: 100,
      completado: true,
    },
  ],
};
