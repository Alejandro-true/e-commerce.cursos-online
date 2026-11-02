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

/**
 * Nunca recibe estudianteId del cliente: deriva identidad del principal
 * autenticado. Los endpoints solo aceptan ROLE_ESTUDIANTE por filtro de seguridad.
 */
@RestController
@Profile("demo")
@RequestMapping("/api/demo/cuenta")
public class ComprasCuentaController {

    public record CompraSolicitada(UUID cursoId) {}
    public record CompraCreada(UUID compraId, String estado) {}
    public record MiIdentidad(String id, String nombre, String email, String rol) {}

    private final CheckoutService checkout;
    private final MisCursosService misCursos;
    private final DemoComprasConsultaService consultas;

    public ComprasCuentaController(CheckoutService checkout, MisCursosService misCursos,
                                  DemoComprasConsultaService consultas) {
        this.checkout = checkout;
        this.misCursos = misCursos;
        this.consultas = consultas;
    }

    private static String estudiante(UsuarioPrincipal principal) {
        if (principal == null || principal.getId() == null || !principal.isEnabled()
                || principal.getAuthorities().stream().noneMatch(
                    a -> "ROLE_ESTUDIANTE".equals(a.getAuthority()))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Se requiere cuenta de estudiante");
        }
        return principal.getId().toString();
    }

    @GetMapping("/yo")
    public MiIdentidad yo(@AuthenticationPrincipal UsuarioPrincipal principal) {
        String id = estudiante(principal);
        return new MiIdentidad(id, principal.getNombre(), principal.getUsername(), "ESTUDIANTE");
    }

    @PostMapping("/compras")
    @ResponseStatus(HttpStatus.CREATED)
    public CompraCreada comprar(@AuthenticationPrincipal UsuarioPrincipal principal,
                                @RequestBody CompraSolicitada solicitud) {
        String id = estudiante(principal);
        if (solicitud == null || solicitud.cursoId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona un curso valido");
        }
        var respuesta = checkout.iniciar(id, solicitud.cursoId());
        // No se entrega checkoutUrl al estudiante: el administrador confirma la DEMO.
        return new CompraCreada(respuesta.compraId(), respuesta.estado());
    }

    @GetMapping("/compras")
    public List<DemoComprasConsultaService.CompraVista> historial(
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return consultas.delEstudiante(estudiante(principal));
    }

    @GetMapping("/mis-cursos")
    public List<MiCursoResponse> adquiridos(
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return misCursos.listar(estudiante(principal));
    }
}
