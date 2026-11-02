package com.aulabreve.catalogo.integration;
import java.net.URI;
import java.time.Duration;
/** Solo el proveedor multimedia crea URLs firmadas. */
public interface VideoGateway {
    URI generarUrlTemporal(String referenciaPrivada, Duration vigencia);
}
