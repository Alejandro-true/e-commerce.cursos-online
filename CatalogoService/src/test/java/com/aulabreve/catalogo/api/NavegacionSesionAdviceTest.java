package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.model.Usuario;
import com.aulabreve.catalogo.model.enums.RolUsuario;
import com.aulabreve.catalogo.security.UsuarioPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.ExtendedModelMap;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class NavegacionSesionAdviceTest {

    private final NavegacionSesionAdvice advice = new NavegacionSesionAdvice();

    @AfterEach
    void limpiar() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void visitanteVeMenuPublico() {
        ExtendedModelMap model = new ExtendedModelMap();
        advice.agregarEstadoSesion(model);
        assertEquals(false, model.get("navAutenticado"));
        assertEquals(false, model.get("navAdmin"));
        assertEquals(false, model.get("navEstudiante"));
    }

    @Test
    void estudianteNoVeEntradaAdministrativa() {
        iniciarComo(RolUsuario.ESTUDIANTE);
        ExtendedModelMap model = new ExtendedModelMap();
        advice.agregarEstadoSesion(model);
        assertEquals(true, model.get("navAutenticado"));
        assertEquals(false, model.get("navAdmin"));
        assertEquals(true, model.get("navEstudiante"));
    }

    @Test
    void adminNoVeOpcionMisCursos() {
        iniciarComo(RolUsuario.ADMIN);
        ExtendedModelMap model = new ExtendedModelMap();
        advice.agregarEstadoSesion(model);
        assertEquals(true, model.get("navAutenticado"));
        assertEquals(true, model.get("navAdmin"));
        assertEquals(false, model.get("navEstudiante"));
    }

    private static void iniciarComo(RolUsuario rol) {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setNombre("Cuenta de prueba");
        usuario.setEmail("prueba@example.test");
        usuario.setRol(rol);
        usuario.setActivo(true);
        usuario.setPasswordHash("no-es-una-clave-real");
        UsuarioPrincipal principal = new UsuarioPrincipal(usuario);
        var auth = UsernamePasswordAuthenticationToken.authenticated(
                principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
