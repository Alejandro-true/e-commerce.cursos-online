package com.aulabreve.catalogo.dto;

import com.aulabreve.catalogo.model.enums.Moneda;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/** Precio final calculado a partir de una promocion vigente. */
public record PrecioResponse(
        BigDecimal precioBase,
        BigDecimal precioFinal,
        BigDecimal precioOfertaVigente,
        Moneda moneda,
        OffsetDateTime promocionHasta
) {}
