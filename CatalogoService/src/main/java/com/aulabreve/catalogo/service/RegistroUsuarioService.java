package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.model.Usuario;
import com.aulabreve.catalogo.model.enums.RolUsuario;
import com.aulabreve.catalogo.repository.UsuarioRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class RegistroUsuarioService {
    private static final Pattern EMAIL = Pattern.compile(
        "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;

    public RegistroUsuarioService(UsuarioRepository usuarios, PasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.encoder = encoder;
    }

    @Transactional
    public Usuario registrar(String nombre, String email, String password, String confirmacion) {
        String nombreLimpio = nombre == null ? "" : nombre.trim();
        String correo = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);

        if (nombreLimpio.length() < 2 || nombreLimpio.length() > 120) {
            throw new IllegalArgumentException("El nombre debe tener entre 2 y 120 caracteres");
        }
        if (correo.length() > 255 || !EMAIL.matcher(correo).matches()) {
            throw new IllegalArgumentException("Escribe un correo electrónico válido");
        }
        if (password == null || password.length() < 10 ||
            password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException(
                "La contraseña debe tener al menos 10 caracteres y máximo 72 bytes en UTF-8"
            );
        }
        if (!password.equals(confirmacion)) {
            throw new IllegalArgumentException("Las contraseñas no coinciden");
        }
        if (usuarios.existsByEmail(correo)) {
            throw new IllegalArgumentException("Este correo ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(nombreLimpio);
        usuario.setEmail(correo);
        usuario.setPasswordHash(encoder.encode(password));
        usuario.setRol(RolUsuario.ESTUDIANTE); // Registro publico nunca crea ADMIN
        usuario.setActivo(true);
        try {
            return usuarios.saveAndFlush(usuario);
        } catch (DataIntegrityViolationException ex) {
            // El indice unico de PostgreSQL cubre registros simultaneos.
            throw new IllegalArgumentException("Este correo ya está registrado", ex);
        }
    }
}
