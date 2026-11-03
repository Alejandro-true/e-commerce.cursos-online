package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.dto.MiCursoResponse;
import com.aulabreve.catalogo.security.UsuarioPrincipal;
import com.aulabreve.catalogo.service.CheckoutService;
import com.aulabreve.catalogo.service.DemoComprasConsultaService;
import com.aulabreve.catalogo.service.MisCursosService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/** API de estudiante: JAMAS recibe estudianteId como dato del navegador. */
@RestController
@Profile("demo")
@RequestMapping("/api/v1/estudiante")
public class ApiEstudianteV1Controller {
    public record Comprar(UUID cursoId) {}
    public record CompraCreada(UUID compraId, String estado) {}
    public record Identidad(UUID usuarioId, String nombre, String correo, String rol) {}

    private final CheckoutService checkout;
    private final DemoComprasConsultaService consultas;
    private final MisCursosService misCursos;

    public ApiEstudianteV1Controller(CheckoutService checkout,
                                    DemoComprasConsultaService consultas,
                                    MisCursosService misCursos) {
        this.checkout = checkout;
        this.consultas = consultas;
        this.misCursos = misCursos;
    }

    private static String estudiante(UsuarioPrincipal p) {
        if (p == null || p.getId() == null || !p.isEnabled() ||
                p.getAuthorities().stream().noneMatch(a ->
                        "ROLE_ESTUDIANTE".equals(a.getAuthority()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo estudiantes autenticados");
        }
        return p.getId().toString();
    }

    @GetMapping("/yo")
    public Identidad yo(@AuthenticationPrincipal UsuarioPrincipal p) {
        estudiante(p);
        return new Identidad(p.getId(), p.getNombre(), p.getUsername(), "ESTUDIANTE");
    }

    @PostMapping("/compras")
    @ResponseStatus(HttpStatus.CREATED)
    public CompraCreada comprar(@AuthenticationPrincipal UsuarioPrincipal p,
                                @RequestBody Comprar solicitud) {
        String id = estudiante(p);
        if (solicitud == null || solicitud.cursoId() == null) {
            throw new IllegalArgumentException("cursoId es obligatorio");
        }
        var creada = checkout.iniciar(id, solicitud.cursoId());
        // No devolvemos la URL administrativa de checkout al estudiante.
        return new CompraCreada(creada.compraId(), creada.estado());
    }

    @GetMapping("/compras")
    public List<DemoComprasConsultaService.CompraVista> compras(
            @AuthenticationPrincipal UsuarioPrincipal p) {
        return consultas.delEstudiante(estudiante(p));
    }

    @GetMapping("/mis-cursos")
    public List<MiCursoResponse> misCursos(
            @AuthenticationPrincipal UsuarioPrincipal p) {
        return misCursos.listar(estudiante(p));
    }
}
