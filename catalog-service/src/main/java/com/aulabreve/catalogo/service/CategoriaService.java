package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.dto.CategoriaResponse;
import com.aulabreve.catalogo.exception.RecursoNoEncontradoException;
import com.aulabreve.catalogo.model.Categoria;
import com.aulabreve.catalogo.repository.CategoriaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public Page<CategoriaResponse> listarActivas(Pageable pageable) {
        return categoriaRepository.findByActivoTrue(pageable).map(this::aResponse);
    }

    public CategoriaResponse obtenerActiva(UUID id) {
        Categoria categoria = categoriaRepository.findById(id)
                .filter(c -> Boolean.TRUE.equals(c.getActivo()))
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoria no encontrada"));
        return aResponse(categoria);
    }

    private CategoriaResponse aResponse(Categoria c) {
        return new CategoriaResponse(c.getId(), c.getNombre(), c.getDescripcion());
    }
}
