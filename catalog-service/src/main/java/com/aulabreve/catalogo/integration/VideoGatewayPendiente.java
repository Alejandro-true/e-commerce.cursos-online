
package com.aulabreve.catalogo.integration;

import com.aulabreve.catalogo.exception.IntegracionNoConfiguradaException;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.time.Duration;

@Component
@Profile("!demo")
public class VideoGatewayPendiente implements VideoGateway {

    @Override
    public URI generarUrlTemporal(
            String referencia,
            Duration vigencia) {

        throw new IntegracionNoConfiguradaException(
            "Proveedor de video no configurado"
        );
    }
}
