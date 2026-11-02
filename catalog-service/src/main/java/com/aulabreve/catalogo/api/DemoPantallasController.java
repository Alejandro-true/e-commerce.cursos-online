package com.aulabreve.catalogo.api;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@Profile("demo")
public class DemoPantallasController {
    @GetMapping({"/demo/aula", "/demo/aula/catalogo"})
    public String catalogo() { return "aula-catalogo"; }

    @GetMapping("/demo/aula/mis-cursos")
    public String misCursos() { return "aula-mis-cursos"; }

    @GetMapping("/demo/aula/admin")
    public String admin() { return "aula-admin"; }
}
