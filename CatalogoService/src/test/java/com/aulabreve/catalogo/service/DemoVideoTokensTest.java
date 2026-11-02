package com.aulabreve.catalogo.service;

import static org.junit.jupiter.api.Assertions.*;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class DemoVideoTokensTest {
    private final DemoVideoTokens tokens = new DemoVideoTokens("prueba-aulabreve-clave-segura-de-64-caracteres-000000000000");
    private final UUID usuario = UUID.fromString("11111111-1111-4111-8111-111111111111");
    private final UUID leccion = UUID.fromString("22222222-2222-4222-8222-222222222222");
    private final Instant ahora = Instant.parse("2026-11-01T20:00:00Z");

    @Test void tokenValido() {
        String token = tokens.crear(usuario, leccion, Duration.ofMinutes(3), ahora);
        assertTrue(tokens.verificar(usuario, leccion, token, ahora));
    }

    @Test void expiraLuegoDeTresMinutos() {
        String token = tokens.crear(usuario, leccion, Duration.ofMinutes(3), ahora);
        assertFalse(tokens.verificar(usuario, leccion, token, ahora.plusSeconds(181)));
    }

    @Test void noSirveParaOtroUsuarioNiOtraLeccion() {
        String token = tokens.crear(usuario, leccion, Duration.ofMinutes(3), ahora);
        assertFalse(tokens.verificar(UUID.randomUUID(), leccion, token, ahora));
        assertFalse(tokens.verificar(usuario, UUID.randomUUID(), token, ahora));
    }

    @Test void rechazaManipulacionYTokenVacio() {
        String token = tokens.crear(usuario, leccion, Duration.ofMinutes(3), ahora);
        int pos = token.indexOf('.') + 1;
        String alterado = token.substring(0, pos) + (token.charAt(pos) == 'A' ? "B" : "A") + token.substring(pos + 1);
        assertFalse(tokens.verificar(usuario, leccion, alterado, ahora));
        assertFalse(tokens.verificar(usuario, leccion, null, ahora));
        assertFalse(tokens.verificar(usuario, leccion, "texto-invalido", ahora));
    }
}
