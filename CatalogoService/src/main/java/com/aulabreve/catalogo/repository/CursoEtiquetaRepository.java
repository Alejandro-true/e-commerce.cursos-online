package com.aulabreve.catalogo.repository;

import com.aulabreve.catalogo.model.CursoEtiqueta;
import com.aulabreve.catalogo.model.CursoEtiquetaId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CursoEtiquetaRepository
        extends JpaRepository<CursoEtiqueta, CursoEtiquetaId> {
    List<CursoEtiqueta> findByCurso_Id(UUID cursoId);
    List<CursoEtiqueta> findByEtiqueta_Id(UUID etiquetaId);
}
