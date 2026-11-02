package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.exception.ReglaNegocioException;
import com.aulabreve.catalogo.exception.RecursoNoEncontradoException;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

/** Errores de negocio comprensibles para la nueva API autenticada. */
@RestControllerAdvice(assignableTypes = ComprasCuentaController.class)
@Profile("demo")
public class ComprasCuentaErrorHandler {
    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<Map<String,String>> regla(ReglaNegocioException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String,String>> ausente(RecursoNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
    }
}
