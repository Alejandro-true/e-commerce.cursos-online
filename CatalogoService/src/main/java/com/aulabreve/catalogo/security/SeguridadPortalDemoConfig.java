package com.aulabreve.catalogo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/** Catálogo público; compra, cursos y videos sujetos a la identidad de la sesion. */
@Configuration
@Profile("demo")
public class SeguridadPortalDemoConfig {

    @Bean
    @Order(2)
    public SecurityFilterChain portalConSesion(HttpSecurity http) throws Exception {
        http.securityMatcher(
                    "/demo/aula", "/demo/aula/catalogo", "/demo/aula/mis-cursos",
                    "/api/demo/cuenta/**", "/api/demo/video/**")
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/demo/aula/catalogo").permitAll()
                .requestMatchers("/demo/aula/mis-cursos", "/api/demo/cuenta/**",
                                 "/api/demo/video/**").hasRole("ESTUDIANTE")
                .anyRequest().denyAll())
            .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, error) -> {
                if (request.getRequestURI().startsWith("/api/")) {
                    response.sendError(HttpStatus.UNAUTHORIZED.value(), "Debes iniciar sesion");
                } else {
                    response.sendRedirect(request.getContextPath() + "/ingresar");
                }
            }));
        return http.build();
    }

    @Bean
    @Order(3)
    public SecurityFilterChain cerrarPortalDeIdentidadesFicticias(HttpSecurity http)
            throws Exception {
        http.securityMatcher("/api/demo/portal/compras", "/api/demo/portal/mis-cursos")
            .authorizeHttpRequests(auth -> auth.anyRequest().denyAll());
        return http.build();
    }
}
