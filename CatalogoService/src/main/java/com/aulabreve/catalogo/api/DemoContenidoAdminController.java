package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.integration.demo.DemoApiGuard;
import com.aulabreve.catalogo.service.DemoContenidoAdminService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

/** API local de gestion de contenido; protegida por el perfil demo y X-Demo-Key. */
@RestController
@Profile("demo")
@RequestMapping("/api/demo/admin/contenido")
public class DemoContenidoAdminController {
    private final DemoApiGuard guard;
    private final DemoContenidoAdminService servicio;
    public DemoContenidoAdminController(DemoApiGuard guard, DemoContenidoAdminService servicio) {
        this.guard=guard; this.servicio=servicio;
    }
    @GetMapping("/{cursoId}")
    public DemoContenidoAdminService.ContenidoVista consultar(
            @RequestHeader(value="X-Demo-Key",required=false) String clave,
            @PathVariable UUID cursoId) {
        guard.exigir(clave); return servicio.consultar(cursoId);
    }
    @PostMapping("/{cursoId}/versiones") @ResponseStatus(HttpStatus.CREATED)
    public DemoContenidoAdminService.IdCreado version(
            @RequestHeader(value="X-Demo-Key",required=false) String clave,
            @PathVariable UUID cursoId, @RequestBody DemoContenidoAdminService.NuevaVersion datos) {
        guard.exigir(clave); return servicio.crearVersion(cursoId,datos);
    }
    @PostMapping("/{cursoId}/versiones/{versionId}/modulos") @ResponseStatus(HttpStatus.CREATED)
    public DemoContenidoAdminService.IdCreado modulo(
            @RequestHeader(value="X-Demo-Key",required=false) String clave,
            @PathVariable UUID cursoId, @PathVariable UUID versionId,
            @RequestBody DemoContenidoAdminService.NuevoModulo datos) {
        guard.exigir(clave); return servicio.agregarModulo(cursoId,versionId,datos);
    }
    @PostMapping("/{cursoId}/modulos/{moduloId}/lecciones") @ResponseStatus(HttpStatus.CREATED)
    public DemoContenidoAdminService.IdCreado leccion(
            @RequestHeader(value="X-Demo-Key",required=false) String clave,
            @PathVariable UUID cursoId, @PathVariable UUID moduloId,
            @RequestBody DemoContenidoAdminService.NuevaLeccion datos) {
        guard.exigir(clave); return servicio.agregarLeccion(cursoId,moduloId,datos);
    }
    @PostMapping("/{cursoId}/lecciones/{leccionId}/recursos") @ResponseStatus(HttpStatus.CREATED)
    public DemoContenidoAdminService.IdCreado recurso(
            @RequestHeader(value="X-Demo-Key",required=false) String clave,
            @PathVariable UUID cursoId, @PathVariable UUID leccionId,
            @RequestBody DemoContenidoAdminService.NuevoRecurso datos) {
        guard.exigir(clave); return servicio.agregarRecurso(cursoId,leccionId,datos);
    }
    @PostMapping("/{cursoId}/versiones/{versionId}/publicar")
    public DemoContenidoAdminService.EstadoActualizado publicar(
            @RequestHeader(value="X-Demo-Key",required=false) String clave,
            @PathVariable UUID cursoId,@PathVariable UUID versionId) {
        guard.exigir(clave); return servicio.publicar(cursoId,versionId);
    }
    @PostMapping("/{cursoId}/archivar")
    public DemoContenidoAdminService.EstadoActualizado archivar(
            @RequestHeader(value="X-Demo-Key",required=false) String clave,
            @PathVariable UUID cursoId) {
        guard.exigir(clave); return servicio.archivar(cursoId);
    }
}
