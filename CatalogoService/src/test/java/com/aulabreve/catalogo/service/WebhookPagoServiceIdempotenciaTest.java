
package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.integration.VerificadorWebhook;
import com.aulabreve.catalogo.model.Compra;
import com.aulabreve.catalogo.model.EventoPago;
import com.aulabreve.catalogo.model.enums.*;
import com.aulabreve.catalogo.repository.DerechoAccesoRepository;
import com.aulabreve.catalogo.repository.EventoPagoRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebhookPagoServiceIdempotenciaTest {

    @Mock
    private VerificadorWebhook verificador;

    @Mock
    private EventoPagoRepository eventos;

    @Mock
    private DerechoAccesoRepository derechos;

    @Mock
    private EntityManager em;

    @InjectMocks
    private WebhookPagoService servicio;

    @Test
    void mismoEventoNoDebeProcesarseDosVeces() {

        UUID compraId = UUID.randomUUID();

        Compra compra = new Compra();
        compra.setId(compraId);
        compra.setProveedorCheckout("AULABREVE_DEMO");
        compra.setMontoTotal(new BigDecimal("149.90"));
        compra.setMoneda(Moneda.PEN);
        compra.setEstado(EstadoCompra.PENDIENTE);
        compra.setRevisionComercial(0L);

        var evento = new VerificadorWebhook.EventoVerificado(
            compraId,
            "AULABREVE_DEMO",
            "evento-demo-001",
            "transaccion-demo-001",
            TipoEventoPago.PAGO_RECHAZADO,
            1L,
            new BigDecimal("149.90"),
            Moneda.PEN,
            OffsetDateTime.now(),
            Map.of("origen", "prueba")
        );

        when(verificador.verificar(anyString(), anyMap()))
            .thenReturn(evento);

        when(em.find(
            Compra.class,
            compraId,
            LockModeType.PESSIMISTIC_WRITE
        )).thenReturn(compra);

        when(eventos.existsByProveedorAndEventoExternoId(
            "AULABREVE_DEMO",
            "evento-demo-001"
        )).thenReturn(false, true);

        boolean primera = servicio.procesar(
            "cuerpo-demo", Map.of()
        );

        boolean segunda = servicio.procesar(
            "cuerpo-demo", Map.of()
        );

        assertTrue(primera);
        assertFalse(segunda);

        assertEquals(
            EstadoCompra.FALLIDO,
            compra.getEstado()
        );

        verify(eventos, times(1))
            .save(any(EventoPago.class));

        verifyNoInteractions(derechos);
    }
}
