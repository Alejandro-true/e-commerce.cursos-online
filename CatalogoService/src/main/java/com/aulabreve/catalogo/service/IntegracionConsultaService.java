package com.aulabreve.catalogo.service;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

/** Lecturas inter-servicio. NO modifica derechos ni el progreso del estudiante. */
@Service
@Profile("demo")
@Transactional(readOnly = true)
public class IntegracionConsultaService {
    public record Acceso(UUID estudianteId, UUID cursoId, UUID cursoVersionId,
                         boolean activo, OffsetDateTime verificadoEn) {}
    public record Leccion(UUID id, String titulo, String tipo, boolean obligatorio, int orden) {}
    public record Modulo(UUID id, String titulo, int orden, List<Leccion> lecciones) {}
    public record Estructura(UUID cursoId, UUID cursoVersionId, String numeroVersion,
                            String estadoVersion, List<Modulo> modulos) {}

    private final JdbcTemplate jdbc;
    public IntegracionConsultaService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Acceso comprobarAcceso(UUID estudianteId, UUID cursoId, UUID versionId) {
        String sql = """
            SELECT d.curso_version_id
              FROM derechos_acceso d JOIN compras cp ON cp.id = d.compra_id
             WHERE d.estudiante_id = ? AND d.curso_id = ?
               AND d.estado_acceso = 'ACTIVO' AND cp.estado = 'PAGADO'
               AND (d.fecha_expiracion IS NULL OR d.fecha_expiracion > now())
            """;
        List<Object> argumentos = new java.util.ArrayList<>();
        argumentos.add(estudianteId.toString());
        argumentos.add(cursoId);
        if (versionId != null) {
            sql += " AND d.curso_version_id = ?";
            argumentos.add(versionId);
        }
        sql += " ORDER BY d.fecha_otorgamiento DESC LIMIT 1";
        List<UUID> versiones = jdbc.query(sql,
                (rs, numero) -> rs.getObject("curso_version_id", UUID.class),
                argumentos.toArray());
        UUID concedida = versiones.isEmpty() ? null : versiones.get(0);
        return new Acceso(estudianteId, cursoId, concedida, concedida != null,
                OffsetDateTime.now(ZoneOffset.UTC));
    }

    public Estructura obtenerEstructura(UUID versionId) {
        record Cabecera(UUID cursoId, String numeroVersion, String estado) {}
        List<Cabecera> cabeceras = jdbc.query("""
                SELECT curso_id, numero_version, estado
                  FROM curso_versiones WHERE id = ?
                """, (rs, numero) -> new Cabecera(
                rs.getObject("curso_id", UUID.class), rs.getString("numero_version"),
                rs.getString("estado")), versionId);
        if (cabeceras.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Version no encontrada");
        }
        Cabecera cabecera = cabeceras.get(0);
        if (!"PUBLICADA".equals(cabecera.estado()) && !"RETIRADA".equals(cabecera.estado())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "La version no es visible para integraciones");
        }
        // Consultas consecutivas para no abrir otro ResultSet dentro del RowMapper.
        List<Modulo> cabecerasModulos = jdbc.query("""
                SELECT id, titulo, orden FROM modulos
                WHERE curso_version_id = ? ORDER BY orden ASC
                """, (rs, numero) -> new Modulo(rs.getObject("id", UUID.class),
                rs.getString("titulo"), rs.getInt("orden"), List.of()), versionId);
        List<Modulo> modulos = cabecerasModulos.stream().map(m -> {
            List<Leccion> lecciones = jdbc.query("""
                    SELECT id, titulo, tipo, obligatorio, orden
                    FROM lecciones WHERE modulo_id = ? ORDER BY orden ASC
                    """, (rs, numero) -> new Leccion(rs.getObject("id", UUID.class),
                    rs.getString("titulo"), rs.getString("tipo"),
                    rs.getBoolean("obligatorio"), rs.getInt("orden")), m.id());
            return new Modulo(m.id(), m.titulo(), m.orden(), lecciones);
        }).toList();
        return new Estructura(cabecera.cursoId(), versionId,
                cabecera.numeroVersion(), cabecera.estado(), modulos);
    }
}
