package com.aulabreve.catalogo.repository;

import com.aulabreve.catalogo.model.Modulo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ModuloRepository extends JpaRepository<Modulo, UUID> {
    List<Modulo> findByCursoVersion_IdOrderByOrdenAsc(UUID cursoVersionId);
    long countByCursoVersion_Id(UUID cursoVersionId);
}
