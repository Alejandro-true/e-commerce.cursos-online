package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.dto.EstadoDerechoResponse;
import com.aulabreve.catalogo.exception.ReglaNegocioException;
import com.aulabreve.catalogo.model.Compra;
import com.aulabreve.catalogo.model.DerechoAcceso;
import com.aulabreve.catalogo.model.enums.EstadoAcceso;
import com.aulabreve.catalogo.model.enums.EstadoCompra;
import com.aulabreve.catalogo.repository.CompraRepository;
import com.aulabreve.catalogo.repository.DerechoAccesoRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/** RF06: estado comercial de acceso. El ID de estudiante DEBE venir del token autenticado. */
@Service
@Transactional(readOnly = true)
public class DerechoAccesoService {
    private final DerechoAccesoRepository derechos;
    private final CompraRepository compras;

    public DerechoAccesoService(DerechoAccesoRepository derechos, CompraRepository compras) {
        this.derechos = derechos;
        this.compras = compras;
    }

    public EstadoDerechoResponse consultar(String estudianteId, UUID cursoId) {
        requireIdentity(estudianteId);
        if (cursoId == null) throw new IllegalArgumentException("cursoId requerido");
        var derechosActivos = derechos.findByEstudianteIdAndCurso_IdAndEstadoAcceso(
                estudianteId, cursoId, EstadoAcceso.ACTIVO);
        for (DerechoAcceso derecho : derechosActivos) {
            if (vigente(derecho)) return respuesta(cursoId, "ACTIVO", derecho);
        }
        // Revisar compras mas recientes del estudiante; no mezcla datos de Progreso.
        var pagina = 0;
        do {
            var lote = compras.findByEstudianteIdOrderByFechaCompraDesc(estudianteId,
                    PageRequest.of(pagina++, 100));
            for (Compra c : lote) {
                if (!c.getCurso().getId().equals(cursoId)) continue;
                var d = derechos.findByCompra_Id(c.getId());
                if (d.isPresent()) {
                    DerechoAcceso derecho = d.get();
                    if (derecho.getEstadoAcceso() == EstadoAcceso.REVOCADO)
                        return respuesta(cursoId, "REVOCADO", derecho);
                    if (!vigente(derecho)) return respuesta(cursoId, "EXPIRADO", derecho);
                    return respuesta(cursoId, "ACTIVO", derecho);
                }
                if (c.getEstado() == EstadoCompra.PENDIENTE)
                    return new EstadoDerechoResponse(cursoId, "PENDIENTE",
                            c.getCursoVersion().getId(), null);
                if (c.getEstado() == EstadoCompra.REEMBOLSADO)
                    return new EstadoDerechoResponse(cursoId, "REVOCADO",
                            c.getCursoVersion().getId(), null);
            }
            if (!lote.hasNext()) break;
        } while (true);
        return new EstadoDerechoResponse(cursoId, "INEXISTENTE", null, null);
    }

    public void exigirVigente(String estudianteId, UUID versionId) {
        requireIdentity(estudianteId);
        if (versionId == null) throw new IllegalArgumentException("versionId requerido");
        DerechoAcceso d = derechos.findByEstudianteIdAndCursoVersion_IdAndEstadoAcceso(
                estudianteId, versionId, EstadoAcceso.ACTIVO)
                .orElseThrow(() -> new ReglaNegocioException("Sin derecho de acceso"));
        if (!vigente(d)) throw new ReglaNegocioException("Acceso expirado");
    }

    public static boolean vigente(DerechoAcceso derecho) {
        return derecho.getEstadoAcceso() == EstadoAcceso.ACTIVO
                && (derecho.getFechaExpiracion() == null
                    || derecho.getFechaExpiracion().isAfter(OffsetDateTime.now(ZoneOffset.UTC)));
    }

    private static EstadoDerechoResponse respuesta(UUID cursoId, String estado, DerechoAcceso d) {
        return new EstadoDerechoResponse(cursoId, estado,
                d.getCursoVersion().getId(), d.getFechaExpiracion());
    }

    public static void requireIdentity(String estudianteId) {
        if (estudianteId == null || estudianteId.isBlank())
            throw new IllegalArgumentException("Identidad autenticada requerida");
    }
}
