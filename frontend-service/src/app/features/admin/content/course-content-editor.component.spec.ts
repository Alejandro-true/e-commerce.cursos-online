import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { content, draft, version } from '../../../testing/course-fixtures';
import { ContentApi } from './content-api.service';
import { CourseContentEditor } from './course-content-editor.component';
describe('Editor de lecciones y video', () => {
  const mocks = () => ({
    getContent: vi.fn(() => of(structuredClone(content))),
    uploadVideo: vi.fn(() => of({})),
    createLesson: vi.fn(() => of({ id: 'nueva-leccion' })),
    publish: vi.fn(() => of({})),
  });
  let api: ReturnType<typeof mocks>;
  beforeEach(async () => {
    api = mocks();
    await TestBed.configureTestingModule({
      imports: [CourseContentEditor],
      providers: [{ provide: ContentApi, useValue: api }],
    }).compileComponents();
  });
  const setup = async () => {
    const f = TestBed.createComponent(CourseContentEditor);
    f.componentRef.setInput('course', draft);
    f.detectChanges();
    await f.whenStable();
    return f;
  };
  const publishButton = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Publicar versión'),
    );
  it('bloquea el botón y la llamada directa si falta video', async () => {
    const f = await setup();
    expect(publishButton(f.nativeElement)?.disabled).toBe(true);
    f.componentInstance.publish(version);
    expect(api.publish).not.toHaveBeenCalled();
  });

  it('permite agregar una lección desde el formulario del módulo borrador', async () => {
    const f = await setup();
    const button = Array.from(
      f.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.includes('＋ Lección'));
    button!.click();
    f.detectChanges();
    await f.whenStable();
    const title = f.nativeElement.querySelector('input[name="titulo"]') as HTMLInputElement;
    title.value = 'Segunda lección';
    title.dispatchEvent(new Event('input'));
    f.detectChanges();
    await f.whenStable();
    f.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    f.detectChanges();
    await f.whenStable();
    expect(api.createLesson).toHaveBeenCalledWith(
      'curso-1',
      'modulo-1',
      expect.objectContaining({
        titulo: 'Segunda lección',
        orden: 2,
        tipo: 'VIDEO',
        estadoVideo: 'PENDIENTE',
        obligatorio: true,
      }),
    );
  });
  it('habilita solo después de subir el MP4 y releer LISTO del servidor', async () => {
    const f = await setup();
    const ready = structuredClone(content);
    ready.versiones[0].modulos[0].lecciones[0].estadoVideo = 'LISTO';
    api.getContent.mockReturnValue(of(ready));
    f.componentInstance.upload('leccion-1', {
      target: { files: [new File(['video'], 'leccion.mp4')], value: '' },
    } as unknown as Event);
    f.detectChanges();
    await f.whenStable();
    expect(api.uploadVideo).toHaveBeenCalledOnce();
    expect(publishButton(f.nativeElement)?.disabled).toBe(false);
  });
  it('no habilita si falla la carga', async () => {
    const f = await setup();
    api.uploadVideo.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 400 })));
    f.componentInstance.upload('leccion-1', {
      target: { files: [new File(['video'], 'leccion.mp4')], value: '' },
    } as unknown as Event);
    f.detectChanges();
    expect(f.componentInstance.canPublish(version)).toBe(false);
    expect(api.publish).not.toHaveBeenCalled();
  });
  it('conserva las versiones publicadas sin edición ni carga de video', async () => {
    const v = structuredClone(content);
    v.estado = 'PUBLICADO';
    v.versiones[0].estado = 'PUBLICADA';
    api.getContent.mockReturnValue(of(v));
    const f = await setup();
    expect(f.nativeElement.querySelector('.version button')).toBeNull();
    expect(f.nativeElement.querySelector('.version input[type=file]')).toBeNull();
  });
});
