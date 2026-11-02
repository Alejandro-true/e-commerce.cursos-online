package com.aulabreve.catalogo.integration.demo;

import com.aulabreve.catalogo.integration.CheckoutGateway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.util.UUID;

@Component
@Profile("demo")
public class CheckoutGatewayDemo implements CheckoutGateway {
    public static final String PROVEEDOR = "AULABREVE_DEMO";
    private final String baseUrl;

    public CheckoutGatewayDemo(@Value("${app.demo.base-url}") String baseUrl) {
        this.baseUrl = baseUrl.replaceAll("/+$", "");
        URI u = URI.create(this.baseUrl);
        if (!"http".equals(u.getScheme()) || !"127.0.0.1".equals(u.getHost())) {
            throw new IllegalArgumentException("El checkout DEMO solo admite http://127.0.0.1");
        }
    }

    @Override
    public Respuesta crearSesion(Solicitud solicitud) {
        String sesion = UUID.randomUUID().toString();
        return new Respuesta(PROVEEDOR, sesion, "DEMO-" + sesion,
            URI.create(baseUrl + "/demo/checkout/" + sesion));
    }
}
