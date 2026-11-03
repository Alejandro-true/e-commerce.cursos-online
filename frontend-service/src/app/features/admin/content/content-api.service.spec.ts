import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ContentApi } from './content-api.service';
describe('API de contenido', () => {
  let api: ContentApi;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ContentApi);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('crea una lección pendiente en su módulo con CSRF', () => {
    api
      .createLesson('curso-1', 'modulo-1', {
        titulo: 'Hola',
        descripcion: '',
        tipo: 'VIDEO',
        contenidoTexto: null,
        videoReferencia: null,
        estadoVideo: 'PENDIENTE',
        duracionSegundos: 30,
        obligatorio: true,
        orden: 1,
      })
      .subscribe();
    http.expectOne('/api/demo/auth/csrf').flush({ nombreHeader: 'X-CSRF-TOKEN', token: 'token' });
    const r = http.expectOne('/api/demo/admin/contenido/curso-1/modulos/modulo-1/lecciones');
    expect(r.request.headers.get('X-CSRF-TOKEN')).toBe('token');
    expect(r.request.body.estadoVideo).toBe('PENDIENTE');
    expect(r.request.body.videoReferencia).toBeNull();
    expect(r.request.headers.has('X-Admin-Id')).toBe(false);
    r.flush({ id: 'leccion-1' });
  });
  it('envía el MP4 como multipart con boundary a cargo del navegador', () => {
    const file = new File(['video'], 'leccion.mp4', { type: 'video/mp4' });
    api.uploadVideo('curso-1', 'leccion-1', file).subscribe();
    http.expectOne('/api/demo/auth/csrf').flush({ nombreHeader: 'X-CSRF-TOKEN', token: 'token' });
    const r = http.expectOne('/api/demo/admin/videos/cursos/curso-1/lecciones/leccion-1');
    expect(r.request.body.get('archivo')).toBe(file);
    expect(r.request.headers.has('Content-Type')).toBe(false);
    r.flush({ estadoVideo: 'LISTO' });
  });
});
