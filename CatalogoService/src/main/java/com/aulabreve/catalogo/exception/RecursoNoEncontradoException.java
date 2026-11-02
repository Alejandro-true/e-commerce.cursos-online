package com.aulabreve.catalogo.exception;

/** Luego sera traducida a HTTP 404 por la capa api. */
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
