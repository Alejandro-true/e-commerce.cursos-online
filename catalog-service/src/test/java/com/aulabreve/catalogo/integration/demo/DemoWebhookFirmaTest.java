package com.aulabreve.catalogo.integration.demo;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DemoWebhookFirmaTest {
    @Test
    void firmaValidaSeAceptaYAlteracionSeRechaza() {
        var firma = new DemoWebhookFirma("secreto-de-prueba-largo-de-32-caracteres-123");
        String cuerpo = "mensaje-de-prueba";
        String firmado = firma.firmar(cuerpo);
        assertDoesNotThrow(() -> firma.exigirFirmaValida(cuerpo, firmado));
        assertThrows(SecurityException.class,
            () -> firma.exigirFirmaValida(cuerpo + "alterado", firmado));
    }
}
