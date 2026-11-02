package com.aulabreve.catalogo.repository;

import com.aulabreve.catalogo.model.Categoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {
    Optional<Categoria> findByNombreIgnoreCase(String nombre);
    Page<Categoria> findByActivoTrue(Pageable pageable);
}
