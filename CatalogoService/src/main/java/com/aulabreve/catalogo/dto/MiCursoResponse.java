package com.aulabreve.catalogo.dto;
import java.time.OffsetDateTime;
import java.util.UUID;
public record MiCursoResponse(UUID cursoId, String titulo, UUID cursoVersionId,
        String numeroVersion, OffsetDateTime fechaOtorgamiento,
        OffsetDateTime fechaExpiracion) {}
