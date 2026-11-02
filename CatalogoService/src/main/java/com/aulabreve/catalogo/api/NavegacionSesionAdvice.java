package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.security.UsuarioPrincipal;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

/** Variables del menu para las plantillas Thymeleaf del portal DEMO.
 * No reemplaza la autorizacion de Spring Security en las rutas. */
@ControllerAdvice(annotations = Controller.class)
@Profile("demo")
public class NavegacionSesionAdvice {

    @ModelAttribute
    public void agregarEstadoSesion(Model model) {
        Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();
        UsuarioPrincipal principal = autenticacion != null
                && autenticacion.isAuthenticated()
                && autenticacion.getPrincipal() instanceof UsuarioPrincipal p
                && p.isEnabled()
                ? (UsuarioPrincipal) autenticacion.getPrincipal()
                : null;

        boolean autenticado = principal != null;
        boolean admin = autenticado && principal.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        boolean estudiante = autenticado && principal.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ESTUDIANTE".equals(a.getAuthority()));

        model.addAttribute("navAutenticado", autenticado);
        model.addAttribute("navAdmin", admin);
        model.addAttribute("navEstudiante", estudiante);
    }
}
