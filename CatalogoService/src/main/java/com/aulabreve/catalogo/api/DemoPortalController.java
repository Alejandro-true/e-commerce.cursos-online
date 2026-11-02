package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.dto.CursoDetalleResponse;
import com.aulabreve.catalogo.dto.CursoResumenResponse;
import com.aulabreve.catalogo.dto.MiCursoResponse;
import com.aulabreve.catalogo.service.CheckoutService;
import com.aulabreve.catalogo.service.CursoService;
import com.aulabreve.catalogo.service.MisCursosService;
import com.aulabreve.catalogo.service.DemoComprasConsultaService;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Portal de alumnos ficticios: SOLO perfil demo, en localhost.
 * No representa autenticacion real. La aprobacion sigue bajo clave DEMO. */
@RestController
@Profile("demo")
@RequestMapping("/api/demo/portal")
public class DemoPortalController {
    private static final Set<String> ALUMNOS = Set.of("alumno-web-001", "alumno-web-002");
    public record NuevaCompra(String estudianteId, UUID cursoId) {}
    public record CompraCreada(UUID compraId, String estado) {}

    private final CursoService cursos;
    private final CheckoutService checkout;
    private final MisCursosService misCursos;
    private final DemoComprasConsultaService consultas;

    public DemoPortalController(CursoService cursos, CheckoutService checkout,
            MisCursosService misCursos, DemoComprasConsultaService consultas) {
        this.cursos = cursos;
        this.checkout = checkout;
        this.misCursos = misCursos;
        this.consultas = consultas;
    }

    @GetMapping("/cursos")
    public List<CursoResumenResponse> catalogo(@RequestParam(required = false) String texto) {
        return cursos.listarPublicados(texto, null, PageRequest.of(0, 30)).getContent();
    }

    @GetMapping("/cursos/{id}")
    public CursoDetalleResponse detalle(@PathVariable UUID id) {
        return cursos.obtenerDetalle(id);
    }

    @PostMapping("/compras")
    @ResponseStatus(HttpStatus.CREATED)
    public CompraCreada iniciar(@RequestBody NuevaCompra solicitud) {
        if (solicitud == null || solicitud.cursoId() == null) {
            throw new IllegalArgumentException("Selecciona un curso valido");
        }
        exigirAlumno(solicitud.estudianteId());
        var creada = checkout.iniciar(solicitud.estudianteId(), solicitud.cursoId());
        // Deliberadamente no enviamos checkoutUrl: el alumno NO aprueba el pago.
        return new CompraCreada(creada.compraId(), creada.estado());
    }

    @GetMapping("/compras")
    public List<DemoComprasConsultaService.CompraVista> compras(@RequestParam String estudianteId) {
        exigirAlumno(estudianteId);
        return consultas.delEstudiante(estudianteId);
    }

    @GetMapping("/mis-cursos")
    public List<MiCursoResponse> adquiridos(@RequestParam String estudianteId) {
        exigirAlumno(estudianteId);
        return misCursos.listar(estudianteId);
    }

    private static void exigirAlumno(String id) {
        if (!ALUMNOS.contains(id)) {
            throw new IllegalArgumentException("Alumno de demostracion no permitido");
        }
    }
}
