package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.dto.ActualizarCursoRequest;
import com.aulabreve.catalogo.dto.ConfigurarPrecioRequest;
import com.aulabreve.catalogo.dto.CrearCursoRequest;
import com.aulabreve.catalogo.model.enums.Moneda;
import com.aulabreve.catalogo.model.enums.NivelCurso;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** ETAPA 10.1: administra datos basicos y precio de borradores.
 *  El perfil DEMO y X-Demo-Key se comprueban en la capa API.
 *  La gestion de contenido, publicacion y archivo queda para la etapa 10.2.
 */
@Service
@Profile("demo")
public class DemoCursosAdminService {

    public record CursoFormulario(UUID categoriaId, String titulo, String slug,
            String descripcion, NivelCurso nivel, String miniaturaUrl,
            BigDecimal precioBase, Moneda moneda) {}

    public record CategoriaVista(UUID id, String nombre) {}

    public record CursoVista(UUID id, UUID categoriaId, String categoria,
            String titulo, String slug, String descripcion, String nivel,
            String miniaturaUrl, String estado, BigDecimal precioBase, String moneda) {}

    public record CursoCreado(UUID cursoId, String estado) {}

    private final CursoAdministracionService administracion;
    private final JdbcTemplate jdbc;

    public DemoCursosAdminService(CursoAdministracionService administracion, JdbcTemplate jdbc) {
        this.administracion = administracion;
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true)
    public List<CategoriaVista> categoriasActivas() {
        return jdbc.query("""
                SELECT id, nombre FROM categorias WHERE activo = TRUE ORDER BY nombre
                """, (rs, i) -> new CategoriaVista(
                        rs.getObject("id", UUID.class), rs.getString("nombre")));
    }

    @Transactional(readOnly = true)
    public List<CursoVista> listar() {
        return jdbc.query("""
                SELECT c.id, c.categoria_id, cat.nombre AS categoria, c.titulo, c.slug,
                       c.descripcion, c.nivel, c.miniatura_url, c.estado,
                       p.precio_base, p.moneda
                FROM cursos c
                JOIN categorias cat ON cat.id = c.categoria_id
                LEFT JOIN precios_promociones p ON p.curso_id = c.id
                ORDER BY c.fecha_creacion DESC, c.id DESC
                LIMIT 200
                """, (rs, i) -> new CursoVista(
                        rs.getObject("id", UUID.class),
                        rs.getObject("categoria_id", UUID.class),
                        rs.getString("categoria"), rs.getString("titulo"),
                        rs.getString("slug"), rs.getString("descripcion"),
                        rs.getString("nivel"), rs.getString("miniatura_url"),
                        rs.getString("estado"), rs.getBigDecimal("precio_base"),
                        rs.getString("moneda")));
    }

    @Transactional
    public CursoCreado crear(CursoFormulario f) {
        validar(f);
        UUID id = administracion.crearBorrador(new CrearCursoRequest(
                f.categoriaId(), f.titulo().trim(), f.slug().trim(),
                f.descripcion().trim(), f.nivel(), limpiarUrl(f.miniaturaUrl())));
        administracion.configurarPrecio(id, precio(f));
        return new CursoCreado(id, "BORRADOR");
    }

    @Transactional
    public CursoCreado editar(UUID id, CursoFormulario f) {
        if (id == null) throw new IllegalArgumentException("Curso no especificado");
        validar(f);
        // RF03: actualizarBorrador impide modificar cursos PUBLICADOS/ARCHIVADOS.
        administracion.actualizarBorrador(id, new ActualizarCursoRequest(
                f.categoriaId(), f.titulo().trim(), f.slug().trim(),
                f.descripcion().trim(), f.nivel(), limpiarUrl(f.miniaturaUrl())));
        // Esta etapa maneja precio base. Promociones se configuran en otro flujo.
        administracion.configurarPrecio(id, precio(f));
        return new CursoCreado(id, "BORRADOR");
    }

    @Transactional
    public void eliminarBorrador(UUID id) {
        if (id == null) throw new IllegalArgumentException("Curso no especificado");
        var cursosEncontrados = jdbc.query(
                "SELECT estado FROM cursos WHERE id = ?",
                (rs, i) -> rs.getString("estado"), id);
        if (cursosEncontrados.isEmpty()) throw new IllegalArgumentException("Curso no encontrado");
        if (!"BORRADOR".equals(cursosEncontrados.get(0))) {
            throw new IllegalArgumentException("Solo se pueden eliminar cursos en borrador; retira del catálogo los cursos publicados");
        }
        Boolean tieneVersiones = jdbc.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM curso_versiones WHERE curso_id = ?)", Boolean.class, id);
        Boolean tieneCompras = jdbc.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM compras WHERE curso_id = ?)", Boolean.class, id);
        if (Boolean.TRUE.equals(tieneVersiones) || Boolean.TRUE.equals(tieneCompras)) {
            throw new IllegalArgumentException("Este curso ya tiene contenido o historial; retíralo del catálogo para conservar sus datos");
        }
        jdbc.update("DELETE FROM precios_promociones WHERE curso_id = ?", id);
        jdbc.update("DELETE FROM cursos WHERE id = ? AND estado = 'BORRADOR'", id);
    }

    private static ConfigurarPrecioRequest precio(CursoFormulario f) {
        return new ConfigurarPrecioRequest(f.precioBase(), null, f.moneda(), null, null);
    }

    private static String limpiarUrl(String url) {
        return url == null || url.isBlank() ? null : url.trim();
    }

    private static void validar(CursoFormulario f) {
        if (f == null || f.categoriaId() == null || f.nivel() == null || f.moneda() == null
                || f.titulo() == null || f.titulo().isBlank()
                || f.slug() == null || f.slug().isBlank()
                || f.descripcion() == null || f.descripcion().isBlank()
                || f.precioBase() == null) {
            throw new IllegalArgumentException("Completa titulo, slug, descripcion, categoria, nivel, precio y moneda");
        }
        if (f.titulo().trim().length() > 150 || f.slug().trim().length() > 180)
            throw new IllegalArgumentException("Titulo o slug demasiado largo");
        if (!f.slug().trim().matches("[a-z0-9]+(-[a-z0-9]+)*"))
            throw new IllegalArgumentException("Slug invalido: usa minusculas, numeros y guiones");
        if (f.miniaturaUrl() != null && f.miniaturaUrl().trim().length() > 500)
            throw new IllegalArgumentException("URL de miniatura demasiado larga");
        if (f.precioBase().signum() <= 0 || f.precioBase().scale() > 2
                || f.precioBase().compareTo(new BigDecimal("99999999.99")) > 0)
            throw new IllegalArgumentException("Precio debe ser positivo, con maximo dos decimales");
    }
}
