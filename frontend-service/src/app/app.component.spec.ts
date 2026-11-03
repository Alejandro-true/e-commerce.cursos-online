import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { App } from './app.component';
import { ApiService, AcquiredCourse } from './core/api.service';
import { ContentApi } from './features/admin/content/content-api.service';
import { acquired, content, detail, draft, fullProgress, student } from './testing/course-fixtures';
describe('Curso adquirido y editor integrado', () => {
  const mocks = () => ({
    listCourses: vi.fn(() => of([detail])),
    getCurrentStudent: vi.fn(() => of(student)),
    listMyCourses: vi.fn(() => of([acquired] as AcquiredCourse[])),
    getCourse: vi.fn(() => of(detail)),
    getCourseProgress: vi.fn(() => of(fullProgress)),
    listReviews: vi.fn(() => of([])),
    getAchievements: vi.fn(() =>
      of({ estudiante_id: student.id, puntos_totales: 0, insignias: [] }),
    ),
    requestCoursePurchase: vi.fn(() => of({ compraId: 'compra-1', estado: 'PENDIENTE' })),
    listAdminCourses: vi.fn(() => of([draft])),
    listAdminCategories: vi.fn(() => of([])),
    listAdminPurchases: vi.fn(() => of([])),
  });
  let api: ReturnType<typeof mocks>;
  let editor: { getContent: ReturnType<typeof vi.fn> };
  beforeEach(async () => {
    window.history.replaceState({}, '', '/');
    api = mocks();
    editor = { getContent: vi.fn(() => of(content)) };
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: ApiService, useValue: api },
        { provide: ContentApi, useValue: editor },
      ],
    }).compileComponents();
  });
  const setup = async () => {
    const f = TestBed.createComponent(App);
    f.detectChanges();
    await f.whenStable();
    f.componentInstance.openCourse(detail);
    f.detectChanges();
    await f.whenStable();
    return f;
  };
  const purchaseButton = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Solicitar acceso al curso'),
    );
  it('oculta el botón para un curso adquirido y bloquea la llamada directa', async () => {
    const f = await setup();
    expect(purchaseButton(f.nativeElement)).toBeUndefined();
    expect(f.nativeElement.textContent).toContain('Ya tienes acceso a este curso');
    f.componentInstance.requestPurchase();
    expect(api.requestCoursePurchase).not.toHaveBeenCalled();
  });
  it('permite solicitar sin acceso aunque exista progreso histórico al 100%', async () => {
    api.listMyCourses.mockReturnValue(of([]));
    const f = await setup();
    expect(f.componentInstance.progress()?.curso.porcentaje).toBe(100);
    expect(purchaseButton(f.nativeElement)).toBeTruthy();
  });
  it('no confunde un error de verificación con falta de compra', async () => {
    api.listMyCourses.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    const f = await setup();
    expect(purchaseButton(f.nativeElement)).toBeUndefined();
    expect(f.nativeElement.textContent).toContain('No se pudo comprobar tu acceso');
  });
  it('abre el editor desde el borrador sin sustituir el panel de cursos', async () => {
    api.getCurrentStudent.mockReturnValue(of({ ...student, rol: 'ADMIN' }));
    const f = TestBed.createComponent(App);
    f.detectChanges();
    f.componentInstance.selectSection('admin');
    f.detectChanges();
    await f.whenStable();
    const b = Array.from(
      f.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.includes('Lecciones y video'));
    expect(b).toBeTruthy();
    b!.click();
    f.detectChanges();
    await f.whenStable();
    expect(f.nativeElement.querySelector('app-admin-content')).toBeTruthy();
    expect(editor.getContent).toHaveBeenCalledWith(draft.id);
    expect(api.listMyCourses).not.toHaveBeenCalled();
  });
});
