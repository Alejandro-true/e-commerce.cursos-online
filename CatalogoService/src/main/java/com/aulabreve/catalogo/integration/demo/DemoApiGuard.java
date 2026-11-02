package com.aulabreve.catalogo.integration.demo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
@Profile("demo")
public class DemoApiGuard {
    private final byte[] clave;

    public DemoApiGuard(@Value("${app.demo.api-key}") String clave) {
        if (clave == null || clave.length() < 32) {
            throw new IllegalArgumentException("DEMO_API_KEY debe tener 32 o mas caracteres");
        }
        this.clave = clave.getBytes(StandardCharsets.UTF_8);
    }

    public void exigir(String proporcionada) {
        if (proporcionada == null || !MessageDigest.isEqual(clave,
                proporcionada.getBytes(StandardCharsets.UTF_8))) {
            throw new SecurityException("Clave de simulacion incorrecta");
        }
    }
}
