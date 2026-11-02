package com.aulabreve.catalogo.exception;

/** Inconsistencia interna (por ejemplo, curso publicado sin precio configurado). */
public class ConfiguracionCatalogoException extends IllegalStateException {
    public ConfiguracionCatalogoException(String mensaje) {
        super(mensaje);
    }
}
