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

    /**
     * Etapa 11.2: protege SOLO el modulo de cuentas, SIN modificar aun las
     * rutas historicas del simulador DEMO. En 11.3 se debe integrar la
     * autenticacion con el checkout y cubrir el resto de endpoints web.
     */
    @Bean
    @Order(1)
    public SecurityFilterChain cadenaCuentas(HttpSecurity http) throws Exception {
        http.securityMatcher("/registro", "/ingresar", "/cuenta", "/cuenta/**", "/salir")
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/registro", "/ingresar").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/ingresar")
                .loginProcessingUrl("/ingresar")
                .defaultSuccessUrl("/cuenta", true)
                .failureUrl("/ingresar?error")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/salir")
                .logoutSuccessUrl("/ingresar?salir")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            ); // Proteccion CSRF ACTIVA para todos estos formularios.
        return http.build();
    }
}
