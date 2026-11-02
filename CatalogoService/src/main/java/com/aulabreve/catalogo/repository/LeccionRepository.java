package com.aulabreve.catalogo.repository;

import com.aulabreve.catalogo.model.Leccion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface LeccionRepository extends JpaRepository<Leccion, UUID> {
    List<Leccion> findByModulo_IdOrderByOrdenAsc(UUID moduloId);
    long countByModulo_IdAndObligatorioTrue(UUID moduloId);
}
