package com.aulabreve.catalogo.model;


import com.aulabreve.catalogo.model.enums.EstadoCursoVersion;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "curso_versiones",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_curso_version_num",
            columnNames = {"curso_id", "numero_version"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
public class CursoVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(
        name = "numero_version",
        nullable = false,
        length = 10
    )
    private String numeroVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoCursoVersion estado =
            EstadoCursoVersion.BORRADOR;

    @Column(name = "es_version_ofertada", nullable = false)
    private Boolean esVersionOfertada = false;

    @CreationTimestamp
    @Column(
        name = "fecha_creacion",
        nullable = false,
        updatable = false
    )
    private OffsetDateTime fechaCreacion;

    @Column(name = "fecha_publicacion")
    private OffsetDateTime fechaPublicacion;
}
