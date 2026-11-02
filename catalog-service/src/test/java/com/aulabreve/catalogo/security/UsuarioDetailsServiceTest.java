package com.aulabreve.catalogo.security;

import com.aulabreve.catalogo.model.Usuario;
import com.aulabreve.catalogo.model.enums.RolUsuario;
import com.aulabreve.catalogo.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioDetailsServiceTest {
    @Mock UsuarioRepository usuarios;
    @InjectMocks UsuarioDetailsService servicio;

    @Test
    void cargaUsuarioPorCorreoNormalizadoYConservaUuid() {
        UUID id = UUID.randomUUID();
        Usuario u = new Usuario();
        u.setId(id);
        u.setNombre("Ana");
        u.setEmail("ana@ejemplo.com");
        u.setPasswordHash("$2a$hash-demo");
        u.setRol(RolUsuario.ESTUDIANTE);
        u.setActivo(true);
        when(usuarios.findByEmail("ana@ejemplo.com")).thenReturn(Optional.of(u));

        UsuarioPrincipal principal = (UsuarioPrincipal) servicio.loadUserByUsername(" ANA@EJEMPLO.COM ");
        assertEquals(id, principal.getId());
        assertEquals("ana@ejemplo.com", principal.getUsername());
        assertTrue(principal.getAuthorities().stream().anyMatch(a ->
            a.getAuthority().equals("ROLE_ESTUDIANTE")));
    }

    @Test
    void correoDesconocidoNoIniciaSesion() {
        when(usuarios.findByEmail("nadie@ejemplo.com")).thenReturn(Optional.empty());
        assertThrows(UsernameNotFoundException.class, () ->
            servicio.loadUserByUsername("nadie@ejemplo.com"));
    }
}
