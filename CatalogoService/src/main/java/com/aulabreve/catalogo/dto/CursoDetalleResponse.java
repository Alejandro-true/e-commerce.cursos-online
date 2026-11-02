package com.aulabreve.catalogo.dto;

import com.aulabreve.catalogo.model.enums.NivelCurso;
import java.util.List;
import java.util.UUID;

/** Ficha comercial publica RF02; no contiene referencias privadas al contenido. */
public record CursoDetalleResponse(
        UUID id,
        String titulo,
        String slug,
        String descripcion,
        NivelCurso nivel,
        String miniaturaUrl,
        CategoriaResponse categoria,
        UUID cursoVersionId,
        String numeroVersion,
        PrecioResponse precio,
        List<EtiquetaResponse> etiquetas,
        List<ModuloResponse> modulos
) {}
