package com.aulabreve.catalogo.model;

import com.aulabreve.catalogo.model.enums.Moneda;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "precios_promociones")
@Getter
@Setter
@NoArgsConstructor
public class PrecioPromocion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "curso_id",
        nullable = false,
        unique = true
    )
    private Curso curso;

    @Column(
        name = "precio_base",
        nullable = false,
        precision = 10,
        scale = 2
    )
    private BigDecimal precioBase;

    @Column(
        name = "precio_oferta",
        precision = 10,
        scale = 2
    )
    private BigDecimal precioOferta;

    @Enumerated(EnumType.STRING)
    @Column(name = "moneda", nullable = false, length = 3)
    private Moneda moneda;

    @Column(name = "fecha_inicio")
    private OffsetDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private OffsetDateTime fechaFin;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion", nullable = false)
    private OffsetDateTime fechaActualizacion;
}
