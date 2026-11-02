package com.aulabreve.catalogo.model;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "curso_instructores")
@Getter
@Setter
@NoArgsConstructor
public class CursoInstructor {

    @EmbeddedId
    private CursoInstructorId id = new CursoInstructorId();

    @MapsId("cursoId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    public CursoInstructor(Curso curso, String instructorId) {
        this.curso = curso;
        this.id = new CursoInstructorId(null, instructorId);
    }
}