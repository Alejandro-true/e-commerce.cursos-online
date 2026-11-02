package com.aulabreve.catalogo.security;

import com.aulabreve.catalogo.model.Usuario;
import com.aulabreve.catalogo.model.enums.RolUsuario;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

class UsuarioPrincipalRolesTest {
    @Test void usuarioEstudianteNoTieneRolAdmin() {
        Usuario u = base(RolUsuario.ESTUDIANTE);
        UsuarioPrincipal p = new UsuarioPrincipal(u);
        assertTrue(p.getAuthorities().stream().anyMatch(a -> "ROLE_ESTUDIANTE".equals(a.getAuthority())));
        assertFalse(p.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority())));
    }
    @Test void usuarioAdminTieneRolAdmin() {
        UsuarioPrincipal p = new UsuarioPrincipal(base(RolUsuario.ADMIN));
        assertTrue(p.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority())));
    }
    private Usuario base(RolUsuario rol) {
        Usuario u = new Usuario();
        u.setId(UUID.randomUUID());u.setNombre("Usuario DEMO");
        u.setEmail("rol@ejemplo.test");u.setPasswordHash("hash");
        u.setRol(rol);u.setActivo(true);return u;
    }
}
