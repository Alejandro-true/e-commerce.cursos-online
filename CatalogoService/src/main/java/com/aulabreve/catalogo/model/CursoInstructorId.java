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
public class CursoInstructorId implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "curso_id", nullable = false)
    private UUID cursoId;

    @Column(name = "instructor_id",
            nullable = false, length = 150)
    private String instructorId;
}