package com.aulabreve.catalogo.service;

import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

/** Lectura de compras para las pantallas locales de demostracion.
 * No modifica compras, eventos ni derechos. */
@Service
@Profile("demo")
public class DemoComprasConsultaService {
    public record CompraVista(UUID compraId, String estudianteId, UUID cursoId, String curso,
            String monto, String moneda, String estado, String acceso, String fechaCompra) {}

    private final JdbcTemplate jdbc;
    public DemoComprasConsultaService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private static final String SQL_BASE = """
        SELECT c.id, c.estudiante_id, c.curso_id, cu.titulo, c.monto_total, c.moneda,
               c.estado, COALESCE(d.estado_acceso, 'INEXISTENTE') AS acceso,
               c.fecha_compra
        FROM compras c
        JOIN cursos cu ON cu.id = c.curso_id
        LEFT JOIN derechos_acceso d ON d.compra_id = c.id
        WHERE c.proveedor_checkout = 'AULABREVE_DEMO'
        """;

    public List<CompraVista> todas() {
        return jdbc.query(SQL_BASE + " ORDER BY c.fecha_compra DESC LIMIT 100",
                (rs, n) -> mapear(rs));
    }

    public List<CompraVista> delEstudiante(String estudianteId) {
        return jdbc.query(SQL_BASE + " AND c.estudiante_id = ? ORDER BY c.fecha_compra DESC LIMIT 50",
                (rs, n) -> mapear(rs), estudianteId);
    }

    private static CompraVista mapear(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new CompraVista(
            UUID.fromString(rs.getString("id")),
            rs.getString("estudiante_id"),
            UUID.fromString(rs.getString("curso_id")), rs.getString("titulo"),
            rs.getBigDecimal("monto_total").toPlainString(),
            rs.getString("moneda"), rs.getString("estado"), rs.getString("acceso"),
            rs.getTimestamp("fecha_compra").toInstant().toString()
        );
    }
}
