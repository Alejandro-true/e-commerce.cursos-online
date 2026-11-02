package com.aulabreve.catalogo.model;

import com.aulabreve.catalogo.model.enums.ResultadoProcesamiento;
import com.aulabreve.catalogo.model.enums.TipoEventoPago;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "eventos_pago")
@Getter
@Setter
@NoArgsConstructor
public class EventoPago {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "compra_id", nullable = false)
    private Compra compra;

    @Column(name = "proveedor", nullable = false, length = 50)
    private String proveedor;

    @Column(name = "evento_externo_id", nullable = false, length = 150)
    private String eventoExternoId;

    @Column(name = "transaccion_externa_id", length = 150)
    private String transaccionExternaId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_evento", nullable = false, length = 50)
    private TipoEventoPago tipoEvento;

    @Column(name = "version_estado_externo")
    private Long versionEstadoExterno;

    @Enumerated(EnumType.STRING)
    @Column(name = "resultado_procesamiento", nullable = false, length = 30)
    private ResultadoProcesamiento resultadoProcesamiento;

    // jsonb requiere un mapeador JSON en el classpath (Jackson 2 o compatible).
    // Guardar SOLO datos no sensibles del webhook previamente validado.
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload_resumen", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> payloadResumen = new HashMap<>();

    @Column(name = "fecha_evento_proveedor")
    private OffsetDateTime fechaEventoProveedor;

    @CreationTimestamp
    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private OffsetDateTime fechaRegistro;
}
