"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgresoView = void 0;
class ProgresoView {
    static curso(documento) {
        const respuesta = documento.toObject({ virtuals: false });
        delete respuesta._id;
        delete respuesta.__v;
        return respuesta;
    }
    static historial(resultado) {
        return {
            ...resultado,
            cursos: resultado.cursos.map((curso) => this.curso(curso)),
        };
    }
}
exports.ProgresoView = ProgresoView;
//# sourceMappingURL=progreso.view.js.map