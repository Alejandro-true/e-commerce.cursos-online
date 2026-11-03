package com.aulabreve.catalogo.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/** Prioridad superior a las cadenas existentes, exclusivamente para /api/v1. */
@Configuration
@Profile("demo")
public class SeguridadApiV1Config {

    @Bean
    @Order(-20)
    public SecurityFilterChain integracionInterna(HttpSecurity http,
            @Value("${INTERNAL_SERVICE_KEY:}") String clave) throws Exception {
        http.securityMatcher("/api/v1/interno/**")
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a.anyRequest().hasRole("INTEGRACION"))
            .addFilterBefore(new FiltroIntegracionV1(clave),
                    UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    @Order(-19)
    public SecurityFilterChain apiNavegador(HttpSecurity http) throws Exception {
        http.securityMatcher("/api/v1/**")
            .authorizeHttpRequests(a -> a
                .requestMatchers("/api/v1/catalogo/**", "/api/v1/seguridad/csrf").permitAll()
                .requestMatchers("/api/v1/estudiante/**").hasRole("ESTUDIANTE")
                .anyRequest().denyAll())
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) ->
                        res.sendError(HttpStatus.UNAUTHORIZED.value(), "Inicia sesion"))
                .accessDeniedHandler((req, res, ex) ->
                        res.sendError(HttpStatus.FORBIDDEN.value(), "Acceso denegado")));
        // CSRF de Spring Security sigue activado para POST de usuarios con sesion.
        return http.build();
    }
}
