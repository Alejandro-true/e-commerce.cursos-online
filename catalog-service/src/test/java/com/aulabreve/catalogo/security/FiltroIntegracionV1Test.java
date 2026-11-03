package com.aulabreve.catalogo.security;

import org.junit.jupiter.api.Test;
import java.nio.charset.StandardCharsets;
import static org.junit.jupiter.api.Assertions.*;

class FiltroIntegracionV1Test {
    @Test void rechazaClavesIncorrectasYVacias() {
        byte[] clave = "demo_clave_interna_de_32_caracteres_o_mas".getBytes(StandardCharsets.UTF_8);
        assertTrue(FiltroIntegracionV1.coincide(clave,
                "demo_clave_interna_de_32_caracteres_o_mas"));
        assertFalse(FiltroIntegracionV1.coincide(clave, "otra-clave"));
        assertFalse(FiltroIntegracionV1.coincide(clave, null));
        assertThrows(IllegalStateException.class, () -> new FiltroIntegracionV1("corta"));
    }
}
