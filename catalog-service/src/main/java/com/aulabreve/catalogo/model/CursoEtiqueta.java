package com.aulabreve.catalogo.model;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "curso_etiquetas")
@Getter
@Setter
@NoArgsConstructor
public class CursoEtiqueta {

    @EmbeddedId
    private CursoEtiquetaId id = new CursoEtiquetaId();

    @MapsId("cursoId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @MapsId("etiquetaId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "etiqueta_id", nullable = false)
    private Etiqueta etiqueta;

    public CursoEtiqueta(Curso curso, Etiqueta etiqueta) {
        this.id = new CursoEtiquetaId();
        this.curso = curso;
        this.etiqueta = etiqueta;
    }
}