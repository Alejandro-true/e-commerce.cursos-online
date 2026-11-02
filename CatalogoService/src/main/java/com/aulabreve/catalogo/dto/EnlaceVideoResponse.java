package com.aulabreve.catalogo.dto;
import java.net.URI;
import java.time.OffsetDateTime;
public record EnlaceVideoResponse(URI urlTemporal, OffsetDateTime expiraEn) {}
