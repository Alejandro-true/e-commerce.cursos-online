package com.aulabreve.catalogo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Solo usuarios con ROLE_ADMIN pueden llamar la API de administracion.
 * Rutas legacy de checkout tambien quedan restringidas;
 * la clave anterior no sirve para entrar sin iniciar sesion como ADMIN.
 * CSRF permanece habilitado en las operaciones de escritura.
 */
@Configuration
@Profile("demo")
public class SeguridadAdministradorDemoConfig {

    @Bean
    @Order(0)
    public SecurityFilterChain cadenaAdministrador(HttpSecurity http) throws Exception {
        http.securityMatcher(
                "/api/demo/panel/**",
                "/api/demo/admin/**",
                "/api/demo/compras/**")
            .authorizeHttpRequests(auth -> auth
                .anyRequest().hasRole("ADMIN"))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, error) -> {
                    response.sendError(HttpStatus.UNAUTHORIZED.value(),
                            "Inicia sesion como administrador");
                })
                .accessDeniedHandler((request, response, error) -> {
                    response.sendError(HttpStatus.FORBIDDEN.value(),
                            "Solo administradores pueden realizar esta operacion");
                }));
        return http.build();
    }
}
