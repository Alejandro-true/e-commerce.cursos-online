package com.aulabreve.catalogo.service;
import com.aulabreve.catalogo.exception.IntegracionNoConfiguradaException;
import com.aulabreve.catalogo.integration.*;
import org.junit.jupiter.api.Test;
import java.time.Duration;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertThrows;
class IntegracionesPendientesTest {
    @Test void checkoutSinProveedorNoCreaComprasSimuladas() {
        assertThrows(IntegracionNoConfiguradaException.class,
                () -> new CheckoutGatewayPendiente().crearSesion(null));
    }
    @Test void webhookSinVerificacionNoConcedeAcceso() {
        assertThrows(IntegracionNoConfiguradaException.class,
                () -> new VerificadorWebhookPendiente().verificar("{}", Map.of()));
    }
    @Test void videoSinCDNNoDevuelveEnlaceFalso() {
        assertThrows(IntegracionNoConfiguradaException.class,
                () -> new VideoGatewayPendiente().generarUrlTemporal("private-id", Duration.ofMinutes(3)));
    }
}
