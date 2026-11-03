export interface Resource {
  id: string;
  nombre: string;
  tipoArchivo: string;
}
export interface ContentLesson {
  id: string;
  titulo: string;
  tipo: string;
  estadoVideo: string;
  obligatorio: boolean;
  orden: number;
  recursos: Resource[];
}
export interface ContentModule {
  id: string;
  titulo: string;
  descripcion: string;
  orden: number;
  lecciones: ContentLesson[];
}
export interface ContentVersion {
  id: string;
  numeroVersion: string;
  estado: string;
  ofertada: boolean;
  modulos: ContentModule[];
}
export interface CourseContent {
  cursoId: string;
  titulo: string;
  estado: string;
  versiones: ContentVersion[];
}
export interface LessonForm {
  titulo: string;
  descripcion: string;
  tipo: 'LECTURA' | 'VIDEO';
  contenidoTexto: string | null;
  videoReferencia: null;
  estadoVideo: 'NO_APLICA' | 'PENDIENTE';
  duracionSegundos: number | null;
  obligatorio: boolean;
  orden: number;
}
