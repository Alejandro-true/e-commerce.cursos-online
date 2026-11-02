package com.aulabreve.catalogo.service;

import java.util.List;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/** Solo permite subir o sustituir MP4 en lecciones de versiones BORRADOR. */
@Service
@Profile("demo")
public class DemoCargaVideoAdminService {
    public record Resultado(UUID leccionId, String referencia, String estadoVideo) {}
    private record Destino(String estadoCurso, String estadoVersion, String tipo, String anterior) {}
    private final JdbcTemplate jdbc;
    private final DemoVideoAlmacenPrivado almacen;

    public DemoCargaVideoAdminService(JdbcTemplate jdbc, DemoVideoAlmacenPrivado almacen) {
        this.jdbc = jdbc;
        this.almacen = almacen;
    }

    @Transactional
    public Resultado subir(UUID cursoId, UUID leccionId, MultipartFile archivo) {
        // Bloquea la version antes de comprobar estado. Una publicacion concurrente
        // no puede intercalarse entre la comprobacion y la escritura.
        List<Destino> filas = jdbc.query("""
            SELECT c.estado AS curso_estado, v.estado AS version_estado,
                   l.tipo, l.video_referencia AS anterior
            FROM curso_versiones v
            JOIN cursos c ON c.id = v.curso_id
            JOIN modulos m ON m.curso_version_id = v.id
            JOIN lecciones l ON l.modulo_id = m.id
            WHERE c.id = ? AND l.id = ?
            FOR UPDATE OF v
            """, (rs, n) -> new Destino(rs.getString("curso_estado"),
                rs.getString("version_estado"), rs.getString("tipo"),
                rs.getString("anterior")), cursoId, leccionId);
        if (filas.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "La leccion no existe en el curso seleccionado");
        Destino destino = filas.get(0);
        if ("ARCHIVADO".equals(destino.estadoCurso()) || !"BORRADOR".equals(destino.estadoVersion())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Solo se pueden subir videos a versiones BORRADOR (RN09)");
        }
        if (!"VIDEO".equals(destino.tipo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Selecciona una leccion de tipo VIDEO");
        }

        String nuevaReferencia = almacen.guardar(archivo);
        // El MP4 nuevo se borra si la transaccion falla; el MP4 anterior se
        // borra solo tras commit. No se borran referencias demo:.
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int estado) {
                if (estado == STATUS_COMMITTED) {
                    if (!nuevaReferencia.equals(destino.anterior())) almacen.eliminarSiExiste(destino.anterior());
                } else {
                    almacen.eliminarSiExiste(nuevaReferencia);
                }
            }
        });
        jdbc.update("UPDATE lecciones SET video_referencia = ?, estado_video = 'LISTO' WHERE id = ?",
                nuevaReferencia, leccionId);
        return new Resultado(leccionId, nuevaReferencia, "LISTO");
    }
}
