
package com.aulabreve.catalogo.integration;

import com.aulabreve.catalogo.exception.IntegracionNoConfiguradaException;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!demo")
public class CheckoutGatewayPendiente implements CheckoutGateway {

    @Override
    public Respuesta crearSesion(Solicitud solicitud) {

        throw new IntegracionNoConfiguradaException(
            "Checkout externo aun no configurado"
        );
    }
}
