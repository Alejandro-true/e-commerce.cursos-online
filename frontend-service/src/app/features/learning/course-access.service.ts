import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService, CurrentStudent } from '../../core/api.service';

@Injectable({ providedIn: 'root' })
export class CourseAccess implements OnDestroy {
  private readonly api = inject(ApiService);
  private accountId = '';
  private request: Subscription | null = null;
  readonly state = signal<'guest' | 'loading' | 'ready' | 'error'>('guest');
  private readonly courseIds = signal<ReadonlySet<string>>(new Set());

  setAccount(account: CurrentStudent | null): void {
    this.request?.unsubscribe();
    this.accountId = account?.rol === 'ESTUDIANTE' ? account.id : '';
    this.courseIds.set(new Set());
    this.state.set('guest');
    if (this.accountId) this.refresh();
  }

  refresh(): void {
    this.request?.unsubscribe();
    if (!this.accountId) return;
    const accountId = this.accountId;
    this.courseIds.set(new Set());
    this.state.set('loading');
    this.request = this.api.listMyCourses().subscribe({
      next: (courses) => {
        if (this.accountId !== accountId) return;
        this.courseIds.set(new Set(courses.map((course) => course.cursoId)));
        this.state.set('ready');
      },
      error: () => {
        if (this.accountId === accountId) this.state.set('error');
      },
    });
  }

  hasAccess(courseId: string): boolean {
    return this.state() === 'ready' && this.courseIds().has(courseId);
  }

  canRequest(courseId: string): boolean {
    return this.state() === 'ready' && !this.courseIds().has(courseId);
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
  }
}
