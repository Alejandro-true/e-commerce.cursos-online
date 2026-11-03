import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ApiService,
  AchievementsResponse,
  CourseDetail,
  CourseModule,
  CourseProgress,
  CourseSummary,
  CurrentStudent,
  Review,
} from './core/api.service';

type Section = 'catalog' | 'progress' | 'community';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class App implements OnInit {
  private readonly api = inject(ApiService);

  readonly courses = signal<CourseSummary[]>([]);
  readonly selectedCourse = signal<CourseDetail | null>(null);
  readonly progress = signal<CourseProgress | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly achievements = signal<AchievementsResponse | null>(null);
  readonly currentStudent = signal<CurrentStudent | null>(null);
  readonly activeVideoUrl = signal('');
  readonly section = signal<Section>('catalog');
  readonly loading = signal(false);
  readonly busyLesson = signal<string | null>(null);
  readonly requestingPurchase = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly studentId = signal('');

  reviewRating = 5;
  reviewComment = '';

  ngOnInit(): void {
    this.refreshCourses();
    this.refreshIdentity();
  }

  refreshCourses(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.listCourses().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(this.describeError(error, 'No se pudo cargar el catálogo.'));
        this.loading.set(false);
      },
    });
  }

  selectSection(section: Section): void {
    this.section.set(section);
    this.error.set('');
    this.notice.set('');
    if (section === 'community' && this.selectedCourse()) this.refreshReviews();
    if (section === 'progress' && this.selectedCourse()) this.refreshProgress();
  }

  openCourse(summary: CourseSummary): void {
    this.loading.set(true);
    this.error.set('');
    this.notice.set('');
    this.api.getCourse(summary.id).subscribe({
      next: (course) => {
        this.selectedCourse.set(course);
        this.progress.set(null);
        this.reviews.set([]);
        this.activeVideoUrl.set('');
        this.loading.set(false);
        this.section.set('progress');
        this.refreshProgress();
        this.refreshReviews();
        this.refreshAchievements();
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(this.describeError(error, 'No se pudo abrir el curso.'));
        this.loading.set(false);
      },
    });
  }

  refreshIdentity(): void {
    this.api.getCurrentStudent().subscribe({
      next: (student) => {
        this.currentStudent.set(student);
        this.studentId.set(student.id);
        this.refreshAchievements();
        if (this.selectedCourse()) this.refreshProgress();
      },
      error: () => {
        this.currentStudent.set(null);
        this.studentId.set('');
        this.achievements.set(null);
        this.progress.set(null);
      },
    });
  }

  refreshProgress(): void {
    const course = this.selectedCourse();
    if (!course || !this.studentId()) return;
    this.api.getCourseProgress(course, this.studentId()).subscribe({
      next: (progress) => this.progress.set(progress),
      error: (error: HttpErrorResponse) => {
        this.progress.set(null);
        this.error.set(this.describeError(error, 'No se pudo consultar el progreso.'));
      },
    });
  }

  completeLesson(module: CourseModule, lessonId: string): void {
    const course = this.selectedCourse();
    const lesson = module.lecciones.find((item) => item.id === lessonId);
    if (!course || !lesson || this.isLessonComplete(module.id, lesson.id)) return;

    this.busyLesson.set(lesson.id);
    this.error.set('');
    this.notice.set('');
    this.api.completeLesson(course, module, lesson, this.studentId()).subscribe({
      next: (progress) => {
        this.progress.set(progress);
        this.busyLesson.set(null);
        this.notice.set(`Lección completada. Avance del curso: ${progress.curso.porcentaje}%.`);
        this.refreshAchievements();
      },
      error: (error: HttpErrorResponse) => {
        this.busyLesson.set(null);
        this.error.set(this.describeError(error, 'No se pudo registrar el avance.'));
      },
    });
  }

  playLesson(lessonId: string): void {
    this.error.set('');
    this.activeVideoUrl.set('');
    this.api.getVideoLink(lessonId).subscribe({
      next: (link) => this.activeVideoUrl.set(link.urlTemporal),
      error: (error: HttpErrorResponse) =>
        this.error.set(this.describeError(error, 'No se pudo abrir el video. Verifica tu acceso al curso.')),
    });
  }

  requestPurchase(): void {
    const course = this.selectedCourse();
    if (!course || !this.studentId()) return;
    this.requestingPurchase.set(true);
    this.error.set('');
    this.api.requestCoursePurchase(course.id).subscribe({
      next: (purchase) => {
        this.requestingPurchase.set(false);
        this.notice.set(`Solicitud creada (${purchase.estado}). El acceso se habilitará al confirmarse la compra.`);
      },
      error: (error: HttpErrorResponse) => {
        this.requestingPurchase.set(false);
        this.error.set(this.describeError(error, 'No se pudo solicitar la compra.'));
      },
    });
  }

  isLessonComplete(moduleId: string, lessonId: string): boolean {
    const module = this.selectedCourse()?.modulos.find((item) => item.id === moduleId);
    const item = this.progress()?.modulos.find((progress) => progress.idModulo === moduleId);
    if (!module || !item) return false;
    return item.leccionesCompletadasIds.includes(lessonId);
  }

  moduleProgress(moduleId: string): number {
    return this.progress()?.modulos.find((item) => item.idModulo === moduleId)?.porcentaje ?? 0;
  }

  totalLessons(course: CourseDetail): number {
    return course.modulos.reduce(
      (total, module) => total + module.lecciones.filter((lesson) => lesson.obligatorio).length,
      0,
    );
  }

  refreshReviews(): void {
    const course = this.selectedCourse();
    if (!course) return;
    this.api.listReviews(course.id).subscribe({
      next: (reviews) => this.reviews.set(reviews),
      error: (error: HttpErrorResponse) =>
        this.error.set(this.describeError(error, 'No se pudieron cargar las reseñas.')),
    });
  }

  submitReview(): void {
    const course = this.selectedCourse();
    if (!course) return;
    this.error.set('');
    this.api
      .createReview(course.id, this.reviewRating, this.reviewComment.trim(), this.studentId())
      .subscribe({
        next: (review) => {
          this.reviews.update((reviews) => [review, ...reviews]);
          this.reviewComment = '';
          this.notice.set('Tu reseña quedó publicada.');
        },
        error: (error: HttpErrorResponse) =>
          this.error.set(this.describeError(error, 'No se pudo publicar la reseña.')),
      });
  }

  refreshAchievements(): void {
    if (!this.studentId()) return;
    this.api.getAchievements(this.studentId()).subscribe({
      next: (achievements) => this.achievements.set(achievements),
      error: () => this.achievements.set(null),
    });
  }

  backToCatalog(): void {
    this.selectedCourse.set(null);
    this.progress.set(null);
    this.activeVideoUrl.set('');
    this.section.set('catalog');
    this.error.set('');
    this.notice.set('');
  }

  private describeError(error: HttpErrorResponse, fallback: string): string {
    const detail = error.error?.detail ?? error.error?.message;
    if (typeof detail === 'string') return detail;
    if (error.status === 0) return 'No hay conexión con los microservicios. Verifica que estén iniciados.';
    if (error.status === 401 || error.status === 403) {
      return 'Tu usuario no tiene acceso a este curso o el servicio rechazó la solicitud.';
    }
    return fallback;
  }
}
