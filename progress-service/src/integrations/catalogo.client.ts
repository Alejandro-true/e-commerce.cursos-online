import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

export interface LeccionCatalogo {
  idLeccion: string;
  obligatoria?: boolean;
  tituloLeccion?: string;
  duracionSegundos?: number;
}

export interface ModuloCatalogo {
  idModulo: string;
  lecciones: LeccionCatalogo[];
}

export interface EstructuraCursoCatalogo {
  idCurso: string;
  versionCurso: string;
  modulos: ModuloCatalogo[];
}

@Injectable()
export class CatalogoClient {
  async verificarAcceso(idUsuario: string, idCurso: string, token: string): Promise<void> {
    const path = this.path('CATALOGO_ACCESS_PATH', '/api/accesos/{idUsuario}/{idCurso}')
      .replace('{idUsuario}', encodeURIComponent(idUsuario))
      .replace('{idCurso}', encodeURIComponent(idCurso));
    const respuesta = await this.get(path, token);
    if (respuesta.status === 403 || respuesta.status === 404) {
      throw new ForbiddenException('El usuario no tiene acceso vigente a este curso');
    }
    const datos = (await respuesta.json()) as { activo?: boolean; estado?: string };
    if (!(datos.activo === true || datos.estado === 'ACTIVO')) {
      throw new ForbiddenException('El usuario no tiene acceso vigente a este curso');
    }
  }

  async obtenerEstructura(
    idCurso: string,
    versionCurso: string,
    token: string,
  ): Promise<EstructuraCursoCatalogo> {
    const path = this.path(
      'CATALOGO_STRUCTURE_PATH',
      '/api/cursos/{idCurso}/versiones/{versionCurso}',
    )
      .replace('{idCurso}', encodeURIComponent(idCurso))
      .replace('{versionCurso}', encodeURIComponent(versionCurso));
    const respuesta = await this.get(path, token);
    const estructura = (await respuesta.json()) as EstructuraCursoCatalogo;
    if (
      estructura.idCurso !== idCurso ||
      String(estructura.versionCurso) !== versionCurso ||
      !Array.isArray(estructura.modulos)
    ) {
      throw new ServiceUnavailableException('Catálogo devolvió una estructura inválida');
    }
    return estructura;
  }

  private path(variable: string, fallback: string): string {
    return process.env[variable] || fallback;
  }

  private async get(path: string, token: string): Promise<Response> {
    const baseUrl = process.env.CATALOGO_SERVICE_URL;
    if (!baseUrl) {
      throw new ServiceUnavailableException('CATALOGO_SERVICE_URL no está configurada');
    }
    let respuesta: Response;
    try {
      respuesta = await fetch(new URL(path, baseUrl), {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(4000),
      });
    } catch {
      throw new ServiceUnavailableException('No se pudo consultar Catálogo Service');
    }
    if (!respuesta.ok && respuesta.status !== 403 && respuesta.status !== 404) {
      throw new ServiceUnavailableException('Catálogo Service no está disponible');
    }
    return respuesta;
  }
}
