package com.aulabreve.catalogo.dto;

import com.aulabreve.catalogo.model.enums.NivelCurso;
import java.util.UUID;

/** Datos aptos para el catalogo publico: nunca incluye URLs de reproduccion. */
public record CursoResumenResponse(
        UUID id,
        String titulo,
        String slug,
        String descripcion,
        NivelCurso nivel,
        String miniaturaUrl,
        CategoriaResponse categoria,
        PrecioResponse precio
) {}
