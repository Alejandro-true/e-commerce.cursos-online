import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ApiService,
  AdminCategory,
  AdminCourse,
  AdminPurchase,
  AchievementsResponse,
  CourseDetail,
  CourseModule,
  CourseProgress,
  CourseSummary,
  CurrentStudent,
  Review,
} from './core/api.service';

type Section = 'catalog' | 'progress' | 'community' | 'admin';
type Page = 'portal' | 'login' | 'register' | 'account';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class App implements OnInit {
  private readonly api = inject(ApiService);

  readonly page = signal<Page>('portal');
  loginEmail = '';
  loginPassword = '';
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmation = '';
  authBusy = signal(false);
  readonly adminCourses = signal<AdminCourse[]>([]);
  readonly adminCategories = signal<AdminCategory[]>([]);
  readonly adminPurchases = signal<AdminPurchase[]>([]);
  readonly adminTab = signal<'courses' | 'purchases'>('courses');
  readonly adminLoading = signal(false);
  readonly adminBusy = signal(false);
  readonly editingAdminCourseId = signal<string | null>(null);
  adminCourseForm = this.emptyAdminCourseForm();

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
    const initialPath = window.location.pathname;
    this.page.set(this.pageFromPath(initialPath));
    if (initialPath === '/admin') this.section.set('admin');
    window.addEventListener('popstate', () => {
      const path = window.location.pathname;
      this.page.set(this.pageFromPath(path));
      if (path === '/admin') {
        this.section.set('admin');
        this.refreshIdentity();
      } else if (this.page() === 'portal') {
        this.section.set('catalog');
      }
    });
    this.refreshCourses();
    this.refreshIdentity();
  }

  private pageFromPath(path: string): Page {
    if (path === '/ingresar') return 'login';
    if (path === '/registro') return 'register';
    if (path === '/cuenta') return 'account';
    return 'portal';
  }

  navigate(path: string): void {
    window.history.pushState({}, '', path);
    this.page.set(this.pageFromPath(path));
    if (path === '/admin') this.section.set('admin');
    else if (path === '/') this.section.set('catalog');
    this.error.set('');
    this.notice.set('');
    if (path === '/' || path === '/admin') this.refreshIdentity();
  }

  submitLogin(): void {
    this.authBusy.set(true);
    this.error.set('');
    this.api.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => { this.authBusy.set(false); this.loginPassword = ''; this.navigate('/'); },
      error: (error: HttpErrorResponse) => {
        this.authBusy.set(false);
        this.error.set(error.status === 401 ? 'Correo o contraseña incorrectos.' : this.describeError(error, 'No se pudo iniciar sesión.'));
      },
    });
  }

  submitRegistration(): void {
    this.authBusy.set(true);
    this.error.set('');
    this.api.register(this.registerName, this.registerEmail, this.registerPassword, this.registerConfirmation).subscribe({
      next: () => {
        this.authBusy.set(false);
        this.registerPassword = '';
        this.registerConfirmation = '';
        this.notice.set('Cuenta creada. Inicia sesión para continuar.');
        this.navigate('/ingresar');
        this.notice.set('Cuenta creada. Inicia sesión para continuar.');
      },
      error: (error: HttpErrorResponse) => {
        this.authBusy.set(false);
        this.error.set(this.describeError(error, 'No se pudo crear la cuenta.'));
      },
    });
  }

  logout(): void {
    this.api.logout().subscribe({
      next: () => { this.currentStudent.set(null); this.studentId.set(''); this.navigate('/'); },
      error: (error: HttpErrorResponse) => this.error.set(this.describeError(error, 'No se pudo cerrar la sesión.')),
    });
  }

  private emptyAdminCourseForm() {
    return { categoriaId: '', titulo: '', slug: '', descripcion: '', nivel: 'BASICO',
      miniaturaUrl: '', precioBase: 0, moneda: 'PEN' };
  }

  loadAdminPanel(): void {
    if (this.currentStudent()?.rol !== 'ADMIN') return;
    this.adminLoading.set(true);
    this.api.listAdminCourses().subscribe({
      next: (items) => { this.adminCourses.set(items); this.adminLoading.set(false); },
      error: (error: HttpErrorResponse) => { this.adminLoading.set(false); this.error.set(this.describeError(error, 'No se pudieron cargar los cursos.')); },
    });
    this.api.listAdminCategories().subscribe({
      next: (items) => this.adminCategories.set(items),
      error: (error: HttpErrorResponse) => this.error.set(this.describeError(error, 'No se pudieron cargar las categorías.')),
    });
    this.api.listAdminPurchases().subscribe({
      next: (items) => this.adminPurchases.set(items),
      error: (error: HttpErrorResponse) => this.error.set(this.describeError(error, 'No se pudieron cargar las solicitudes de compra.')),
    });
  }

  editAdminCourse(course: AdminCourse): void {
    this.editingAdminCourseId.set(course.id);
    this.adminCourseForm = {
      categoriaId: course.categoriaId,
      titulo: course.titulo,
      slug: course.slug,
      descripcion: course.descripcion,
      nivel: course.nivel,
      miniaturaUrl: course.miniaturaUrl ?? '',
      precioBase: course.precioBase ?? 0,
      moneda: course.moneda ?? 'PEN',
    };
  }

  cancelAdminCourseEdit(): void {
    this.editingAdminCourseId.set(null);
    this.adminCourseForm = this.emptyAdminCourseForm();
  }

  saveAdminCourse(): void {
    this.adminBusy.set(true);
    this.error.set('');
    const payload = { ...this.adminCourseForm, miniaturaUrl: this.adminCourseForm.miniaturaUrl.trim() || null };
    this.api.saveAdminCourse(payload, this.editingAdminCourseId() ?? undefined).subscribe({
      next: () => {
        this.adminBusy.set(false);
        this.notice.set(this.editingAdminCourseId() ? 'Borrador actualizado.' : 'Curso creado como borrador.');
        this.cancelAdminCourseEdit();
        this.loadAdminPanel();
      },
      error: (error: HttpErrorResponse) => { this.adminBusy.set(false); this.error.set(this.describeError(error, 'No se pudo guardar el curso.')); },
    });
  }

  decidePurchase(purchase: AdminPurchase, resultado: 'APROBADO' | 'RECHAZADO' | 'REEMBOLSADO'): void {
    this.adminBusy.set(true);
    this.error.set('');
    this.api.decideAdminPurchase(purchase.compraId, resultado).subscribe({
      next: () => {
        this.adminBusy.set(false);
        this.notice.set(`Solicitud ${resultado.toLowerCase()}.`);
        this.loadAdminPanel();
      },
      error: (error: HttpErrorResponse) => { this.adminBusy.set(false); this.error.set(this.describeError(error, 'No se pudo actualizar la compra.')); },
    });
  }

  deleteAdminCourse(course: AdminCourse): void {
    if (!window.confirm(`¿Eliminar el borrador «${course.titulo}»? Esta acción no se puede deshacer.`)) return;
    this.adminBusy.set(true);
    this.error.set('');
    this.api.deleteAdminCourse(course.id).subscribe({
      next: () => {
        this.adminBusy.set(false);
        this.notice.set('Borrador eliminado.');
        if (this.editingAdminCourseId() === course.id) this.cancelAdminCourseEdit();
        this.loadAdminPanel();
      },
      error: (error: HttpErrorResponse) => { this.adminBusy.set(false); this.error.set(this.describeError(error, 'No se pudo eliminar el curso.')); },
    });
  }

  archiveAdminCourse(course: AdminCourse): void {
    if (!window.confirm(`¿Retirar «${course.titulo}» del catálogo? Se conservará el historial de estudiantes.`)) return;
    this.adminBusy.set(true);
    this.error.set('');
    this.api.archiveAdminCourse(course.id).subscribe({
      next: () => {
        this.adminBusy.set(false);
        this.notice.set('Curso retirado del catálogo.');
        this.loadAdminPanel();
      },
      error: (error: HttpErrorResponse) => { this.adminBusy.set(false); this.error.set(this.describeError(error, 'No se pudo retirar el curso.')); },
    });
  }

  countCoursesByState(state: string): number {
    return this.adminCourses().filter((course) => course.estado === state).length;
  }

  pendingPurchasesCount(): number {
    return this.adminPurchases().filter((purchase) => purchase.estado === 'PENDIENTE').length;
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
    if (section === 'admin' && this.currentStudent()?.rol !== 'ADMIN') return;
    this.section.set(section);
    this.error.set('');
    this.notice.set('');
    if (section === 'community' && this.selectedCourse()) this.refreshReviews();
    if (section === 'progress' && this.selectedCourse()) this.refreshProgress();
    if (section === 'admin') this.loadAdminPanel();
  }

  openCourse(summary: CourseSummary, destination: Section = 'progress'): void {
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
        this.section.set(destination);
        if (destination === 'progress') this.refreshProgress();
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
        if (this.section() === 'admin' && student.rol !== 'ADMIN') {
          this.navigate('/');
          return;
        }
        const esEstudiante = student.rol === 'ESTUDIANTE';
        this.studentId.set(esEstudiante ? student.id : '');
        if (esEstudiante) this.refreshAchievements();
        if (student.rol === 'ADMIN' && this.section() === 'admin') this.loadAdminPanel();
        if (this.selectedCourse()) this.refreshProgress();
      },
      error: () => {
        this.currentStudent.set(null);
        this.studentId.set('');
        this.achievements.set(null);
        this.progress.set(null);
        if (this.section() === 'admin') this.navigate('/');
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
