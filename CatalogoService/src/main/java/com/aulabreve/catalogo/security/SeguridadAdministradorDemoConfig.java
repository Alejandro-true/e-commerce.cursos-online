package com.aulabreve.catalogo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Etapa 11.4: solo usuarios con ROLE_ADMIN pueden abrir o llamar la
 * administracion. Rutas legacy de checkout tambien quedan restringidas;
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
                "/demo/aula/admin",
                "/api/demo/panel/**",
                "/api/demo/admin/**",
                "/api/demo/compras/**",
                "/demo/checkout/**")
            .authorizeHttpRequests(auth -> auth
                .anyRequest().hasRole("ADMIN"))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, error) -> {
                    if (request.getRequestURI().startsWith("/api/")) {
                        response.sendError(HttpStatus.UNAUTHORIZED.value(),
                                "Inicia sesion como administrador");
                    } else {
                        response.sendRedirect(request.getContextPath() + "/ingresar");
                    }
                })
                .accessDeniedHandler((request, response, error) -> {
                    response.sendError(HttpStatus.FORBIDDEN.value(),
                            "Solo administradores pueden realizar esta operacion");
                }));
        return http.build();
    }
}
