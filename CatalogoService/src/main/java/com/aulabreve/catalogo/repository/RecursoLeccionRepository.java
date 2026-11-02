package com.aulabreve.catalogo.repository;

import com.aulabreve.catalogo.model.RecursoLeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RecursoLeccionRepository
        extends JpaRepository<RecursoLeccion, UUID> {
    List<RecursoLeccion> findByLeccion_Id(UUID leccionId);
}
