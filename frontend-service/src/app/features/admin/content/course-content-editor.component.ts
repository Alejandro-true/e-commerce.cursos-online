import { Component, DestroyRef, OnInit, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Observable, finalize } from 'rxjs';
import { ContentApi } from './content-api.service';
import { contentError } from './content-error';
import { publicationChecks } from './publication-checks';
import { AdminCourse } from '../../../core/api.service';
import { ContentVersion, CourseContent, LessonForm } from './content.types';

@Component({
  selector: 'app-admin-content',
  imports: [FormsModule],
  templateUrl: './course-content-editor.component.html',
  styleUrl: './course-content-editor.component.scss',
})
export class CourseContentEditor implements OnInit {
  private readonly api = inject(ContentApi);
  private readonly destroyRef = inject(DestroyRef);
  readonly course = input.required<AdminCourse>();
  readonly back = output<void>();
  readonly changed = output<void>();
  readonly content = signal<CourseContent | null>(null);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly kind = signal<'version' | 'module' | 'lesson' | 'resource' | null>(null);
  parent = '';
  title = '';
  description = '';
  order = 1;
  versionNumber = '';
  lessonType: 'LECTURA' | 'VIDEO' = 'VIDEO';
  lessonText = '';
  duration: number | null = null;
  requiredLesson = true;
  resourceReference = '';
  resourceType = 'PDF';

  ngOnInit(): void {
    this.reload();
  }
  reload(): void {
    this.error.set('');
    this.loading.set(true);
    this.api
      .getContent(this.course().id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (content) => this.content.set(content),
        error: (error) => this.error.set(contentError(error)),
      });
  }
  editable(version: ContentVersion): boolean {
    return version.estado === 'BORRADOR' && this.content()?.estado !== 'ARCHIVADO';
  }
  nextOrder(items: { orden: number }[]): number {
    return Math.max(0, ...items.map((i) => i.orden)) + 1;
  }
  open(kind: 'version' | 'module' | 'lesson' | 'resource', parent = '', order = 1): void {
    this.kind.set(kind);
    this.parent = parent;
    this.order = order;
    this.title = '';
    this.description = '';
    this.versionNumber = '';
    this.lessonText = '';
    this.lessonType = 'VIDEO';
    this.requiredLesson = true;
    this.duration = null;
    this.resourceReference = '';
    this.resourceType = 'PDF';
    this.error.set('');
    this.notice.set('');
    setTimeout(() =>
      document
        .getElementById('content-form')
        ?.scrollIntoView?.({ behavior: 'smooth', block: 'center' }),
    );
  }
  save(): void {
    if (this.busy()) return;
    const id = this.course().id;
    let operation: Observable<unknown>;
    switch (this.kind()) {
      case 'version':
        operation = this.api.createVersion(id, this.versionNumber.trim());
        break;
      case 'module':
        operation = this.api.createModule(id, this.parent, {
          titulo: this.title,
          descripcion: this.description,
          orden: this.order,
        });
        break;
      case 'lesson': {
        const form: LessonForm = {
          titulo: this.title,
          descripcion: this.description,
          tipo: this.lessonType,
          contenidoTexto: this.lessonType === 'LECTURA' ? this.lessonText : null,
          videoReferencia: null,
          estadoVideo: this.lessonType === 'LECTURA' ? 'NO_APLICA' : 'PENDIENTE',
          duracionSegundos: this.duration,
          obligatorio: this.requiredLesson,
          orden: this.order,
        };
        operation = this.api.createLesson(id, this.parent, form);
        break;
      }
      case 'resource':
        operation = this.api.createResource(id, this.parent, {
          nombre: this.title,
          archivoReferencia: this.resourceReference,
          tipoArchivo: this.resourceType,
        });
        break;
      default:
        return;
    }
    this.perform(operation, 'Contenido guardado.');
  }
  checks(version: ContentVersion) {
    return publicationChecks(
      { ...this.course(), estado: this.content()?.estado ?? this.course().estado },
      version,
    );
  }
  canPublish(version: ContentVersion): boolean {
    return this.checks(version).every((check) => check.complete);
  }
  publish(version: ContentVersion): void {
    if (this.busy() || this.loading()) return;
    if (!this.canPublish(version)) {
      this.error.set(
        'Completa los requisitos de publicación, incluido el video de una lección obligatoria.',
      );
      return;
    }
    if (
      window.confirm(
        `¿Publicar la versión ${version.numeroVersion}? Su contenido quedará protegido contra cambios.`,
      )
    ) {
      this.perform(
        this.api.publish(this.course().id, version.id),
        'Versión publicada. Ya está disponible en el catálogo.',
      );
    }
  }
  archive(): void {
    if (
      window.confirm('¿Archivar este curso? Se conservarán las compras y el contenido histórico.')
    ) {
      this.perform(this.api.archive(this.course().id), 'Curso archivado.');
    }
  }
  upload(lessonId: string, event: Event): void {
    const field = event.target as HTMLInputElement;
    const file = field.files?.[0];
    if (!file || this.busy() || this.loading()) return;
    if (!file.name.toLowerCase().endsWith('.mp4')) {
      this.error.set('Selecciona un archivo MP4.');
      field.value = '';
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      this.error.set('El video debe tener como máximo 200 MB.');
      field.value = '';
      return;
    }
    this.perform(
      this.api.uploadVideo(this.course().id, lessonId, file),
      'Video cargado. La lección está lista.',
    );
    field.value = '';
  }
  private perform(operation: Observable<unknown>, message: string): void {
    if (this.busy() || this.loading()) return;
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    operation
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: () => {
          this.kind.set(null);
          this.notice.set(message);
          this.reload();
          this.changed.emit();
        },
        error: (error) => this.error.set(contentError(error)),
      });
  }
}
