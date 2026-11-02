package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.service.DemoSimuladorPagoService;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@Profile("demo")
public class DemoCheckoutPaginaController {
    private final DemoSimuladorPagoService simulador;
    public DemoCheckoutPaginaController(DemoSimuladorPagoService simulador) {
        this.simulador = simulador;
    }
    @GetMapping("/demo/checkout/{sesion}")
    public String mostrar(@PathVariable String sesion, Model model) {
        model.addAttribute("compra", simulador.consultarPorSesion(sesion));
        return "checkout-demo";
    }
}
