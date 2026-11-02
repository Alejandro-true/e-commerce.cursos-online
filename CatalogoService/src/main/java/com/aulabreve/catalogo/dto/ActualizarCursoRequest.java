package com.aulabreve.catalogo.dto;
import com.aulabreve.catalogo.model.enums.NivelCurso;
import java.util.UUID;
public record ActualizarCursoRequest(UUID categoriaId, String titulo, String slug,
        String descripcion, NivelCurso nivel, String miniaturaUrl) {}
