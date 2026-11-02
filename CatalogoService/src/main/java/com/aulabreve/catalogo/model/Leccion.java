package com.aulabreve.catalogo.model;

import com.aulabreve.catalogo.model.enums.EstadoVideo;
import com.aulabreve.catalogo.model.enums.TipoLeccion;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "lecciones")
@Getter
@Setter
@NoArgsConstructor
public class Leccion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "modulo_id", nullable = false)
    private Modulo modulo;

    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoLeccion tipo;

    @Column(name = "contenido_texto", columnDefinition = "TEXT")
    private String contenidoTexto;

    // Referencia privada del proveedor multimedia, no una URL publica permanente.
    @Column(name = "video_referencia", length = 255)
    private String videoReferencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_video", nullable = false, length = 20)
    private EstadoVideo estadoVideo = EstadoVideo.NO_APLICA;

    @Column(name = "duracion_segundos")
    private Integer duracionSegundos;

    @Column(name = "obligatorio", nullable = false)
    private Boolean obligatorio = true;

    @Column(name = "orden", nullable = false)
    private Integer orden;
}
