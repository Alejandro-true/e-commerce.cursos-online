package com.aulabreve.catalogo.api;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** El frontend del mismo origen usa la cookie de sesion y envia este token en POST. */
@RestController
@Profile("demo")
@RequestMapping("/api/v1/seguridad")
public class ApiCsrfV1Controller {
    public record DatosCsrf(String headerName, String parameterName, String token) {}

    @GetMapping("/csrf")
    public DatosCsrf csrf(HttpServletRequest request) {
        CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (token == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Token CSRF no disponible");
        }
        return new DatosCsrf(token.getHeaderName(), token.getParameterName(), token.getToken());
    }
}
