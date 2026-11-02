package com.aulabreve.catalogo.dto;
import com.aulabreve.catalogo.model.enums.EstadoVideo;
import com.aulabreve.catalogo.model.enums.TipoLeccion;
public record CrearLeccionRequest(String titulo, String descripcion, TipoLeccion tipo,
       String contenidoTexto, String videoReferencia, EstadoVideo estadoVideo,
       Integer duracionSegundos, boolean obligatorio, int orden) {}
