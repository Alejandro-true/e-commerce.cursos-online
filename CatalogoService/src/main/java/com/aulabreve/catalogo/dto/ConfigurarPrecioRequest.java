package com.aulabreve.catalogo.dto;
import com.aulabreve.catalogo.model.enums.Moneda;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
public record ConfigurarPrecioRequest(BigDecimal precioBase, BigDecimal precioOferta,
       Moneda moneda, OffsetDateTime fechaInicio, OffsetDateTime fechaFin) {}
