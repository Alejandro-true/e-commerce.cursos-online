package com.aulabreve.catalogo.model;

import com.aulabreve.catalogo.model.enums.EstadoAcceso;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "derechos_acceso")
@Getter
@Setter
@NoArgsConstructor
public class DerechoAcceso {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "compra_id", nullable = false, unique = true)
    private Compra compra;

    // Se duplica como clave comercial, con integridad compuesta garantizada por V1.
    @Column(name = "estudiante_id", nullable = false, length = 150)
    private String estudianteId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_version_id", nullable = false)
    private CursoVersion cursoVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_acceso", nullable = false, length = 20)
    private EstadoAcceso estadoAcceso;

    @CreationTimestamp
    @Column(name = "fecha_otorgamiento", nullable = false, updatable = false)
    private OffsetDateTime fechaOtorgamiento;

    @Column(name = "fecha_revocacion")
    private OffsetDateTime fechaRevocacion;

    @Column(name = "fecha_expiracion")
    private OffsetDateTime fechaExpiracion;

    @Column(name = "motivo_revocacion", length = 150)
    private String motivoRevocacion;
}
