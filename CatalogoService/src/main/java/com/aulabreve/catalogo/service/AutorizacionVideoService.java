package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.dto.EnlaceVideoResponse;
import com.aulabreve.catalogo.exception.RecursoNoEncontradoException;
import com.aulabreve.catalogo.exception.ReglaNegocioException;
import com.aulabreve.catalogo.integration.VideoGateway;
import com.aulabreve.catalogo.model.enums.EstadoVideo;
import com.aulabreve.catalogo.model.enums.TipoLeccion;
import com.aulabreve.catalogo.repository.LeccionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/** RF07: valida derecho antes de emitir URL; nunca expone videoReferencia. */
@Service
@Transactional(readOnly = true)
public class AutorizacionVideoService {
    private static final Duration VIGENCIA = Duration.ofMinutes(3);
    private final LeccionRepository lecciones;
    private final DerechoAccesoService accesos;
    private final VideoGateway videos;

    public AutorizacionVideoService(LeccionRepository lecciones,
            DerechoAccesoService accesos, VideoGateway videos) {
        this.lecciones = lecciones;
        this.accesos = accesos;
        this.videos = videos;
    }

    public EnlaceVideoResponse autorizar(String estudianteAutenticado, UUID leccionId) {
        DerechoAccesoService.requireIdentity(estudianteAutenticado);
        var leccion = lecciones.findById(leccionId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Leccion no encontrada"));
        if (leccion.getTipo() != TipoLeccion.VIDEO || leccion.getEstadoVideo() != EstadoVideo.LISTO
                || leccion.getVideoReferencia() == null || leccion.getVideoReferencia().isBlank())
            throw new ReglaNegocioException("Leccion sin video disponible");
        UUID versionId = leccion.getModulo().getCursoVersion().getId();
        accesos.exigirVigente(estudianteAutenticado, versionId);
        var url = videos.generarUrlTemporal(leccion.getVideoReferencia(), VIGENCIA);
        if (url == null || !"https".equalsIgnoreCase(url.getScheme()))
            throw new ReglaNegocioException("URL de video no segura");
        return new EnlaceVideoResponse(url, OffsetDateTime.now(ZoneOffset.UTC).plus(VIGENCIA));
    }
}
