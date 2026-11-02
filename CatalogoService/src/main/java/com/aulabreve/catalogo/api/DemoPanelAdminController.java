package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.service.DemoComprasConsultaService;
import com.aulabreve.catalogo.service.DemoSimuladorPagoService;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

/** La clave local DEMO solo controla la operacion de prueba.
 * Autorizacion ADMIN por SeguridadAdministradorDemoConfig. La cabecera
 * X-Demo-Key se acepta por compatibilidad, pero no se usa.  */
@RestController
@Profile("demo")
@RequestMapping("/api/demo/panel")
public class DemoPanelAdminController {
    public record Decision(String resultado) {}
    private final DemoComprasConsultaService consultas;
    private final DemoSimuladorPagoService simulador;

    public DemoPanelAdminController(
        DemoComprasConsultaService consultas,
        DemoSimuladorPagoService simulador) {

    this.consultas = consultas;
    this.simulador = simulador;
}

    @GetMapping("/compras")
    public List<DemoComprasConsultaService.CompraVista> listar(
            @RequestHeader(value = "X-Demo-Key", required = false) String clave) {
        
        return consultas.todas();
    }

    @PostMapping("/compras/{id}/decision")
    public DemoSimuladorPagoService.ResultadoDemo decidir(
            @RequestHeader(value = "X-Demo-Key", required = false) String clave,
            @PathVariable UUID id, @RequestBody Decision solicitud) {
        
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
