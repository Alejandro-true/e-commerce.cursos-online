package com.aulabreve.catalogo.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** Token HMAC limitado por estudiante, leccion y expiracion. Solo DEMO local. */
@Component
@Profile("demo")
public class DemoVideoTokens {
    private final byte[] clave;

    public DemoVideoTokens(@Value("${DEMO_VIDEO_SECRET:}") String secreto) {
        if (secreto == null || secreto.length() < 32) {
            throw new IllegalStateException("Configura DEMO_VIDEO_SECRET (al menos 32 caracteres) en .env");
        }
        this.clave = secreto.getBytes(StandardCharsets.UTF_8);
    }

    public String crear(UUID usuarioId, UUID leccionId, Duration vigencia, Instant ahora) {
        if (vigencia == null || vigencia.isNegative() || vigencia.isZero()) {
            throw new IllegalArgumentException("Vigencia positiva requerida");
        }
        long expira = ahora.plus(vigencia).getEpochSecond();
        String firma = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(firmar(datos(usuarioId, leccionId, expira)));
        return expira + "." + firma;
    }

    public boolean verificar(UUID usuarioId, UUID leccionId, String token, Instant ahora) {
        if (token == null || !token.matches("[0-9]{1,15}\\.[A-Za-z0-9_-]{43}")) return false;
        int punto = token.indexOf('.');
        try {
            long expira = Long.parseLong(token.substring(0, punto));
            if (expira <= ahora.getEpochSecond() || expira > ahora.plusSeconds(3600).getEpochSecond())
                return false;
            byte[] recibida = Base64.getUrlDecoder().decode(token.substring(punto + 1));
            return MessageDigest.isEqual(recibida, firmar(datos(usuarioId, leccionId, expira)));
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private String datos(UUID usuarioId, UUID leccionId, long expira) {
        return "aulabreve-video-v1|" + usuarioId + "|" + leccionId + "|" + expira;
    }

    private byte[] firmar(String texto) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(clave, "HmacSHA256"));
            return mac.doFinal(texto.getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo firmar el enlace de video", ex);
        }
    }
}
