package com.aulabreve.catalogo.dto;
import java.net.URI;
import java.util.UUID;
public record IniciarCheckoutResponse(UUID compraId, URI checkoutUrl, String estado) {}
