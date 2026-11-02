package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.dto.EtiquetaResponse;
import com.aulabreve.catalogo.exception.RecursoNoEncontradoException;
import com.aulabreve.catalogo.model.Etiqueta;
import com.aulabreve.catalogo.repository.EtiquetaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EtiquetaService {

    private final EtiquetaRepository etiquetaRepository;

    public EtiquetaService(EtiquetaRepository etiquetaRepository) {
        this.etiquetaRepository = etiquetaRepository;
    }

    public Page<EtiquetaResponse> listarActivas(Pageable pageable) {
        return etiquetaRepository.findByActivoTrue(pageable).map(this::aResponse);
    }

    public EtiquetaResponse obtenerPorSlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new IllegalArgumentException("El slug es obligatorio");
        }
        Etiqueta etiqueta = etiquetaRepository.findBySlug(slug.trim())
                .filter(e -> Boolean.TRUE.equals(e.getActivo()))
                .orElseThrow(() -> new RecursoNoEncontradoException("Etiqueta no encontrada"));
        return aResponse(etiqueta);
    }

    private EtiquetaResponse aResponse(Etiqueta e) {
        return new EtiquetaResponse(e.getId(), e.getNombre(), e.getSlug());
    }
}
