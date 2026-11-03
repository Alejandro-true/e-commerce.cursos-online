import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';

export interface CourseSummary {
  id: string;
  titulo: string;
  slug: string;
  descripcion: string;
  nivel: string;
  miniaturaUrl?: string | null;
  categoria?: { nombre: string } | null;
  precio?: { monto?: number; moneda?: string } | null;
}

export interface CourseLesson {
  id: string;
  titulo: string;
  descripcion?: string | null;
  tipo: string;
  duracionSegundos?: number | null;
  obligatorio: boolean;
  orden: number;
}

export interface CourseModule {
  id: string;
  titulo: string;
  descripcion?: string | null;
  orden: number;
  lecciones: CourseLesson[];
}

export interface CourseDetail extends CourseSummary {
  cursoVersionId: string;
  numeroVersion: string;
  modulos: CourseModule[];
}

export interface ModuleProgressItem {
  idModulo: string;
  leccionesCompletadasIds: string[];
  leccionesCompletadas: number;
  totalLecciones: number;
  porcentaje: number;
  completado: boolean;
}

export interface CourseProgress {
  idUsuario: string;
  idCurso: string;
  versionCurso: string;
  curso: { leccionesCompletadas: number; totalLecciones: number; porcentaje: number };
  modulos: ModuleProgressItem[];
}

export interface Review {
  id: number;
  curso_id: string;
  estudiante_id: string;
  calificacion: number;
  comentario: string | null;
  oculta: boolean;
  creada_en: string;
}

export interface Achievement {
  modulo_id: string;
  insignia: string;
  otorgada_en: string;
}

export interface AchievementsResponse {
  estudiante_id: string;
  puntos_totales: number;
  insignias: Achievement[];
}

export interface CurrentStudent {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

export interface PurchaseRequest {
  compraId: string;
  estado: string;
}

export interface CsrfResponse { nombreHeader: string; token: string; }

export interface AdminCategory { id: string; nombre: string; }
export interface AdminCourse {
  id: string;
  categoriaId: string;
  categoria: string;
  titulo: string;
  slug: string;
  descripcion: string;
  nivel: string;
  miniaturaUrl: string | null;
  estado: string;
  precioBase: number | null;
  moneda: string | null;
}
export interface AdminCoursePayload {
  categoriaId: string;
  titulo: string;
  slug: string;
  descripcion: string;
  nivel: string;
  miniaturaUrl: string | null;
  precioBase: number;
  moneda: string;
}
export interface AdminPurchase {
  compraId: string;
  estudianteId: string;
  cursoId: string;
  curso: string;
  monto: string;
  moneda: string;
  estado: string;
  acceso: string;
  fechaCompra: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly catalogBase = '/api/catalogo';
  private readonly progressBase = '/api/progreso';
  private readonly communityBase = '/api/comunidad';

  getAuthCsrf(): Observable<CsrfResponse> {
    return this.http.get<CsrfResponse>('/api/demo/auth/csrf');
  }

  register(name: string, email: string, password: string, confirmation: string): Observable<unknown> {
    return this.getAuthCsrf().pipe(switchMap((csrf) => this.http.post(
      '/api/demo/auth/registro', { nombre: name, email, password, confirmacion: confirmation },
      { headers: { [csrf.nombreHeader]: csrf.token } },
    )));
  }

  login(email: string, password: string): Observable<string> {
    return this.getAuthCsrf().pipe(switchMap((csrf) => this.http.post(
      '/api/demo/auth/login', new HttpParams().set('username', email).set('password', password).toString(),
      { headers: { [csrf.nombreHeader]: csrf.token, 'Content-Type': 'application/x-www-form-urlencoded' }, responseType: 'text' },
    )));
  }

  logout(): Observable<string> {
    return this.getAuthCsrf().pipe(switchMap((csrf) => this.http.post(
      '/api/demo/auth/logout', '',
      { headers: { [csrf.nombreHeader]: csrf.token }, responseType: 'text' },
    )));
  }

  getCurrentStudent(): Observable<CurrentStudent> {
    return this.http.get<CurrentStudent>('/api/demo/auth/me');
  }

  listAdminCourses(): Observable<AdminCourse[]> {
    return this.http.get<AdminCourse[]>('/api/demo/admin/cursos');
  }

  listAdminCategories(): Observable<AdminCategory[]> {
    return this.http.get<AdminCategory[]>('/api/demo/admin/cursos/categorias');
  }

  listAdminPurchases(): Observable<AdminPurchase[]> {
    return this.http.get<AdminPurchase[]>('/api/demo/panel/compras');
  }

  saveAdminCourse(payload: AdminCoursePayload, id?: string): Observable<unknown> {
    return this.getAuthCsrf().pipe(switchMap((csrf) => {
      const options = { headers: { [csrf.nombreHeader]: csrf.token } };
      return id
        ? this.http.put(`/api/demo/admin/cursos/${encodeURIComponent(id)}`, payload, options)
        : this.http.post('/api/demo/admin/cursos', payload, options);
    }));
  }

  deleteAdminCourse(id: string): Observable<void> {
    return this.getAuthCsrf().pipe(switchMap((csrf) => this.http.delete<void>(
      `/api/demo/admin/cursos/${encodeURIComponent(id)}`,
      { headers: { [csrf.nombreHeader]: csrf.token } },
    )));
  }

  archiveAdminCourse(id: string): Observable<unknown> {
    return this.getAuthCsrf().pipe(switchMap((csrf) => this.http.post(
      `/api/demo/admin/contenido/${encodeURIComponent(id)}/archivar`, {},
      { headers: { [csrf.nombreHeader]: csrf.token } },
    )));
  }

  decideAdminPurchase(id: string, resultado: 'APROBADO' | 'RECHAZADO' | 'REEMBOLSADO'): Observable<unknown> {
    return this.getAuthCsrf().pipe(switchMap((csrf) => this.http.post(
      `/api/demo/panel/compras/${encodeURIComponent(id)}/decision`, { resultado },
      { headers: { [csrf.nombreHeader]: csrf.token } },
    )));
  }

  requestCoursePurchase(courseId: string): Observable<PurchaseRequest> {
    return this.http.get<{ nombreHeader: string; token: string }>('/api/cuenta/csrf').pipe(
      switchMap((csrf) =>
        this.http.post<PurchaseRequest>(
          '/api/cuenta/compras',
          { cursoId: courseId },
          { headers: { [csrf.nombreHeader]: csrf.token } },
        ),
      ),
    );
  }

  getVideoLink(lessonId: string): Observable<{ urlTemporal: string; expiraEn: string }> {
    return this.http.get<{ urlTemporal: string; expiraEn: string }>(
      `/api/demo/video/lecciones/${encodeURIComponent(lessonId)}/enlace`,
    );
  }

  listCourses(): Observable<CourseSummary[]> {
    return this.http.get<CourseSummary[]>(`${this.catalogBase}/cursos`);
  }

  getCourse(id: string): Observable<CourseDetail> {
    return this.http.get<CourseDetail>(`${this.catalogBase}/cursos/${encodeURIComponent(id)}`);
  }

  getCourseProgress(course: CourseDetail, studentId: string): Observable<CourseProgress> {
    return this.http.get<CourseProgress>(
      `${this.progressBase}/modulo/curso/${encodeURIComponent(course.id)}/version/${encodeURIComponent(course.cursoVersionId)}`,
      { headers: this.studentHeaders(studentId) },
    );
  }

  completeLesson(
    course: CourseDetail,
    module: CourseModule,
    lesson: CourseLesson,
    studentId: string,
  ): Observable<CourseProgress> {
    return this.http.post<CourseProgress>(
      `${this.progressBase}/modulo/completar-leccion`,
      {
        idCurso: course.id,
        versionCurso: course.cursoVersionId,
        idModulo: module.id,
        idLeccion: lesson.id,
      },
      { headers: this.studentHeaders(studentId).set('Idempotency-Key', crypto.randomUUID()) },
    );
  }

  listReviews(courseId: string): Observable<Review[]> {
    const params = new HttpParams().set('curso_id', courseId).set('limit', 100).set('offset', 0);
    return this.http.get<Review[]>(`${this.communityBase}/resenas`, { params });
  }

  createReview(
    courseId: string,
    rating: number,
    comment: string,
    studentId: string,
  ): Observable<Review> {
    return this.http.post<Review>(
      `${this.communityBase}/resenas`,
      { curso_id: courseId, calificacion: rating, comentario: comment || null },
      { headers: this.studentHeaders(studentId) },
    );
  }

  getAchievements(studentId: string): Observable<AchievementsResponse> {
    return this.http.get<AchievementsResponse>(`${this.communityBase}/logros/me`, {
      headers: this.studentHeaders(studentId),
    });
  }

  private studentHeaders(studentId: string): HttpHeaders {
    return new HttpHeaders({ 'X-Student-Id': studentId });
  }
}
