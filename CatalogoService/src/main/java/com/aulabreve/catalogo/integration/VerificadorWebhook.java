package com.aulabreve.catalogo.integration;
import com.aulabreve.catalogo.model.enums.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
/** Adaptador responsable de AUTENTICAR firma y consultar estado vigente en proveedor. */
public interface VerificadorWebhook {
    EventoVerificado verificar(String cuerpoRaw, Map<String,String> cabeceras);
    record EventoVerificado(UUID compraId, String proveedor, String eventoId,
        String transaccionId, TipoEventoPago tipo, long revisionEstado,
        BigDecimal monto, Moneda moneda, OffsetDateTime fechaProveedor,
        Map<String,Object> resumenSinDatosSensibles) {}
}
