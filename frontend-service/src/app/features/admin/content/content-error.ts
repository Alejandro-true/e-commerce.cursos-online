import { HttpErrorResponse } from '@angular/common/http';

export function contentError(error: HttpErrorResponse): string {
  if (error.status === 401) return 'Tu sesión terminó. Inicia sesión otra vez.';
  if (error.status === 403)
    return 'La operación requiere una sesión de administrador vigente. Vuelve a ingresar.';
  if (error.status === 413) return 'El video supera el tamaño permitido de 200 MB.';
  if (error.status === 0)
    return 'No se pudo conectar con Catálogo. Revisa que el servicio esté funcionando.';
  const detail = error.error?.detail ?? error.error?.message ?? error.error?.error;
  return typeof detail === 'string' ? detail : 'No se pudo guardar el cambio. Inténtalo de nuevo.';
}
