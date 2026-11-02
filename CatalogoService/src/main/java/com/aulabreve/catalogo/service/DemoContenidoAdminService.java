package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.dto.CrearLeccionRequest;
import com.aulabreve.catalogo.exception.RecursoNoEncontradoException;
import com.aulabreve.catalogo.model.enums.EstadoVideo;
import com.aulabreve.catalogo.model.enums.TipoArchivo;
import com.aulabreve.catalogo.model.enums.TipoLeccion;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/** Etapa 10.2: editor de versiones y contenidos en DEMO. No expone referencias privadas de video. */
@Service
@Profile("demo")
public class DemoContenidoAdminService {
    public record NuevaVersion(String numeroVersion) {}
    public record NuevoModulo(String titulo, String descripcion, Integer orden) {}
    public record NuevaLeccion(String titulo, String descripcion, TipoLeccion tipo,
            String contenidoTexto, String videoReferencia, EstadoVideo estadoVideo,
            Integer duracionSegundos, Boolean obligatorio, Integer orden) {}
    public record NuevoRecurso(String nombre, String archivoReferencia, TipoArchivo tipoArchivo) {}
    public record IdCreado(UUID id) {}
    public record EstadoActualizado(String estado) {}
    public record RecursoVista(UUID id, String nombre, String tipoArchivo) {}
    public record LeccionVista(UUID id, String titulo, String tipo, String estadoVideo,
            boolean obligatorio, int orden, List<RecursoVista> recursos) {}
    public record ModuloVista(UUID id, String titulo, String descripcion, int orden,
            List<LeccionVista> lecciones) {}
    public record VersionVista(UUID id, String numeroVersion, String estado,
            boolean ofertada, List<ModuloVista> modulos) {}
    public record ContenidoVista(UUID cursoId, String titulo, String estado,
            List<VersionVista> versiones) {}

    private final CursoAdministracionService administracion;
    private final JdbcTemplate jdbc;

    public DemoContenidoAdminService(CursoAdministracionService administracion, JdbcTemplate jdbc) {
        this.administracion = administracion;
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true)
    public ContenidoVista consultar(UUID cursoId) {
        var curso = jdbc.query("SELECT titulo, estado FROM cursos WHERE id = ?",
                (rs, i) -> new String[]{rs.getString("titulo"),rs.getString("estado")}, cursoId);
        if (curso.isEmpty()) throw new RecursoNoEncontradoException("Curso no encontrado");
        var versiones = jdbc.query("""
                SELECT id, numero_version, estado, es_version_ofertada
                FROM curso_versiones WHERE curso_id = ?
                ORDER BY fecha_creacion ASC, numero_version ASC
                """, (rs, i) -> new VersionVista(
                rs.getObject("id", UUID.class), rs.getString("numero_version"),
                rs.getString("estado"), rs.getBoolean("es_version_ofertada"),
                modulos(rs.getObject("id",UUID.class))), cursoId);
        return new ContenidoVista(cursoId, curso.get(0)[0], curso.get(0)[1], versiones);
    }

    private List<ModuloVista> modulos(UUID versionId) {
        return jdbc.query("""
                SELECT id, titulo, descripcion, orden FROM modulos
                WHERE curso_version_id = ? ORDER BY orden
                """, (rs, i) -> new ModuloVista(
                rs.getObject("id", UUID.class), rs.getString("titulo"),
                rs.getString("descripcion"), rs.getInt("orden"),
                lecciones(rs.getObject("id",UUID.class))), versionId);
    }

    private List<LeccionVista> lecciones(UUID moduloId) {
        return jdbc.query("""
                SELECT id, titulo, tipo, estado_video, obligatorio, orden
                FROM lecciones WHERE modulo_id = ? ORDER BY orden
                """, (rs, i) -> new LeccionVista(
                rs.getObject("id",UUID.class), rs.getString("titulo"),
                rs.getString("tipo"), rs.getString("estado_video"),
                rs.getBoolean("obligatorio"), rs.getInt("orden"),
                recursos(rs.getObject("id", UUID.class))), moduloId);
    }

    private List<RecursoVista> recursos(UUID leccionId) {
        return jdbc.query("""
                SELECT id, nombre, tipo_archivo FROM recursos_leccion
                WHERE leccion_id = ? ORDER BY fecha_creacion, id
                """, (rs, i) -> new RecursoVista(
                rs.getObject("id",UUID.class), rs.getString("nombre"),
                rs.getString("tipo_archivo")), leccionId);
    }

    @Transactional
    public IdCreado crearVersion(UUID cursoId, NuevaVersion datos) {
        if (datos == null || datos.numeroVersion() == null || datos.numeroVersion().isBlank())
            throw new IllegalArgumentException("Indica el numero de version");
        exigirCurso(cursoId);
        return new IdCreado(administracion.crearVersion(cursoId, datos.numeroVersion().trim()));
    }

    @Transactional
    public IdCreado agregarModulo(UUID cursoId, UUID versionId, NuevoModulo datos) {
        if (datos == null || datos.titulo() == null || datos.titulo().isBlank()
                || datos.orden() == null || datos.orden() <= 0)
            throw new IllegalArgumentException("Titulo y orden positivo son obligatorios");
        if (datos.titulo().length() > 150) throw new IllegalArgumentException("Titulo demasiado largo");
        exigirPertenece("SELECT curso_id FROM curso_versiones WHERE id = ?", versionId, cursoId);
        return new IdCreado(administracion.agregarModulo(versionId,
                datos.titulo().trim(), datos.descripcion(), datos.orden()));
    }

    @Transactional
    public IdCreado agregarLeccion(UUID cursoId, UUID moduloId, NuevaLeccion datos) {
        if (datos == null || datos.titulo() == null || datos.titulo().isBlank()
                || datos.tipo() == null || datos.orden() == null || datos.orden() <= 0)
            throw new IllegalArgumentException("Titulo, tipo y orden positivo son obligatorios");
        if (datos.titulo().length() > 150 || (datos.videoReferencia() != null && datos.videoReferencia().length() > 255))
            throw new IllegalArgumentException("Titulo o referencia demasiado largo");
        exigirPertenece("""
                SELECT v.curso_id FROM modulos m
                JOIN curso_versiones v ON v.id = m.curso_version_id WHERE m.id = ?
                """, moduloId, cursoId);
        Boolean ocupado = jdbc.queryForObject(
        """
         SELECT EXISTS (
        SELECT 1
        FROM lecciones
        WHERE modulo_id = ?
          AND orden = ?
        )
        """,
         Boolean.class,
        moduloId,
        datos.orden()
        );

        if (Boolean.TRUE.equals(ocupado)) {
                throw new IllegalArgumentException(
                "El orden " + datos.orden()
                + " ya esta ocupado en este modulo."
        );
        }        
        EstadoVideo estado = datos.tipo() == TipoLeccion.LECTURA
                ? EstadoVideo.NO_APLICA
                : datos.estadoVideo() == null ? EstadoVideo.PENDIENTE : datos.estadoVideo();
        String referencia = datos.videoReferencia() == null || datos.videoReferencia().isBlank()
                ? null : datos.videoReferencia().trim();
        return new IdCreado(administracion.agregarLeccion(moduloId, new CrearLeccionRequest(
                datos.titulo().trim(), datos.descripcion(), datos.tipo(), datos.contenidoTexto(),
                datos.tipo() == TipoLeccion.LECTURA ? null : referencia, estado,
                datos.duracionSegundos(), datos.obligatorio() == null || datos.obligatorio(), datos.orden())));
    }

    @Transactional
    public IdCreado agregarRecurso(UUID cursoId, UUID leccionId, NuevoRecurso datos) {
        if (datos == null || datos.nombre() == null || datos.nombre().isBlank()
                || datos.archivoReferencia() == null || datos.archivoReferencia().isBlank()
                || datos.tipoArchivo() == null) throw new IllegalArgumentException("Completa los datos del recurso");
        if (datos.nombre().length() > 100 || datos.archivoReferencia().length() > 500)
            throw new IllegalArgumentException("Nombre o referencia demasiado largo");
        exigirPertenece("""
                SELECT v.curso_id FROM lecciones l JOIN modulos m ON m.id = l.modulo_id
                JOIN curso_versiones v ON v.id = m.curso_version_id WHERE l.id = ?
                """, leccionId, cursoId);
        return new IdCreado(administracion.agregarRecurso(leccionId, datos.nombre().trim(),
                datos.archivoReferencia().trim(), datos.tipoArchivo()));
    }

    @Transactional
    public EstadoActualizado publicar(UUID cursoId, UUID versionId) {
        exigirPertenece("SELECT curso_id FROM curso_versiones WHERE id = ?", versionId, cursoId);
        administracion.publicar(cursoId, versionId);
        return new EstadoActualizado("PUBLICADO");
    }

    @Transactional
    public EstadoActualizado archivar(UUID cursoId) {
        exigirCurso(cursoId);
        administracion.archivar(cursoId);
        return new EstadoActualizado("ARCHIVADO");
    }

    private void exigirCurso(UUID cursoId) {
        if (cursoId == null) throw new IllegalArgumentException("Curso obligatorio");
        var encontrados = jdbc.query("SELECT id FROM cursos WHERE id = ?",
                (rs, i) -> rs.getObject("id",UUID.class), cursoId);
        if (encontrados.isEmpty()) throw new RecursoNoEncontradoException("Curso no encontrado");
    }

    private void exigirPertenece(String sql, UUID hijoId, UUID cursoId) {
        if (hijoId == null || cursoId == null) throw new IllegalArgumentException("IDs obligatorios");
        var asociados = jdbc.query(sql, (rs,i) -> rs.getObject(1,UUID.class), hijoId);
        if (asociados.isEmpty()) throw new RecursoNoEncontradoException("Contenido no encontrado");
        if (!cursoId.equals(asociados.get(0)))
            throw new IllegalArgumentException("El contenido no pertenece al curso seleccionado");
    }
}
