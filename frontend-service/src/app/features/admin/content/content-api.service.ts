import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { switchMap } from 'rxjs';
import { ApiService } from '../../../core/api.service';
import { CourseContent, LessonForm } from './content.types';

@Injectable({ providedIn: 'root' })
export class ContentApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(ApiService);
  private path(courseId: string) {
    return `/api/demo/admin/contenido/${encodeURIComponent(courseId)}`;
  }

  getContent(courseId: string) {
    return this.http.get<CourseContent>(this.path(courseId));
  }
  createVersion(courseId: string, numeroVersion: string) {
    return this.post(`${this.path(courseId)}/versiones`, { numeroVersion });
  }
  createModule(
    courseId: string,
    versionId: string,
    data: { titulo: string; descripcion: string; orden: number },
  ) {
    return this.post(
      `${this.path(courseId)}/versiones/${encodeURIComponent(versionId)}/modulos`,
      data,
    );
  }
  createLesson(courseId: string, moduleId: string, data: LessonForm) {
    return this.post(
      `${this.path(courseId)}/modulos/${encodeURIComponent(moduleId)}/lecciones`,
      data,
    );
  }
  createResource(
    courseId: string,
    lessonId: string,
    data: { nombre: string; archivoReferencia: string; tipoArchivo: string },
  ) {
    return this.post(
      `${this.path(courseId)}/lecciones/${encodeURIComponent(lessonId)}/recursos`,
      data,
    );
  }
  publish(courseId: string, versionId: string) {
    return this.post(
      `${this.path(courseId)}/versiones/${encodeURIComponent(versionId)}/publicar`,
      {},
    );
  }
  archive(courseId: string) {
    return this.post(`${this.path(courseId)}/archivar`, {});
  }
  uploadVideo(courseId: string, lessonId: string, file: File) {
    const data = new FormData();
    data.append('archivo', file);
    return this.post(
      `/api/demo/admin/videos/cursos/${encodeURIComponent(courseId)}/lecciones/${encodeURIComponent(lessonId)}`,
      data,
    );
  }

  private post(url: string, body: unknown) {
    return this.session.getAuthCsrf().pipe(
      switchMap((csrf) =>
        this.http.post<unknown>(url, body, {
          headers: { [csrf.nombreHeader]: csrf.token },
        }),
      ),
    );
  }
}
