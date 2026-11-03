import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { idUsuario: string; roles: string[] };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (process.env.AUTH_MODE === 'development') {
      const studentId = request.headers['x-student-id'];
      if (typeof studentId !== 'string' || !studentId.trim()) {
        throw new UnauthorizedException('Envía el encabezado X-Student-Id para el modo local');
      }
      request.user = { idUsuario: studentId.trim(), roles: ['ESTUDIANTE'] };
      this.validarUsuarioSolicitado(request, studentId.trim());
      return true;
    }

    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : undefined;
    const jwksUrl = process.env.AUTH_JWKS_URL;
    const issuer = process.env.AUTH_ISSUER;
    const audience = process.env.AUTH_AUDIENCE;
    if (!token || !jwksUrl || !issuer || !audience) {
      throw new UnauthorizedException('Token o configuración de identidad inválida');
    }

    try {
      const jwks = createRemoteJWKSet(new URL(jwksUrl));
      const { payload } = await jwtVerify(token, jwks, {
        issuer,
        audience,
        algorithms: ['RS256', 'ES256'],
      });
      if (typeof payload.sub !== 'string' || !payload.sub) {
        throw new UnauthorizedException('El token no contiene un identificador de usuario');
      }
      const rolesClaim = payload['roles'] ?? payload['role'];
      const roles = Array.isArray(rolesClaim)
        ? rolesClaim.filter((role): role is string => typeof role === 'string')
        : typeof rolesClaim === 'string'
          ? [rolesClaim]
          : [];
      request.user = { idUsuario: payload.sub, roles };
      this.validarUsuarioSolicitado(request, payload.sub);
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private validarUsuarioSolicitado(request: AuthenticatedRequest, authenticatedId: string): void {
    const requestedUser =
      request.params.idUsuario ??
      (request.body && typeof request.body === 'object'
        ? (request.body as Record<string, unknown>).idUsuario
        : undefined);
    if (typeof requestedUser === 'string' && requestedUser !== authenticatedId) {
      throw new ForbiddenException('No puedes consultar el progreso de otro usuario');
    }
  }
}
