package com.aulabreve.catalogo.integration.demo;

import com.aulabreve.catalogo.model.enums.TipoEventoPago;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

class VerificadorWebhookDemoTest {
    @Test
    void aceptaEventoFirmadoYRechazaFirmaFalsa() {
        var firma = new DemoWebhookFirma("otro-secreto-de-prueba-de-32-caracteres-abc");
        var verificador = new VerificadorWebhookDemo(firma);
        UUID compra = UUID.randomUUID();
        String cuerpo = String.join("|", compra.toString(), UUID.randomUUID().toString(),
            UUID.randomUUID().toString(), "PAGO_CONFIRMADO", "1", "149.90", "PEN",
            Long.toString(Instant.now().getEpochSecond()));
        var evento = verificador.verificar(cuerpo,
            Map.of("X-Demo-Signature", firma.firmar(cuerpo)));
        assertEquals(compra, evento.compraId());
        assertEquals(TipoEventoPago.PAGO_CONFIRMADO, evento.tipo());
        assertThrows(SecurityException.class,
            () -> verificador.verificar(cuerpo, Map.of("X-Demo-Signature", "sha256=0000")));
    }
}
