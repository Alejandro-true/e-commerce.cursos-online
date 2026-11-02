package com.aulabreve.catalogo.repository;

import com.aulabreve.catalogo.model.PrecioPromocion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface PrecioPromocionRepository
        extends JpaRepository<PrecioPromocion, UUID> {
    Optional<PrecioPromocion> findByCurso_Id(UUID cursoId);
    boolean existsByCurso_Id(UUID cursoId);
}
