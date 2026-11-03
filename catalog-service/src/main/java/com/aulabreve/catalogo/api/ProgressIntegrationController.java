package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.dto.EstadoDerechoResponse;
import com.aulabreve.catalogo.model.CursoVersion;
import com.aulabreve.catalogo.model.Modulo;
import com.aulabreve.catalogo.model.enums.EstadoCursoVersion;
import com.aulabreve.catalogo.repository.CursoVersionRepository;
import com.aulabreve.catalogo.repository.LeccionRepository;
import com.aulabreve.catalogo.repository.ModuloRepository;
import com.aulabreve.catalogo.service.DerechoAccesoService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.UUID;

/** Contrato interno usado por Progress y Community; requiere clave de servicio. */
@RestController
@RequestMapping("/api/internal/progreso")
public class ProgressIntegrationController {
    private final DerechoAccesoService accesos;
    private final CursoVersionRepository versiones;
    private final ModuloRepository modulos;
    private final LeccionRepository lecciones;
    private final String serviceKey;

    public ProgressIntegrationController(
            DerechoAccesoService accesos,
            CursoVersionRepository versiones,
            ModuloRepository modulos,
            LeccionRepository lecciones,
            @Value("${app.integration.service-key:}") String serviceKey) {
        this.accesos = accesos;
        this.versiones = versiones;
        this.modulos = modulos;
        this.lecciones = lecciones;
        this.serviceKey = serviceKey;
    }

    @GetMapping("/cursos/{cursoId}/acceso/{estudianteId}")
    public EstadoDerechoResponse consultarAcceso(
            @RequestHeader(value = "X-Service-Key", required = false) String key,
            @PathVariable UUID cursoId,
            @PathVariable String estudianteId) {
        exigirClave(key);
        return accesos.consultar(estudianteId, cursoId);
    }

    @GetMapping("/cursos/{cursoId}/versiones/{versionId}")
    @Transactional(readOnly = true)
    public EstructuraCurso obtenerEstructura(
            @RequestHeader(value = "X-Service-Key", required = false) String key,
            @PathVariable UUID cursoId,
            @PathVariable UUID versionId) {
        exigirClave(key);
        CursoVersion version = versiones.findById(versionId)
                .filter(item -> item.getCurso().getId().equals(cursoId))
                .filter(item -> item.getEstado() == EstadoCursoVersion.PUBLICADA
                        || item.getEstado() == EstadoCursoVersion.RETIRADA)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Versión publicada no encontrada"));

        List<ModuloEstructura> contenido = modulos
                .findByCursoVersion_IdOrderByOrdenAsc(version.getId())
                .stream()
                .map(this::mapearModulo)
                .toList();
        return new EstructuraCurso(cursoId.toString(), versionId.toString(), contenido);
    }

    private ModuloEstructura mapearModulo(Modulo modulo) {
        List<LeccionEstructura> contenido = lecciones
                .findByModulo_IdOrderByOrdenAsc(modulo.getId())
                .stream()
                .map(leccion -> new LeccionEstructura(
                        leccion.getId().toString(),
                        Boolean.TRUE.equals(leccion.getObligatorio()),
                        leccion.getTitulo(),
                        leccion.getDuracionSegundos()))
                .toList();
        return new ModuloEstructura(modulo.getId().toString(), contenido);
    }

    private void exigirClave(String proporcionada) {
        if (serviceKey.isBlank() || proporcionada == null
                || !MessageDigest.isEqual(
                        serviceKey.getBytes(StandardCharsets.UTF_8),
                        proporcionada.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Clave de servicio inválida");
        }
    }

    public record EstructuraCurso(String idCurso, String versionCurso, List<ModuloEstructura> modulos) {}
    public record ModuloEstructura(String idModulo, List<LeccionEstructura> lecciones) {}
    public record LeccionEstructura(
            String idLeccion, boolean obligatoria, String tituloLeccion, Integer duracionSegundos) {}
}
