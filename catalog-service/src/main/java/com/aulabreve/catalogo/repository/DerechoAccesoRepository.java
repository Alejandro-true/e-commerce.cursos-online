package com.aulabreve.catalogo.repository;

import com.aulabreve.catalogo.model.DerechoAcceso;
import com.aulabreve.catalogo.model.enums.EstadoAcceso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DerechoAccesoRepository
        extends JpaRepository<DerechoAcceso, UUID> {
    Optional<DerechoAcceso> findByCompra_Id(UUID compraId);
    List<DerechoAcceso> findByEstudianteIdAndEstadoAcceso(
            String estudianteId, EstadoAcceso estadoAcceso);
    List<DerechoAcceso> findByEstudianteIdAndCurso_IdAndEstadoAcceso(
            String estudianteId, UUID cursoId, EstadoAcceso estadoAcceso);
    Optional<DerechoAcceso> findByEstudianteIdAndCursoVersion_IdAndEstadoAcceso(
            String estudianteId, UUID cursoVersionId, EstadoAcceso estadoAcceso);
}
