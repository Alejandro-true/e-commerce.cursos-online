package com.aulabreve.catalogo.model;

import com.aulabreve.catalogo.model.enums.TipoArchivo;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "recursos_leccion")
@Getter
@Setter
@NoArgsConstructor
public class RecursoLeccion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "leccion_id", nullable = false)
    private Leccion leccion;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "archivo_referencia", nullable = false, length = 500)
    private String archivoReferencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_archivo", nullable = false, length = 15)
    private TipoArchivo tipoArchivo;

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private OffsetDateTime fechaCreacion;
}
