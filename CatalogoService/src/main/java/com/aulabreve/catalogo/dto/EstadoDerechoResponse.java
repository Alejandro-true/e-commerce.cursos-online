package com.aulabreve.catalogo.dto;
import java.time.OffsetDateTime;
import java.util.UUID;
public record EstadoDerechoResponse(UUID cursoId, String estado,
        UUID cursoVersionId, OffsetDateTime fechaExpiracion) {}
