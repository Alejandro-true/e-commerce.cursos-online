package com.aulabreve.catalogo.dto;

import com.aulabreve.catalogo.model.enums.TipoLeccion;
import java.util.UUID;

/** Excluye contenidoTexto y videoReferencia: requieren derechos de acceso. */
public record LeccionResumenResponse(
        UUID id,
        String titulo,
        String descripcion,
        TipoLeccion tipo,
        Integer duracionSegundos,
        boolean obligatorio,
        int orden
) {}
