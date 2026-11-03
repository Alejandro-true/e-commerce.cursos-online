import { ContentVersion } from './content.types';

export interface PublicationCheck {
  label: string;
  complete: boolean;
}

export function publicationChecks(
  course: { estado: string; precioBase: number | null; moneda: string | null },
  version: ContentVersion,
): PublicationCheck[] {
  const lessons = version.modulos.flatMap((module) => module.lecciones);
  return [
    {
      label: 'Versión en borrador y curso sin archivar',
      complete: version.estado === 'BORRADOR' && course.estado !== 'ARCHIVADO',
    },
    {
      label: 'Precio y moneda configurados',
      complete: (course.precioBase ?? 0) > 0 && !!course.moneda,
    },
    { label: 'Al menos un módulo', complete: version.modulos.length > 0 },
    { label: 'Al menos una lección', complete: lessons.length > 0 },
    {
      label: 'Video listo en una lección obligatoria',
      complete: lessons.some(
        (lesson) => lesson.tipo === 'VIDEO' && lesson.obligatorio && lesson.estadoVideo === 'LISTO',
      ),
    },
  ];
}
