package com.aulabreve.catalogo.integration;
import com.aulabreve.catalogo.model.enums.Moneda;
import java.math.BigDecimal;
import java.net.URI;
import java.util.UUID;
public interface CheckoutGateway {
    Respuesta crearSesion(Solicitud solicitud);
    record Solicitud(String estudianteId, UUID cursoId, UUID versionId,
                    BigDecimal monto, Moneda moneda) {}
    record Respuesta(String proveedor, String sesionId, String pedidoId, URI urlCheckout) {}
}
