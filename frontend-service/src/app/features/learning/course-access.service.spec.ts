import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { acquired, draft, student } from '../../testing/course-fixtures';
import { CourseAccess } from './course-access.service';
describe('Accesos vigentes', () => {
  let access: CourseAccess;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    access = TestBed.inject(CourseAccess);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify({ ignoreCancelled: true }));
  it('consulta la sesión sin enviar IDs y bloquea cursos adquiridos', () => {
    access.setAccount(student);
    const req = http.expectOne('/api/cuenta/mis-cursos');
    expect(req.request.params.keys()).toEqual([]);
    expect(req.request.headers.has('X-Student-Id')).toBe(false);
    expect(access.canRequest(draft.id)).toBe(false);
    req.flush([acquired]);
    expect(access.hasAccess(draft.id)).toBe(true);
    expect(access.canRequest(draft.id)).toBe(false);
  });
  it('permite solicitar cuando Catálogo confirma que no hay acceso', () => {
    access.setAccount(student);
    http.expectOne('/api/cuenta/mis-cursos').flush([]);
    expect(access.canRequest(draft.id)).toBe(true);
  });
  it('no convierte un error en una compra inexistente y permite reintentar', () => {
    access.setAccount(student);
    http.expectOne('/api/cuenta/mis-cursos').flush({}, { status: 503, statusText: 'Unavailable' });
    expect(access.state()).toBe('error');
    expect(access.canRequest(draft.id)).toBe(false);
    access.refresh();
    http.expectOne('/api/cuenta/mis-cursos').flush([acquired]);
    expect(access.hasAccess(draft.id)).toBe(true);
  });
  it('cancela la consulta del usuario anterior al cambiar de cuenta', () => {
    access.setAccount(student);
    const old = http.expectOne('/api/cuenta/mis-cursos');
    access.setAccount({ ...student, id: 'otro-alumno' });
    expect(old.cancelled).toBe(true);
    http.expectOne('/api/cuenta/mis-cursos').flush([]);
    expect(access.hasAccess(draft.id)).toBe(false);
  });
  it('borra accesos al salir y no consulta compras de alumno para un ADMIN', () => {
    access.setAccount(student);
    http.expectOne('/api/cuenta/mis-cursos').flush([acquired]);
    access.setAccount(null);
    expect(access.hasAccess(draft.id)).toBe(false);
    access.setAccount({ ...student, rol: 'ADMIN' });
    http.expectNone('/api/cuenta/mis-cursos');
    expect(access.state()).toBe('guest');
  });
});
