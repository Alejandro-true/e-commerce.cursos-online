package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.security.UsuarioPrincipal;
import com.aulabreve.catalogo.service.RegistroUsuarioService;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@Profile("demo")
public class CuentaDemoController {
    private final RegistroUsuarioService registro;

    public CuentaDemoController(RegistroUsuarioService registro) {
        this.registro = registro;
    }

    @GetMapping("/registro")
    public String formularioRegistro() {
        return "aula-registro";
    }

    @PostMapping("/registro")
    public String registrar(
            @RequestParam String nombre,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String confirmacion,
            Model model) {
        try {
            registro.registrar(nombre, email, password, confirmacion);
            return "redirect:/ingresar?registro=ok";
        } catch (IllegalArgumentException ex) {
            model.addAttribute("error", ex.getMessage());
            model.addAttribute("nombre", nombre);
            model.addAttribute("email", email);
            return "aula-registro";
        }
    }

    @GetMapping("/ingresar")
    public String login() {
        return "aula-login";
    }

    @GetMapping("/cuenta")
    public String cuenta(@AuthenticationPrincipal UsuarioPrincipal principal, Model model) {
        if (principal == null) return "redirect:/ingresar";
        model.addAttribute("nombre", principal.getNombre());
        model.addAttribute("email", principal.getUsername());
        model.addAttribute("usuarioId", principal.getId().toString());
        model.addAttribute("rol", principal.getAuthorities().iterator().next().getAuthority());
        return "aula-cuenta";
    }
}
