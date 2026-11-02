package com.aulabreve.catalogo.repository;

import com.aulabreve.catalogo.model.CursoVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CursoVersionRepository
        extends JpaRepository<CursoVersion, UUID> {
    List<CursoVersion> findByCurso_IdOrderByFechaCreacionDesc(UUID cursoId);
    Optional<CursoVersion> findByCurso_IdAndNumeroVersion(
            UUID cursoId, String numeroVersion);
    Optional<CursoVersion> findByCurso_IdAndEsVersionOfertadaTrue(UUID cursoId);
}
