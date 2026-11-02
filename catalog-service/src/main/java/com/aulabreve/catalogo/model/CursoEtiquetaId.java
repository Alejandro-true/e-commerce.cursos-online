package com.aulabreve.catalogo.model;


import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CursoEtiquetaId implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "curso_id", nullable = false)
    private UUID cursoId;

    @Column(name = "etiqueta_id", nullable = false)
    private UUID etiquetaId;
}
