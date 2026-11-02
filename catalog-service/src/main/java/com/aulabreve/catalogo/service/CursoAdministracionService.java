package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.dto.*;
import com.aulabreve.catalogo.exception.RecursoNoEncontradoException;
import com.aulabreve.catalogo.exception.ReglaNegocioException;
import com.aulabreve.catalogo.model.*;
import com.aulabreve.catalogo.model.enums.*;
import com.aulabreve.catalogo.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

/** RF03: gestiona borradores y publicacion. Autorizacion de rol ADMIN: pendiente en capa Security. */
@Service
@Transactional
public class CursoAdministracionService {
    private final CursoRepository cursos;
    private final CategoriaRepository categorias;
    private final PrecioPromocionRepository precios;
    private final CursoVersionRepository versiones;
    private final ModuloRepository modulos;
    private final LeccionRepository lecciones;
    private final RecursoLeccionRepository recursos;
    private final EntityManager entityManager;

    public CursoAdministracionService(CursoRepository cursos, CategoriaRepository categorias,
            PrecioPromocionRepository precios, CursoVersionRepository versiones,
            ModuloRepository modulos, LeccionRepository lecciones,
            RecursoLeccionRepository recursos, EntityManager entityManager) {
        this.cursos = cursos;
        this.categorias = categorias;
        this.precios = precios;
        this.versiones = versiones;
        this.modulos = modulos;
        this.lecciones = lecciones;
        this.recursos = recursos;
        this.entityManager = entityManager;
    }

    public UUID crearBorrador(CrearCursoRequest r) {
        if (r == null || r.categoriaId() == null || r.nivel() == null) {
            throw new IllegalArgumentException("Categoria y nivel son obligatorios");
        }
        String slug = slugValido(r.slug());
        if (cursos.existsBySlug(slug)) throw new ReglaNegocioException("Slug ya registrado");
        Curso curso = new Curso();
        curso.setCategoria(categoriaActiva(r.categoriaId()));
        curso.setTitulo(requerido(r.titulo(), "titulo"));
        curso.setSlug(slug);
        curso.setDescripcion(r.descripcion());
        curso.setNivel(r.nivel());
        curso.setMiniaturaUrl(r.miniaturaUrl());
        curso.setEstado(EstadoCurso.BORRADOR);
        return cursos.save(curso).getId();
    }

    public void actualizarBorrador(UUID cursoId, ActualizarCursoRequest r) {
        if (r == null || r.categoriaId() == null || r.nivel() == null)
            throw new IllegalArgumentException("Categoria y nivel son obligatorios");
        Curso curso = curso(cursoId);
        if (curso.getEstado() != EstadoCurso.BORRADOR)
            throw new ReglaNegocioException("Solo se edita el curso en BORRADOR");
        String slug = slugValido(r.slug());
        cursos.findBySlug(slug).filter(c -> !c.getId().equals(cursoId)).ifPresent(c -> {
            throw new ReglaNegocioException("Slug ya registrado");
        });
        curso.setCategoria(categoriaActiva(r.categoriaId()));
        curso.setTitulo(requerido(r.titulo(), "titulo"));
        curso.setSlug(slug);
        curso.setDescripcion(r.descripcion());
        curso.setNivel(r.nivel());
        curso.setMiniaturaUrl(r.miniaturaUrl());
    }

    /** Un precio vigente por curso; el precio de compras anteriores no cambia. */
    public void configurarPrecio(UUID cursoId, ConfigurarPrecioRequest r) {
        if (r == null || r.precioBase() == null || r.moneda() == null
                || r.precioBase().signum() <= 0)
            throw new IllegalArgumentException("Precio base positivo y moneda son obligatorios");
        boolean hayOferta = r.precioOferta() != null;
        if (hayOferta && (r.precioOferta().signum() <= 0
                || r.precioOferta().compareTo(r.precioBase()) >= 0
                || r.fechaInicio() == null || r.fechaFin() == null
                || !r.fechaFin().isAfter(r.fechaInicio())))
            throw new ReglaNegocioException("Promocion invalida");
        if (!hayOferta && (r.fechaInicio() != null || r.fechaFin() != null))
            throw new ReglaNegocioException("Fechas sin precio de oferta");
        Curso curso = curso(cursoId);
        if (curso.getEstado() == EstadoCurso.ARCHIVADO)
            throw new ReglaNegocioException("Curso archivado");
        PrecioPromocion p = precios.findByCurso_Id(cursoId).orElseGet(PrecioPromocion::new);
        p.setCurso(curso);
        p.setPrecioBase(r.precioBase());
        p.setPrecioOferta(r.precioOferta());
        p.setMoneda(r.moneda());
        p.setFechaInicio(r.fechaInicio());
        p.setFechaFin(r.fechaFin());
        precios.save(p);
    }

    public UUID crearVersion(UUID cursoId, String numeroVersion) {
        Curso curso = curso(cursoId);
        if (curso.getEstado() == EstadoCurso.ARCHIVADO)
            throw new ReglaNegocioException("Curso archivado");
        String numero = requerido(numeroVersion, "numeroVersion");
        if (numero.length() > 10) throw new IllegalArgumentException("Numero de version demasiado largo");
        if (versiones.findByCurso_IdAndNumeroVersion(cursoId, numero).isPresent())
            throw new ReglaNegocioException("Version ya existente");
        CursoVersion v = new CursoVersion();
        v.setCurso(curso);
        v.setNumeroVersion(numero);
        v.setEstado(EstadoCursoVersion.BORRADOR);
        v.setEsVersionOfertada(false);
        return versiones.save(v).getId();
    }

    public UUID agregarModulo(UUID versionId, String titulo, String descripcion, int orden) {
        CursoVersion v = versionEditable(versionId);
        if (orden <= 0) throw new IllegalArgumentException("Orden debe ser positivo");
        Modulo m = new Modulo();
        m.setCursoVersion(v);
        m.setTitulo(requerido(titulo, "titulo"));
        m.setDescripcion(descripcion);
        m.setOrden(orden);
        return modulos.save(m).getId();
    }

    public UUID agregarLeccion(UUID moduloId, CrearLeccionRequest r) {
        if (r == null || r.tipo() == null || r.orden() <= 0 || r.duracionSegundos() != null
                && r.duracionSegundos() < 0) throw new IllegalArgumentException("Leccion invalida");
        Modulo modulo = modulos.findById(moduloId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Modulo no encontrado"));
        versionEditable(modulo.getCursoVersion().getId());
        EstadoVideo estado = r.estadoVideo() == null ? EstadoVideo.NO_APLICA : r.estadoVideo();
        if (r.tipo() == TipoLeccion.LECTURA &&
                (estado != EstadoVideo.NO_APLICA || r.videoReferencia() != null))
            throw new ReglaNegocioException("Una lectura no admite video");
        if (estado == EstadoVideo.LISTO && (r.tipo() != TipoLeccion.VIDEO
                || r.videoReferencia() == null || r.videoReferencia().isBlank()))
            throw new ReglaNegocioException("Video LISTO requiere referencia privada");
        Leccion l = new Leccion();
        l.setModulo(modulo);
        l.setTitulo(requerido(r.titulo(), "titulo"));
        l.setDescripcion(r.descripcion());
        l.setTipo(r.tipo());
        l.setContenidoTexto(r.contenidoTexto());
        l.setVideoReferencia(r.videoReferencia());
        l.setEstadoVideo(estado);
        l.setDuracionSegundos(r.duracionSegundos());
        l.setObligatorio(r.obligatorio());
        l.setOrden(r.orden());
        return lecciones.save(l).getId();
    }

    public UUID agregarRecurso(UUID leccionId, String nombre, String referencia, TipoArchivo tipo) {
        if (tipo == null) throw new IllegalArgumentException("Tipo de archivo requerido");
        Leccion l = lecciones.findById(leccionId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Leccion no encontrada"));
        versionEditable(l.getModulo().getCursoVersion().getId());
        RecursoLeccion recurso = new RecursoLeccion();
        recurso.setLeccion(l);
        recurso.setNombre(requerido(nombre, "nombre"));
        recurso.setArchivoReferencia(requerido(referencia, "referencia"));
        recurso.setTipoArchivo(tipo);
        return recursos.save(recurso).getId();
    }

    /** RN02/RN09: bloquea la version y verifica contenido antes de publicar. */
    public void publicar(UUID cursoId, UUID versionId) {
        Curso curso = curso(cursoId);
        if (curso.getEstado() == EstadoCurso.ARCHIVADO)
            throw new ReglaNegocioException("Curso archivado");
        CursoVersion version = versionEditable(versionId);
        if (!version.getCurso().getId().equals(cursoId))
            throw new ReglaNegocioException("La version no pertenece al curso");
        requerido(curso.getTitulo(), "titulo");
        requerido(curso.getDescripcion(), "descripcion");
        if (!precios.existsByCurso_Id(cursoId))
            throw new ReglaNegocioException("No se puede publicar sin precio y moneda");
        List<Modulo> lista = modulos.findByCursoVersion_IdOrderByOrdenAsc(versionId);
        if (lista.isEmpty()) throw new ReglaNegocioException("Se necesita al menos un modulo");
        boolean videoObligatorioListo = lista.stream()
                .flatMap(m -> lecciones.findByModulo_IdOrderByOrdenAsc(m.getId()).stream())
                .anyMatch(l -> Boolean.TRUE.equals(l.getObligatorio())
                        && l.getTipo() == TipoLeccion.VIDEO && l.getEstadoVideo() == EstadoVideo.LISTO
                        && l.getVideoReferencia() != null && !l.getVideoReferencia().isBlank());
        if (!videoObligatorioListo)
            throw new ReglaNegocioException("Se requiere al menos una leccion obligatoria con video LISTO");
        versiones.findByCurso_IdAndEsVersionOfertadaTrue(cursoId).ifPresent(anterior -> {
            if (!anterior.getId().equals(versionId)) anterior.setEsVersionOfertada(false);
        });
        // Evita violar el indice parcial de una unica version ofertada por curso.
        versiones.flush();
        version.setEstado(EstadoCursoVersion.PUBLICADA);
        version.setFechaPublicacion(OffsetDateTime.now(ZoneOffset.UTC));
        version.setEsVersionOfertada(true);
        curso.setEstado(EstadoCurso.PUBLICADO);
    }

    public void archivar(UUID cursoId) {
        Curso c = curso(cursoId);
        if (c.getEstado() == EstadoCurso.ARCHIVADO) return;
        c.setEstado(EstadoCurso.ARCHIVADO);
        // No borrar versiones ni derechos historicos.
    }

    private CursoVersion versionEditable(UUID versionId) {
        CursoVersion v = entityManager.find(CursoVersion.class, versionId,
                LockModeType.PESSIMISTIC_WRITE);
        if (v == null) throw new RecursoNoEncontradoException("Version no encontrada");
        if (v.getEstado() != EstadoCursoVersion.BORRADOR)
            throw new ReglaNegocioException("La version publicada/retirada es inmutable");
        return v;
    }

    private Curso curso(UUID id) {
        return cursos.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Curso no encontrado"));
    }

    private Categoria categoriaActiva(UUID id) {
        Categoria c = categorias.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoria no encontrada"));
        if (!Boolean.TRUE.equals(c.getActivo())) throw new ReglaNegocioException("Categoria inactiva");
        return c;
    }

    private static String requerido(String valor, String campo) {
        if (valor == null || valor.isBlank())
            throw new IllegalArgumentException("Campo requerido: " + campo);
        return valor.trim();
    }

    private static String slugValido(String slug) {
        String valor = requerido(slug, "slug");
        if (valor.length() > 180 || !valor.matches("[a-z0-9]+(-[a-z0-9]+)*"))
            throw new IllegalArgumentException("Slug invalido");
        return valor;
    }
}
