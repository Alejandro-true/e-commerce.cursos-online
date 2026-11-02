package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.integration.demo.DemoApiGuard;
import com.aulabreve.catalogo.service.DemoCursosAdminService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/** API privada de DEMOSTRACION (localhost y clave DEMO, sin usuarios reales). */
@RestController
@Profile("demo")
@RequestMapping("/api/demo/admin/cursos")
public class DemoCursosAdminController {
    private final DemoApiGuard guard;
    private final DemoCursosAdminService cursos;

    public DemoCursosAdminController(DemoApiGuard guard, DemoCursosAdminService cursos) {
        this.guard = guard;
        this.cursos = cursos;
    }

    @GetMapping
    public List<DemoCursosAdminService.CursoVista> listar(
            @RequestHeader(value = "X-Demo-Key", required = false) String clave) {
        guard.exigir(clave);
        return cursos.listar();
    }

    @GetMapping("/categorias")
    public List<DemoCursosAdminService.CategoriaVista> categorias(
            @RequestHeader(value = "X-Demo-Key", required = false) String clave) {
        guard.exigir(clave);
        return cursos.categoriasActivas();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DemoCursosAdminService.CursoCreado crear(
            @RequestHeader(value = "X-Demo-Key", required = false) String clave,
            @RequestBody DemoCursosAdminService.CursoFormulario datos) {
        guard.exigir(clave);
        return cursos.crear(datos);
    }

    @PutMapping("/{id}")
    public DemoCursosAdminService.CursoCreado editar(
            @RequestHeader(value = "X-Demo-Key", required = false) String clave,
            @PathVariable UUID id,
            @RequestBody DemoCursosAdminService.CursoFormulario datos) {
        guard.exigir(clave);
        return cursos.editar(id, datos);
    }
}
