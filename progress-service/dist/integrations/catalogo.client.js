"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogoClient = void 0;
const common_1 = require("@nestjs/common");
let CatalogoClient = class CatalogoClient {
    async verificarAcceso(idUsuario, idCurso, token) {
        const path = this.path('CATALOGO_ACCESS_PATH', '/api/accesos/{idUsuario}/{idCurso}')
            .replace('{idUsuario}', encodeURIComponent(idUsuario))
            .replace('{idCurso}', encodeURIComponent(idCurso));
        const respuesta = await this.get(path, token);
        if (respuesta.status === 403 || respuesta.status === 404) {
            throw new common_1.ForbiddenException('El usuario no tiene acceso vigente a este curso');
        }
        const datos = (await respuesta.json());
        if (!(datos.activo === true || datos.estado === 'ACTIVO')) {
            throw new common_1.ForbiddenException('El usuario no tiene acceso vigente a este curso');
        }
    }
    async obtenerEstructura(idCurso, versionCurso, token) {
        const path = this.path('CATALOGO_STRUCTURE_PATH', '/api/cursos/{idCurso}/versiones/{versionCurso}')
            .replace('{idCurso}', encodeURIComponent(idCurso))
            .replace('{versionCurso}', encodeURIComponent(versionCurso));
        const respuesta = await this.get(path, token);
        const estructura = (await respuesta.json());
        if (estructura.idCurso !== idCurso ||
            String(estructura.versionCurso) !== versionCurso ||
            !Array.isArray(estructura.modulos)) {
            throw new common_1.ServiceUnavailableException('Catálogo devolvió una estructura inválida');
        }
        return estructura;
    }
    path(variable, fallback) {
        return process.env[variable] || fallback;
    }
    async get(path, token) {
        const baseUrl = process.env.CATALOGO_SERVICE_URL;
        if (!baseUrl) {
            throw new common_1.ServiceUnavailableException('CATALOGO_SERVICE_URL no está configurada');
        }
        let respuesta;
        try {
            respuesta = await fetch(new URL(path, baseUrl), {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                signal: AbortSignal.timeout(4000),
            });
        }
        catch {
            throw new common_1.ServiceUnavailableException('No se pudo consultar Catálogo Service');
        }
        if (!respuesta.ok && respuesta.status !== 403 && respuesta.status !== 404) {
            throw new common_1.ServiceUnavailableException('Catálogo Service no está disponible');
        }
        return respuesta;
    }
};
exports.CatalogoClient = CatalogoClient;
exports.CatalogoClient = CatalogoClient = __decorate([
    (0, common_1.Injectable)()
], CatalogoClient);
//# sourceMappingURL=catalogo.client.js.map