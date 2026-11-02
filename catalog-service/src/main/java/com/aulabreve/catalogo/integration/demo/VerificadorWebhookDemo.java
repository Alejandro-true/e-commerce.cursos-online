package com.aulabreve.catalogo.integration.demo;

import com.aulabreve.catalogo.integration.VerificadorWebhook;
import com.aulabreve.catalogo.model.enums.Moneda;
import com.aulabreve.catalogo.model.enums.TipoEventoPago;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;

@Component
@Profile("demo")
public class VerificadorWebhookDemo implements VerificadorWebhook {
    public static final String CABECERA_FIRMA = "X-Demo-Signature";
    private final DemoWebhookFirma firmas;

    public VerificadorWebhookDemo(DemoWebhookFirma firmas) {
        this.firmas = firmas;
    }

    @Override
    public EventoVerificado verificar(String cuerpoRaw, Map<String, String> cabeceras) {
        String firma = cabeceras == null ? null : cabeceras.get(CABECERA_FIRMA);
        firmas.exigirFirmaValida(cuerpoRaw, firma);
        // Formato CANONICO firmado: idCompra|idEvento|idSesion|tipo|revision|monto|moneda|epochSeconds
        String[] p = cuerpoRaw.split("\\|", -1);
        if (p.length != 8) throw new SecurityException("Evento DEMO mal formado");
        try {
            UUID compraId = UUID.fromString(p[0]);
            UUID eventoId = UUID.fromString(p[1]);
            UUID.fromString(p[2]); // La sesion DEMO siempre es UUID.
            TipoEventoPago tipo = TipoEventoPago.valueOf(p[3]);
            long revision = Long.parseLong(p[4]);
            BigDecimal monto = new BigDecimal(p[5]);
            Moneda moneda = Moneda.valueOf(p[6]);
            Instant instante = Instant.ofEpochSecond(Long.parseLong(p[7]));
            if (revision < 1 || monto.signum() <= 0 ||
                    Math.abs(Duration.between(instante, Instant.now()).toSeconds()) > 300) {
                throw new SecurityException("Evento DEMO vencido o invalido");
            }
            return new EventoVerificado(compraId, CheckoutGatewayDemo.PROVEEDOR,
                eventoId.toString(), "DEMO-TX-" + p[2], tipo, revision,
                monto, moneda, OffsetDateTime.ofInstant(instante, ZoneOffset.UTC),
                Map.of("origen", "simulador-aulabreve", "sesion", p[2], "tipo", tipo.name()));
        } catch (IllegalArgumentException | java.time.DateTimeException e) {
            throw new SecurityException("Formato de webhook DEMO invalido", e);
        }
    }
}
