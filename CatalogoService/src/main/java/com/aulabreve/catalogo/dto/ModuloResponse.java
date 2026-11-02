package com.aulabreve.catalogo.dto;

import java.util.List;
import java.util.UUID;

public record ModuloResponse(
        UUID id,
        String titulo,
        String descripcion,
        int orden,
        List<LeccionResumenResponse> lecciones
) {}
