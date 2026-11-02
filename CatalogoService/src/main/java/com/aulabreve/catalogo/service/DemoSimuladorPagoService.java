package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.exception.RecursoNoEncontradoException;
import com.aulabreve.catalogo.exception.ReglaNegocioException;
import com.aulabreve.catalogo.integration.demo.CheckoutGatewayDemo;
import com.aulabreve.catalogo.integration.demo.DemoWebhookFirma;
import com.aulabreve.catalogo.integration.demo.VerificadorWebhookDemo;
import com.aulabreve.catalogo.model.Compra;
import com.aulabreve.catalogo.model.enums.EstadoCompra;
import com.aulabreve.catalogo.model.enums.EstadoAcceso;
import com.aulabreve.catalogo.model.enums.TipoEventoPago;
import com.aulabreve.catalogo.repository.CompraRepository;
import com.aulabreve.catalogo.repository.DerechoAccesoRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@Profile("demo")
public class DemoSimuladorPagoService {
    public enum Resultado { APROBADO, RECHAZADO, REEMBOLSADO }
    public record Vista(UUID compraId, String titulo, String sesion,
            String estudianteId, String monto, String moneda, String estado, String acceso) {}
    public record ResultadoDemo(UUID compraId, UUID eventoId, boolean aplicado,
            String estadoCompra, String estadoAcceso) {}

    private final CompraRepository compras;
    private final DerechoAccesoRepository derechos;
    private final WebhookPagoService webhooks;
    private final DemoWebhookFirma firma;

    public DemoSimuladorPagoService(CompraRepository compras,
            DerechoAccesoRepository derechos, WebhookPagoService webhooks, DemoWebhookFirma firma) {
        this.compras = compras;
        this.derechos = derechos;
        this.webhooks = webhooks;
        this.firma = firma;
    }

    @Transactional(readOnly = true)
    public Vista consultarPorSesion(String sesion) {
        Compra compra = compras.findByProveedorCheckoutAndCheckoutSesionId(
                CheckoutGatewayDemo.PROVEEDOR, sesion)
            .orElseThrow(() -> new RecursoNoEncontradoException("Sesion no encontrada"));
        return vista(compra);
    }

    @Transactional(readOnly = true)
    public Vista consultarPorCompra(UUID compraId) {
        // Mantener el JOIN FETCH que ya corrigió el LazyInitializationException.
        Compra compra = compras.buscarConCursoPorId(compraId)
            .orElseThrow(() -> new RecursoNoEncontradoException("Compra no encontrada"));
        if (!CheckoutGatewayDemo.PROVEEDOR.equals(compra.getProveedorCheckout())) {
            throw new SecurityException("Solo se consultan compras DEMO");
        }
        return vista(compra);
    }

    private Vista vista(Compra compra) {
        String acceso = derechos.findByCompra_Id(compra.getId())
                .map(d -> d.getEstadoAcceso().name()).orElse("INEXISTENTE");
        return new Vista(compra.getId(), compra.getCurso().getTitulo(),
            compra.getCheckoutSesionId(), compra.getEstudianteId(),
            compra.getMontoTotal().toPlainString(), compra.getMoneda().name(),
            compra.getEstado().name(), acceso);
    }

    // Deliberadamente NO @Transactional aqui: el webhook mantiene su propia transaccion.
    public ResultadoDemo simular(UUID compraId, Resultado resultado) {
        Compra compra = compras.findById(compraId)
            .orElseThrow(() -> new RecursoNoEncontradoException("Compra no encontrada"));
        if (!CheckoutGatewayDemo.PROVEEDOR.equals(compra.getProveedorCheckout())) {
            throw new SecurityException("La compra no pertenece al simulador");
        }
        // Protección adicional para solicitudes duplicadas antiguas ya existentes:
        // no confirmar otro pago si el mismo estudiante ya tiene este curso vigente.
        if (resultado == Resultado.APROBADO && compra.getEstado() == EstadoCompra.PENDIENTE) {
            boolean yaTieneCurso = derechos.findByEstudianteIdAndCurso_IdAndEstadoAcceso(
                    compra.getEstudianteId(), compra.getCurso().getId(), EstadoAcceso.ACTIVO)
                .stream().anyMatch(DerechoAccesoService::vigente);
            if (yaTieneCurso) {
                throw new ReglaNegocioException(
                        "Este alumno ya tiene acceso vigente. Rechaza la solicitud duplicada.");
            }
        }
        TipoEventoPago tipo;
        if (resultado == Resultado.APROBADO && compra.getEstado() == EstadoCompra.PENDIENTE) {
            tipo = TipoEventoPago.PAGO_CONFIRMADO;
        } else if (resultado == Resultado.RECHAZADO && compra.getEstado() == EstadoCompra.PENDIENTE) {
            tipo = TipoEventoPago.PAGO_RECHAZADO;
        } else if (resultado == Resultado.REEMBOLSADO && compra.getEstado() == EstadoCompra.PAGADO) {
            tipo = TipoEventoPago.REEMBOLSO_CONFIRMADO;
        } else {
            throw new ReglaNegocioException("Transicion de pago DEMO no permitida");
        }
        UUID eventoId = UUID.randomUUID();
        long revision = compra.getRevisionComercial() + 1;
        String cuerpo = String.join("|", compraId.toString(), eventoId.toString(),
            compra.getCheckoutSesionId(), tipo.name(), Long.toString(revision),
            compra.getMontoTotal().toPlainString(), compra.getMoneda().name(),
            Long.toString(Instant.now().getEpochSecond()));
        boolean aplicado = webhooks.procesar(cuerpo,
            Map.of(VerificadorWebhookDemo.CABECERA_FIRMA, firma.firmar(cuerpo)));
        Vista actual = consultarPorCompra(compraId);
        return new ResultadoDemo(compraId, eventoId, aplicado,
            actual.estado(), actual.acceso());
    }
}
