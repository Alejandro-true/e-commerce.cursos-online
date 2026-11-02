
package com.aulabreve.catalogo.integration;

import com.aulabreve.catalogo.exception.IntegracionNoConfiguradaException;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Profile("!demo")
public class VerificadorWebhookPendiente
        implements VerificadorWebhook {

    @Override
    public EventoVerificado verificar(
            String raw,
            Map<String, String> headers) {

        throw new IntegracionNoConfiguradaException(
            "Validacion de firmas de webhook no configurada"
        );
    }
}
