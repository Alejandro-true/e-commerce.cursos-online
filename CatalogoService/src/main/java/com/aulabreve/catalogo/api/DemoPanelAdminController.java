package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.integration.demo.DemoApiGuard;
import com.aulabreve.catalogo.service.DemoComprasConsultaService;
import com.aulabreve.catalogo.service.DemoSimuladorPagoService;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

/** La clave local DEMO solo controla la operacion de prueba.
 * Sustituir por roles autenticados antes de publicar en una red. */
@RestController
@Profile("demo")
@RequestMapping("/api/demo/panel")
public class DemoPanelAdminController {
    public record Decision(String resultado) {}
    private final DemoApiGuard guard;
    private final DemoComprasConsultaService consultas;
    private final DemoSimuladorPagoService simulador;

    public DemoPanelAdminController(DemoApiGuard guard, DemoComprasConsultaService consultas,
            DemoSimuladorPagoService simulador) {
        this.guard = guard;
        this.consultas = consultas;
        this.simulador = simulador;
    }

    @GetMapping("/compras")
    public List<DemoComprasConsultaService.CompraVista> listar(
            @RequestHeader(value = "X-Demo-Key", required = false) String clave) {
        guard.exigir(clave);
        return consultas.todas();
    }

    @PostMapping("/compras/{id}/decision")
    public DemoSimuladorPagoService.ResultadoDemo decidir(
            @RequestHeader(value = "X-Demo-Key", required = false) String clave,
            @PathVariable UUID id, @RequestBody Decision solicitud) {
        guard.exigir(clave);
        if (solicitud == null || solicitud.resultado() == null) {
            throw new IllegalArgumentException("Resultado requerido");
        }
        DemoSimuladorPagoService.Resultado resultado;
        try {
            resultado = DemoSimuladorPagoService.Resultado.valueOf(solicitud.resultado());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Resultado invalido: APROBADO, RECHAZADO o REEMBOLSADO");
        }
        return simulador.simular(id, resultado);
    }
}
