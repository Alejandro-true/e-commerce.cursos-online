package com.aulabreve.catalogo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SeguridadCuentaConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /** Autenticación de sesión expuesta como API para el frontend Angular. */
    @Bean
    @Order(1)
    public SecurityFilterChain cadenaCuentas(HttpSecurity http) throws Exception {
        http.securityMatcher("/api/demo/auth/**")
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/demo/auth/csrf", "/api/demo/auth/registro",
                        "/api/demo/auth/login", "/api/demo/auth/logout").permitAll()
                .anyRequest().denyAll()
            )
            .formLogin(form -> form
                .loginProcessingUrl("/api/demo/auth/login")
                .successHandler((request, response, authentication) ->
                        response.setStatus(org.springframework.http.HttpStatus.NO_CONTENT.value()))
                .failureHandler((request, response, exception) -> {
                    response.setStatus(org.springframework.http.HttpStatus.UNAUTHORIZED.value());
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"message\":\"Correo o contraseña incorrectos\"}");
                })
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/api/demo/auth/logout")
                .logoutSuccessHandler((request, response, authentication) ->
                        response.setStatus(org.springframework.http.HttpStatus.NO_CONTENT.value()))
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            ); // CSRF sigue habilitado para registro, login y logout.
        return http.build();
    }
}
