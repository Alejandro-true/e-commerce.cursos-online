package com.aulabreve.catalogo.integration.demo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

@Component
@Profile("demo")
public class DemoWebhookFirma {
    private final byte[] secreto;

    public DemoWebhookFirma(@Value("${app.demo.webhook-secret}") String secreto) {
        if (secreto == null || secreto.length() < 32) {
            throw new IllegalArgumentException("DEMO_WEBHOOK_SECRET debe tener 32 o mas caracteres");
        }
        this.secreto = secreto.getBytes(StandardCharsets.UTF_8);
    }

    public String firmar(String cuerpo) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secreto, "HmacSHA256"));
            return "sha256=" + HexFormat.of().formatHex(mac.doFinal(cuerpo.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo firmar evento DEMO", e);
        }
    }

    public void exigirFirmaValida(String cuerpo, String firmaRecibida) {
        if (cuerpo == null || firmaRecibida == null || !firmaRecibida.startsWith("sha256=")) {
            throw new SecurityException("Firma DEMO ausente");
        }
        byte[] esperada = firmar(cuerpo).getBytes(StandardCharsets.US_ASCII);
        byte[] recibida = firmaRecibida.getBytes(StandardCharsets.US_ASCII);
        if (!MessageDigest.isEqual(esperada, recibida)) {
            throw new SecurityException("Firma DEMO invalida");
        }
    }
}
