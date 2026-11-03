package com.aulabreve.catalogo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.Set;

/** Credencial compartida SOLO entre backends en entorno educativo local. */
public class FiltroIntegracionV1 extends OncePerRequestFilter {
    private static final Set<String> SERVICIOS = Set.of("progreso", "comunidad");
    private final byte[] secreto;

    public FiltroIntegracionV1(String clave) {
        if (clave == null || clave.length() < 32) {
            throw new IllegalStateException(
                "Configura INTERNAL_SERVICE_KEY con al menos 32 caracteres en .env");
        }
        this.secreto = clave.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        String nombre = request.getHeader("X-AulaBreve-Service-Id");
        String enviada = request.getHeader("X-AulaBreve-Service-Key");
        if (!SERVICIOS.contains(nombre) || !coincide(secreto, enviada)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
                    "Credenciales de integracion no validas");
            return;
        }
        var autenticacion = new UsernamePasswordAuthenticationToken(
                "servicio:" + nombre, null,
                List.of(new SimpleGrantedAuthority("ROLE_INTEGRACION")));
        SecurityContextHolder.getContext().setAuthentication(autenticacion);
        chain.doFilter(request, response);
    }

    static boolean coincide(byte[] esperado, String enviada) {
        if (enviada == null) return false;
        return MessageDigest.isEqual(esperado, enviada.getBytes(StandardCharsets.UTF_8));
    }
}
