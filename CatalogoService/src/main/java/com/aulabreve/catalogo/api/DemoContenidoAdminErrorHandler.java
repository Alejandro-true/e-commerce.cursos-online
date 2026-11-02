package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.exception.ReglaNegocioException;
import com.aulabreve.catalogo.exception.RecursoNoEncontradoException;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice(assignableTypes=DemoContenidoAdminController.class)
@Profile("demo")
public class DemoContenidoAdminErrorHandler {
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String,String>> seguridad(SecurityException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
    }
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String,String>> noEncontrado(RecursoNoEncontradoException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
    }
    @ExceptionHandler({ReglaNegocioException.class,IllegalArgumentException.class})
    public ResponseEntity<Map<String,String>> regla(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
    }
}
