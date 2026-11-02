"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jose_1 = require("jose");
let JwtAuthGuard = class JwtAuthGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization;
        const token = authorization?.startsWith('Bearer ')
            ? authorization.slice('Bearer '.length)
            : undefined;
        const jwksUrl = process.env.AUTH_JWKS_URL;
        const issuer = process.env.AUTH_ISSUER;
        const audience = process.env.AUTH_AUDIENCE;
        if (!token || !jwksUrl || !issuer || !audience) {
            throw new common_1.UnauthorizedException('Token o configuración de identidad inválida');
        }
        try {
            const jwks = (0, jose_1.createRemoteJWKSet)(new URL(jwksUrl));
            const { payload } = await (0, jose_1.jwtVerify)(token, jwks, {
                issuer,
                audience,
                algorithms: ['RS256', 'ES256'],
            });
            if (typeof payload.sub !== 'string' || !payload.sub) {
                throw new common_1.UnauthorizedException('El token no contiene un identificador de usuario');
            }
            const rolesClaim = payload['roles'] ?? payload['role'];
            const roles = Array.isArray(rolesClaim)
                ? rolesClaim.filter((role) => typeof role === 'string')
                : typeof rolesClaim === 'string'
                    ? [rolesClaim]
                    : [];
            const requestedUser = request.params.idUsuario ??
                (request.body && typeof request.body === 'object'
                    ? request.body.idUsuario
                    : undefined);
            if (typeof requestedUser === 'string' && requestedUser !== payload.sub) {
                throw new common_1.ForbiddenException('No puedes consultar el progreso de otro usuario');
            }
            request.user = { idUsuario: payload.sub, roles };
            return true;
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException || error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Token inválido o expirado');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map