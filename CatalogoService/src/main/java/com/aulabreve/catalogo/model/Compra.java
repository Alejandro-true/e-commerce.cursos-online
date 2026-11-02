package com.aulabreve.catalogo.model;

import com.aulabreve.catalogo.model.enums.EstadoCompra;
import com.aulabreve.catalogo.model.enums.Moneda;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "compras")
@Getter
@Setter
@NoArgsConstructor
public class Compra {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    // Identificador estable del proveedor externo de autenticacion.
    @Column(name = "estudiante_id", nullable = false, length = 150)
    private String estudianteId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_version_id", nullable = false)
    private CursoVersion cursoVersion;

    @Column(name = "proveedor_checkout", nullable = false, length = 50)
    private String proveedorCheckout;

    @Column(name = "checkout_sesion_id", length = 150)
    private String checkoutSesionId;

    @Column(name = "pedido_externo_id", length = 150)
    private String pedidoExternoId;

    @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "moneda", nullable = false, length = 3)
    private Moneda moneda;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoCompra estado = EstadoCompra.PENDIENTE;

    @Column(name = "revision_comercial", nullable = false)
    private Long revisionComercial = 0L;

    @CreationTimestamp
    @Column(name = "fecha_compra", nullable = false, updatable = false)
    private OffsetDateTime fechaCompra;

    @Column(name = "fecha_pago")
    private OffsetDateTime fechaPago;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion", nullable = false)
    private OffsetDateTime fechaActualizacion;
}
