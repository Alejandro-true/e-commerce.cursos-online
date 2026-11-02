package com.aulabreve.catalogo.service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ClassPathResource;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** RF07 DEMO: nunca entrega contenido ni URL si el alumno no posee la version. */
@Service
@Profile("demo")
@Transactional(readOnly = true)
public class DemoVideoService {
    private static final Duration VIGENCIA = Duration.ofMinutes(3);
    private final JdbcTemplate jdbc;
    private final DerechoAccesoService accesos;
    private final DemoVideoTokens tokens;
    private final DemoVideoAlmacenPrivado almacen;

    public record LeccionVista(UUID id, String titulo, String tipo, String estadoVideo,
                               boolean disponible, String contenidoTexto) {}
    public record ModuloVista(UUID id, String titulo, List<LeccionVista> lecciones) {}
    public record ContenidoVista(UUID cursoId, String cursoTitulo, String numeroVersion,
                                List<ModuloVista> modulos) {}
    public record EnlaceVista(String urlTemporal, Instant expiraEn) {}
    private record VersionAdquirida(UUID versionId, String titulo, String numeroVersion) {}
    private record VideoInfo(UUID versionId, String tipo, String estadoVideo, String referencia) {}

    public DemoVideoService(JdbcTemplate jdbc, DerechoAccesoService accesos, DemoVideoTokens tokens,
                            DemoVideoAlmacenPrivado almacen) {
        this.jdbc = jdbc;
        this.accesos = accesos;
        this.tokens = tokens;
        this.almacen = almacen;
    }

    public ContenidoVista contenido(UUID usuarioId, UUID cursoId) {
        VersionAdquirida version = jdbc.query("""
                SELECT v.id AS version_id, c.titulo AS curso_titulo, v.numero_version
                FROM derechos_acceso d
                JOIN compras cp ON cp.id = d.compra_id
                JOIN curso_versiones v ON v.id = d.curso_version_id
                JOIN cursos c ON c.id = d.curso_id
                WHERE d.estudiante_id = ? AND d.curso_id = ?
                  AND d.estado_acceso = 'ACTIVO' AND cp.estado = 'PAGADO'
                  AND (d.fecha_expiracion IS NULL OR d.fecha_expiracion > now())
                ORDER BY d.fecha_otorgamiento DESC
                LIMIT 1
                """, rs -> rs.next() ? new VersionAdquirida(
                        rs.getObject("version_id", UUID.class), rs.getString("curso_titulo"),
                        rs.getString("numero_version")) : null,
                usuarioId.toString(), cursoId);
        if (version == null) throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "No tienes una compra vigente de este curso");
        exigirVigente(usuarioId, version.versionId());

        List<ModuloVista> modulos = jdbc.query("""
                SELECT id, titulo FROM modulos WHERE curso_version_id = ? ORDER BY orden ASC
                """, (rs, n) -> new ModuloVista(rs.getObject("id", UUID.class),
                        rs.getString("titulo"), lecciones(rs.getObject("id", UUID.class))),
                version.versionId());
        return new ContenidoVista(cursoId, version.titulo(), version.numeroVersion(), modulos);
    }

    private List<LeccionVista> lecciones(UUID moduloId) {
        return jdbc.query("""
                SELECT id, titulo, tipo, estado_video, video_referencia, contenido_texto
                FROM lecciones WHERE modulo_id = ? ORDER BY orden ASC
                """, (rs, n) -> {
                    String tipo = rs.getString("tipo");
                    String estado = rs.getString("estado_video");
                    boolean disponible = "VIDEO".equals(tipo) && "LISTO".equals(estado)
                            && referenciaReproducible(rs.getString("video_referencia"));
                    return new LeccionVista(rs.getObject("id", UUID.class), rs.getString("titulo"),
                            tipo, estado, disponible,
                            "LECTURA".equals(tipo) ? rs.getString("contenido_texto") : null);
                }, moduloId);
    }

    public EnlaceVista emitirEnlace(UUID usuarioId, UUID leccionId) {
        validarLeccion(usuarioId, leccionId);
        Instant ahora = Instant.now();
        Instant expira = ahora.plus(VIGENCIA);
        String token = tokens.crear(usuarioId, leccionId, VIGENCIA, ahora);
        return new EnlaceVista("/api/demo/video/lecciones/" + leccionId + "/stream?token=" + token,
                expira);
    }

    /** Cada peticion del navegador, incluidas peticiones Range, revalida el derecho. */
    public void permitirStream(UUID usuarioId, UUID leccionId, String token) {
        if (!tokens.verificar(usuarioId, leccionId, token, Instant.now())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Enlace no valido o vencido");
        }
        validarLeccion(usuarioId, leccionId);
    }

    private void validarLeccion(UUID usuarioId, UUID leccionId) {
        VideoInfo info = jdbc.query("""
                SELECT m.curso_version_id AS version_id, l.tipo, l.estado_video, l.video_referencia
                FROM lecciones l JOIN modulos m ON m.id = l.modulo_id WHERE l.id = ?
                """, rs -> rs.next() ? new VideoInfo(rs.getObject("version_id", UUID.class),
                        rs.getString("tipo"), rs.getString("estado_video"),
                        rs.getString("video_referencia")) : null, leccionId);
        if (info == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Leccion no encontrada");
        if (!"VIDEO".equals(info.tipo()) || !"LISTO".equals(info.estadoVideo())
                || !referenciaReproducible(info.referencia())) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT,
                    "La leccion no tiene un video DEMO disponible");
        }
        // Comprobacion de pago ademas del estado del derecho: defensa en profundidad.
        Long validas = jdbc.queryForObject("""
                SELECT count(*) FROM derechos_acceso d JOIN compras cp ON cp.id = d.compra_id
                WHERE d.estudiante_id = ? AND d.curso_version_id = ?
                  AND d.estado_acceso = 'ACTIVO' AND cp.estado = 'PAGADO'
                  AND (d.fecha_expiracion IS NULL OR d.fecha_expiracion > now())
                """, Long.class, usuarioId.toString(), info.versionId());
        if (validas == null || validas == 0L) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El curso no tiene acceso vigente");
        }
        exigirVigente(usuarioId, info.versionId());
    }

    private void exigirVigente(UUID usuarioId, UUID versionId) {
        try {
            accesos.exigirVigente(usuarioId.toString(), versionId);
        } catch (com.aulabreve.catalogo.exception.ReglaNegocioException ex) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso revocado o expirado");
        }
    }

    /** El servidor vuelve a verificar el token, el derecho y la version ANTES de abrir el archivo. */
    public Resource archivoAutorizado(UUID usuarioId, UUID leccionId, String token) {
        permitirStream(usuarioId, leccionId, token);
        List<String> referencias = jdbc.query(
                "SELECT video_referencia FROM lecciones WHERE id = ?",
                (rs, n) -> rs.getString(1), leccionId);
        if (referencias.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Leccion no encontrada");
        }
        String referencia = referencias.get(0);
        if (DemoVideoAlmacenPrivado.esReferenciaLocal(referencia)) {
            return almacen.abrir(referencia);
        }
        if (referenciaReproducible(referencia)) {
            Resource demo = new ClassPathResource("videos-demo/aulabreve-bienvenida.mp4");
            if (!demo.exists()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Video demo no instalado");
            return demo;
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Video no disponible");
    }

    /** Referencias locales opacas o referencias antiguas demo. Nunca se acepta una ruta libre. */
    private static boolean referenciaReproducible(String ref) {
        return DemoVideoAlmacenPrivado.esReferenciaLocal(ref)
                || "demo-video-001".equals(ref)
                || (ref != null && ref.matches("demo:[a-z0-9-]{1,60}"));
    }
}
