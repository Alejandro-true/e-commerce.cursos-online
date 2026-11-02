
package com.aulabreve.catalogo.integration.demo;

import com.aulabreve.catalogo.integration.VideoGateway;
import com.aulabreve.catalogo.exception.IntegracionNoConfiguradaException;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.time.Duration;

@Component
@Profile("demo")
public class VideoGatewayDemo implements VideoGateway {

    @Override
    public URI generarUrlTemporal(
            String referencia,
            Duration vigencia) {

        throw new IntegracionNoConfiguradaException(
            "La reproducción de videos DEMO aún no está implementada"
        );
    }
}
