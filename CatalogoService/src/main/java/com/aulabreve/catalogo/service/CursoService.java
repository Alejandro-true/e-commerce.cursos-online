package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.dto.*;
import com.aulabreve.catalogo.exception.RecursoNoEncontradoException;
import com.aulabreve.catalogo.model.*;
import com.aulabreve.catalogo.model.enums.EstadoCurso;
import com.aulabreve.catalogo.model.enums.EstadoCursoVersion;
import com.aulabreve.catalogo.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Consultas publicas RF01 y RF02. No concede acceso al material ni valida compras.
 */
@Service
@Transactional(readOnly = true)
public class CursoService {

    private final CursoRepository cursoRepository;
    private final CursoVersionRepository versionRepository;
    private final CursoEtiquetaRepository cursoEtiquetaRepository;
    private final ModuloRepository moduloRepository;
    private final LeccionRepository leccionRepository;
    private final PrecioService precioService;

    public CursoService(
            CursoRepository cursoRepository,
            CursoVersionRepository versionRepository,
            CursoEtiquetaRepository cursoEtiquetaRepository,
            ModuloRepository moduloRepository,
            LeccionRepository leccionRepository,
            PrecioService precioService) {
        this.cursoRepository = cursoRepository;
        this.versionRepository = versionRepository;
        this.cursoEtiquetaRepository = cursoEtiquetaRepository;
        this.moduloRepository = moduloRepository;
        this.leccionRepository = leccionRepository;
        this.precioService = precioService;
    }

    /** RF01: paginacion y filtros; solo cursos PUBLICADOS con version ofertada. */
    public Page<CursoResumenResponse> listarPublicados(
            String texto, UUID categoriaId, Pageable pageable) {
        String filtro = texto == null || texto.isBlank() ? null : texto.trim();
        return cursoRepository.buscarPublicados(filtro, categoriaId, pageable)
                .map(this::aResumen);
    }

    /** RF02: ficha publica mediante UUID. */
    public CursoDetalleResponse obtenerDetalle(UUID cursoId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Curso no encontrado"));
        return crearDetallePublico(curso);
    }

    /** RF02: ficha publica mediante slug. */
    public CursoDetalleResponse obtenerDetallePorSlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new IllegalArgumentException("El slug del curso es obligatorio");
        }
        Curso curso = cursoRepository.findBySlug(slug.trim())
                .orElseThrow(() -> new RecursoNoEncontradoException("Curso no encontrado"));
        return crearDetallePublico(curso);
    }

    private CursoDetalleResponse crearDetallePublico(Curso curso) {
        if (curso.getEstado() != EstadoCurso.PUBLICADO) {
            throw new RecursoNoEncontradoException("Curso no disponible en el catalogo publico");
        }
        CursoVersion version = versionRepository.findByCurso_IdAndEsVersionOfertadaTrue(curso.getId())
                .filter(v -> v.getEstado() == EstadoCursoVersion.PUBLICADA)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe una version publicada y ofertada"));

        List<EtiquetaResponse> etiquetas = cursoEtiquetaRepository.findByCurso_Id(curso.getId())
                .stream()
                .map(ce -> ce.getEtiqueta())
                .filter(e -> Boolean.TRUE.equals(e.getActivo()))
                .map(e -> new EtiquetaResponse(e.getId(), e.getNombre(), e.getSlug()))
                .toList();

        List<ModuloResponse> modulos = moduloRepository
                .findByCursoVersion_IdOrderByOrdenAsc(version.getId())
                .stream()
                .map(this::aModulo)
                .toList();

        return new CursoDetalleResponse(
                curso.getId(), curso.getTitulo(), curso.getSlug(),
                curso.getDescripcion(), curso.getNivel(), curso.getMiniaturaUrl(),
                aCategoria(curso.getCategoria()), version.getId(), version.getNumeroVersion(),
                precioService.obtenerPrecio(curso.getId()), etiquetas, modulos);
    }

    private CursoResumenResponse aResumen(Curso curso) {
        return new CursoResumenResponse(
                curso.getId(), curso.getTitulo(), curso.getSlug(),
                curso.getDescripcion(), curso.getNivel(), curso.getMiniaturaUrl(),
                aCategoria(curso.getCategoria()), precioService.obtenerPrecio(curso.getId()));
    }

    private CategoriaResponse aCategoria(Categoria categoria) {
        return new CategoriaResponse(
                categoria.getId(), categoria.getNombre(), categoria.getDescripcion());
    }

    private ModuloResponse aModulo(Modulo modulo) {
        List<LeccionResumenResponse> lecciones = leccionRepository
                .findByModulo_IdOrderByOrdenAsc(modulo.getId())
                .stream()
                .map(l -> new LeccionResumenResponse(
                        l.getId(), l.getTitulo(), l.getDescripcion(), l.getTipo(),
                        l.getDuracionSegundos(), Boolean.TRUE.equals(l.getObligatorio()),
                        l.getOrden()))
                .toList();
        return new ModuloResponse(
                modulo.getId(), modulo.getTitulo(), modulo.getDescripcion(),
                modulo.getOrden(), lecciones);
    }
}
