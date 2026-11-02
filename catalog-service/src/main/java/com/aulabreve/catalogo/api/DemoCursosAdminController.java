package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.service.DemoCursosAdminService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/** API protegida por ROLE_ADMIN; X-Demo-Key deprecado y no utilizado. */
@RestController
@Profile("demo")
@RequestMapping("/api/demo/admin/cursos")
public class DemoCursosAdminController {
    private final DemoCursosAdminService cursos;

    public DemoCursosAdminController(
        DemoCursosAdminService cursos) {
    this.cursos = cursos;
}

    @GetMapping
    public List<DemoCursosAdminService.CursoVista> listar(
            @RequestHeader(value = "X-Demo-Key", required = false) String clave) {
        
        return cursos.listar();
    }

    @GetMapping("/categorias")
    public List<DemoCursosAdminService.CategoriaVista> categorias(
            @RequestHeader(value = "X-Demo-Key", required = false) String clave) {
        
        return cursos.categoriasActivas();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DemoCursosAdminService.CursoCreado crear(
            @RequestHeader(value = "X-Demo-Key", required = false) String clave,
            @RequestBody DemoCursosAdminService.CursoFormulario datos) {
        
        return cursos.crear(datos);
    }

    @PutMapping("/{id}")
    public DemoCursosAdminService.CursoCreado editar(
            @RequestHeader(value = "X-Demo-Key", required = false) String clave,
            @PathVariable UUID id,
            @RequestBody DemoCursosAdminService.CursoFormulario datos) {
        
        return cursos.editar(id, datos);
    }
}
