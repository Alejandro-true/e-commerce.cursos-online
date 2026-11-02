package com.aulabreve.catalogo.repository;

import com.aulabreve.catalogo.model.Curso;
import com.aulabreve.catalogo.model.enums.EstadoCurso;
import com.aulabreve.catalogo.model.enums.EstadoCursoVersion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface CursoRepository extends JpaRepository<Curso, UUID> {

    Optional<Curso> findBySlug(String slug);
    boolean existsBySlug(String slug);

    Page<Curso> findByEstado(EstadoCurso estado, Pageable pageable);
    Page<Curso> findByEstadoAndCategoria_Id(
            EstadoCurso estado, UUID categoriaId, Pageable pageable);

    // Requiere curso PUBLICADO y una version PUBLICADA ofertada (RN01).
    @Query("""
    SELECT c FROM Curso c
    WHERE c.estado = :estadoCurso
      AND EXISTS (
          SELECT v.id FROM CursoVersion v
          WHERE v.curso = c
            AND v.estado = :estadoVersion
            AND v.esVersionOfertada = true
      )
      AND (
          :sinCategoria = true
          OR c.categoria.id = :categoriaId
      )
      AND (
          :sinTexto = true
          OR LOWER(c.titulo)
             LIKE CONCAT('%', LOWER(:texto), '%')
          OR LOWER(c.descripcion)
             LIKE CONCAT('%', LOWER(:texto), '%')
      )
    """)
Page<Curso> buscarCatalogo(
        @Param("estadoCurso") EstadoCurso estadoCurso,
        @Param("estadoVersion") EstadoCursoVersion estadoVersion,
        @Param("sinCategoria") boolean sinCategoria,
        @Param("categoriaId") UUID categoriaId,
        @Param("sinTexto") boolean sinTexto,
        @Param("texto") String texto,
        Pageable pageable
);

default Page<Curso> buscarPublicados(
        String texto,
        UUID categoriaId,
        Pageable pageable) {

    boolean sinTexto = texto == null || texto.isBlank();
    boolean sinCategoria = categoriaId == null;

    String textoSeguro = sinTexto ? "" : texto.trim();

    UUID categoriaSegura = sinCategoria
            ? new UUID(0L, 0L)
            : categoriaId;

    return buscarCatalogo(
            EstadoCurso.PUBLICADO,
            EstadoCursoVersion.PUBLICADA,
            sinCategoria,
            categoriaSegura,
            sinTexto,
            textoSeguro,
            pageable
    );
}

    
}
