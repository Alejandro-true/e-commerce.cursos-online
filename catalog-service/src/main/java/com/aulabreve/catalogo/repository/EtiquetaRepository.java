package com.aulabreve.catalogo.repository;

import com.aulabreve.catalogo.model.Etiqueta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface EtiquetaRepository extends JpaRepository<Etiqueta, UUID> {
    Optional<Etiqueta> findBySlug(String slug);
    boolean existsBySlug(String slug);
    Page<Etiqueta> findByActivoTrue(Pageable pageable);
}
