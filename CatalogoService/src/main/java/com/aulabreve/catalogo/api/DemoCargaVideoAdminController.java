package com.aulabreve.catalogo.api;

import java.util.UUID;

import com.aulabreve.catalogo.service.DemoCargaVideoAdminService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Profile("demo")
@RequestMapping("/api/demo/admin/videos")
public class DemoCargaVideoAdminController {
    private final DemoCargaVideoAdminService servicio;

    public DemoCargaVideoAdminController(DemoCargaVideoAdminService servicio) {
        this.servicio = servicio;
    }

    // Ademas del filtro Spring Security, no se acepta una identidad de alumno
    // enviada por el navegador para subir archivos.
    @PostMapping(value = "/cursos/{cursoId}/lecciones/{leccionId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DemoCargaVideoAdminService.Resultado subir(@PathVariable UUID cursoId,
            @PathVariable UUID leccionId, @RequestParam("archivo") MultipartFile archivo) {
        return servicio.subir(cursoId, leccionId, archivo);
    }
}
