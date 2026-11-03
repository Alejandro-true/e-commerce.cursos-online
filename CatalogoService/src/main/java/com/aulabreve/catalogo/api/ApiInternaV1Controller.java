package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.service.IntegracionConsultaService;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/** Exclusivamente para ProgresoService y ComunidadService: ver filtro de integracion. */
@RestController
@Profile("demo")
@RequestMapping("/api/v1/interno")
public class ApiInternaV1Controller {
    private final IntegracionConsultaService integracion;

    public ApiInternaV1Controller(IntegracionConsultaService integracion) {
        this.integracion = integracion;
    }

    @GetMapping("/accesos")
    public IntegracionConsultaService.Acceso acceso(
            @RequestParam UUID estudianteId,
            @RequestParam UUID cursoId,
            @RequestParam(required = false) UUID cursoVersionId) {
        return integracion.comprobarAcceso(estudianteId, cursoId, cursoVersionId);
    }

    @GetMapping("/versiones/{versionId}/estructura")
    public IntegracionConsultaService.Estructura estructura(@PathVariable UUID versionId) {
        return integracion.obtenerEstructura(versionId);
    }
}
