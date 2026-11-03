package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.model.Usuario;
import com.aulabreve.catalogo.model.enums.RolUsuario;
import com.aulabreve.catalogo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

/** Creates the local demo administrator once; public registration remains student-only. */
@Configuration
@Profile("demo")
public class AdminInicializadorDemo {

    @Bean
    ApplicationRunner inicializarAdministradorDemo(
            UsuarioRepository usuarios,
            PasswordEncoder encoder,
            @Value("${app.demo.admin.email:}") String emailConfigurado,
            @Value("${app.demo.admin.password:}") String passwordConfigurada) {
        return args -> {
            if (emailConfigurado.isBlank() && passwordConfigurada.isBlank()) return;
            if (emailConfigurado.isBlank() || passwordConfigurada.isBlank()) {
                throw new IllegalStateException("Configura DEMO_ADMIN_EMAIL y DEMO_ADMIN_PASSWORD juntos");
            }

            String email = emailConfigurado.trim().toLowerCase(Locale.ROOT);
            int passwordBytes = passwordConfigurada.getBytes(StandardCharsets.UTF_8).length;
            if (passwordBytes < 10 || passwordBytes > 72) {
                throw new IllegalStateException("DEMO_ADMIN_PASSWORD debe tener entre 10 y 72 bytes UTF-8");
            }

            var existente = usuarios.findByEmail(email);
            if (existente.isPresent()) {
                if (existente.get().getRol() != RolUsuario.ADMIN) {
                    throw new IllegalStateException(
                            "DEMO_ADMIN_EMAIL ya pertenece a una cuenta sin rol administrador; configura otro correo");
                }
                return;
            }

            Usuario administrador = new Usuario();
            administrador.setNombre("Administración AulaBreve");
            administrador.setEmail(email);
            administrador.setPasswordHash(encoder.encode(passwordConfigurada));
            administrador.setRol(RolUsuario.ADMIN);
            administrador.setActivo(true);
            usuarios.saveAndFlush(administrador);
        };
    }
}
