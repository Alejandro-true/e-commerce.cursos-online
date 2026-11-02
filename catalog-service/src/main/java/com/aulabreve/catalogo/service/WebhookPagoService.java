package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.integration.VerificadorWebhook;
import com.aulabreve.catalogo.model.Compra;
import com.aulabreve.catalogo.model.DerechoAcceso;
import com.aulabreve.catalogo.model.EventoPago;
import com.aulabreve.catalogo.model.enums.*;
import com.aulabreve.catalogo.repository.DerechoAccesoRepository;
import com.aulabreve.catalogo.repository.EventoPagoRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;

/** RF05: solo procesa eventos cuya autenticidad y estado verifico el proveedor. */
@Service
public class WebhookPagoService {
    private final VerificadorWebhook verificador;
    private final EventoPagoRepository eventos;
    private final DerechoAccesoRepository derechos;
    private final EntityManager em;

    public WebhookPagoService(VerificadorWebhook verificador, EventoPagoRepository eventos,
            DerechoAccesoRepository derechos, EntityManager em) {
        this.verificador = verificador;
        this.eventos = eventos;
        this.derechos = derechos;
        this.em = em;
    }

    @Transactional
    public boolean procesar(String cuerpoRaw, Map<String,String> cabeceras) {
        // El adaptador no configurado SIEMPRE rechaza. Nunca confiar en el estado del navegador.
        var e = verificador.verificar(cuerpoRaw, cabeceras);
        if (e == null || e.compraId() == null || e.eventoId() == null || e.eventoId().isBlank()
                || e.proveedor() == null || e.proveedor().isBlank() || e.tipo() == null
                || e.monto() == null || e.moneda() == null || e.revisionEstado() < 1) {
            throw new SecurityException("Webhook no verificado o incompleto");
        }
        Compra compra = em.find(Compra.class, e.compraId(), LockModeType.PESSIMISTIC_WRITE);
        if (compra == null || !compra.getProveedorCheckout().equals(e.proveedor())
                || compra.getMontoTotal().compareTo(e.monto()) != 0
                || compra.getMoneda() != e.moneda()) {
            throw new SecurityException("Datos comerciales del webhook no coinciden");
        }
        if (eventos.existsByProveedorAndEventoExternoId(e.proveedor(), e.eventoId())) return false;

        boolean nuevoEstado = e.revisionEstado() > compra.getRevisionComercial();
        boolean aplicado = false;
        if (nuevoEstado) {
            switch (e.tipo()) {
                case PAGO_CONFIRMADO -> {
                    if (compra.getEstado() != EstadoCompra.REEMBOLSADO
                            && compra.getEstado() != EstadoCompra.CANCELADO) {
                        compra.setEstado(EstadoCompra.PAGADO);
                        if (compra.getFechaPago() == null)
                            compra.setFechaPago(OffsetDateTime.now(ZoneOffset.UTC));
                        if (derechos.findByCompra_Id(compra.getId()).isEmpty()
                                && derechos.findByEstudianteIdAndCursoVersion_IdAndEstadoAcceso(
                                    compra.getEstudianteId(), compra.getCursoVersion().getId(),
                                    EstadoAcceso.ACTIVO).isEmpty()) {
                            DerechoAcceso derecho = new DerechoAcceso();
                            derecho.setCompra(compra);
                            derecho.setEstudianteId(compra.getEstudianteId());
                            derecho.setCurso(compra.getCurso());
                            derecho.setCursoVersion(compra.getCursoVersion());
                            derecho.setEstadoAcceso(EstadoAcceso.ACTIVO);
                            derechos.save(derecho);
                        }
                        aplicado = true;
                    }
                }
                case PAGO_RECHAZADO -> {
                    if (compra.getEstado() == EstadoCompra.PENDIENTE) {
                        compra.setEstado(EstadoCompra.FALLIDO);
                        aplicado = true;
                    }
                }
                case REEMBOLSO_CONFIRMADO -> {
                    compra.setEstado(EstadoCompra.REEMBOLSADO);
                    derechos.findByCompra_Id(compra.getId()).ifPresent(d -> {
                        if (d.getEstadoAcceso() == EstadoAcceso.ACTIVO) {
                            d.setEstadoAcceso(EstadoAcceso.REVOCADO);
                            d.setFechaRevocacion(OffsetDateTime.now(ZoneOffset.UTC));
                            d.setMotivoRevocacion("Reembolso comercial verificado");
                        }
                    });
                    aplicado = true;
                }
            }
            compra.setRevisionComercial(e.revisionEstado());
        }
        EventoPago auditoria = new EventoPago();
        auditoria.setCompra(compra);
        auditoria.setProveedor(e.proveedor());
        auditoria.setEventoExternoId(e.eventoId());
        auditoria.setTransaccionExternaId(e.transaccionId());
        auditoria.setTipoEvento(e.tipo());
        auditoria.setVersionEstadoExterno(e.revisionEstado());
        auditoria.setResultadoProcesamiento(aplicado ? ResultadoProcesamiento.PROCESADO
                                                      : ResultadoProcesamiento.IGNORADO);
        auditoria.setPayloadResumen(e.resumenSinDatosSensibles() == null
                ? Map.of() : Map.copyOf(e.resumenSinDatosSensibles()));
        auditoria.setFechaEventoProveedor(e.fechaProveedor());
        eventos.save(auditoria);
        return aplicado;
    }
}
