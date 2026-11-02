package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.model.Usuario;
import com.aulabreve.catalogo.model.enums.RolUsuario;
import com.aulabreve.catalogo.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistroUsuarioServiceTest {
    @Mock UsuarioRepository usuarios;
    @Mock PasswordEncoder encoder;
    @InjectMocks RegistroUsuarioService servicio;

    @Test
    void registraNormalizaEmailYAsignaRolEstudiante() {
        when(encoder.encode("ClaveDemo_12345")).thenReturn("$2a$hash-demo");
        when(usuarios.saveAndFlush(any(Usuario.class))).thenAnswer(i -> {
            Usuario u = i.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        Usuario creado = servicio.registrar("  Ana Perez ", "  ANA@EJEMPLO.COM  ",
            "ClaveDemo_12345", "ClaveDemo_12345");

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarios).saveAndFlush(captor.capture());
        assertEquals("Ana Perez", creado.getNombre());
        assertEquals("ana@ejemplo.com", captor.getValue().getEmail());
        assertEquals("$2a$hash-demo", captor.getValue().getPasswordHash());
        assertEquals(RolUsuario.ESTUDIANTE, captor.getValue().getRol());
        assertTrue(captor.getValue().isActivo());
        assertNotNull(creado.getId());
    }

    @Test
    void impideRegistrarDosVecesElMismoCorreo() {
        when(usuarios.existsByEmail("ana@ejemplo.com")).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () ->
            servicio.registrar("Ana Perez", "ANA@EJEMPLO.COM", "ClaveDemo_12345", "ClaveDemo_12345"));
        verify(usuarios, never()).saveAndFlush(any());
    }

    @Test
    void rechazaContrasenasDiferentes() {
        assertThrows(IllegalArgumentException.class, () ->
            servicio.registrar("Ana Perez", "ana@ejemplo.com", "ClaveDemo_12345", "otraClave_12345"));
        verifyNoInteractions(usuarios);
    }

    @Test
    void rechazaClaveCorta() {
        assertThrows(IllegalArgumentException.class, () ->
            servicio.registrar("Ana Perez", "ana@ejemplo.com", "12345", "12345"));
        verifyNoInteractions(usuarios);
    }

    @Test
    void rechazaCorreoInvalido() {
        assertThrows(IllegalArgumentException.class, () ->
            servicio.registrar("Ana Perez", "correo-invalido", "ClaveDemo_12345", "ClaveDemo_12345"));
        verifyNoInteractions(usuarios);
    }
}
