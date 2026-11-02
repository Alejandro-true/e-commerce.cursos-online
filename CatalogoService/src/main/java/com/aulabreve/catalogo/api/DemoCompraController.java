package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.dto.IniciarCheckoutResponse;
import com.aulabreve.catalogo.integration.demo.DemoApiGuard;
import com.aulabreve.catalogo.service.CheckoutService;
import com.aulabreve.catalogo.service.DemoSimuladorPagoService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@Profile("demo")
@RequestMapping("/api/demo/compras")
public class DemoCompraController {
    public record NuevaCompra(String estudianteId, UUID cursoId) {}
    private final DemoApiGuard guard;
    private final CheckoutService checkout;
    private final DemoSimuladorPagoService simulador;

    public DemoCompraController(DemoApiGuard guard, CheckoutService checkout,
            DemoSimuladorPagoService simulador) {
        this.guard = guard;
        this.checkout = checkout;
        this.simulador = simulador;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IniciarCheckoutResponse iniciar(@RequestHeader(value="X-Demo-Key", required=false) String clave,
            @RequestBody NuevaCompra request) {
        guard.exigir(clave);
        if (request == null || request.cursoId() == null) {
            throw new IllegalArgumentException("cursoId requerido");
        }
        // Solo para demostracion local: el operador elige identidad ficticia.
        return checkout.iniciar(request.estudianteId(), request.cursoId());
    }

    @GetMapping("/{id}")
    public DemoSimuladorPagoService.Vista consultar(
            @RequestHeader(value="X-Demo-Key",required=false) String clave,
            @PathVariable UUID id) {
        guard.exigir(clave);
        return simulador.consultarPorCompra(id);
    }

    @PostMapping("/{id}/simular")
    public DemoSimuladorPagoService.ResultadoDemo simular(
            @RequestHeader(value="X-Demo-Key",required=false) String clave,
            @PathVariable UUID id,
            @RequestParam DemoSimuladorPagoService.Resultado resultado) {
        guard.exigir(clave);
        return simulador.simular(id, resultado);
    }
}
