package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.service.RegistroUsuarioService;
import com.aulabreve.catalogo.security.UsuarioPrincipal;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@Profile("demo")
@RequestMapping("/api/demo/auth")
public class CuentaAuthController {
    public record TokenCsrf(String nombreHeader, String token) {}
    public record RegistroRequest(String nombre, String email, String password, String confirmacion) {}
    public record RegistroResponse(String id, String nombre, String email) {}
    public record IdentidadResponse(String id, String nombre, String email, String rol) {}

    private final RegistroUsuarioService registro;

    public CuentaAuthController(RegistroUsuarioService registro) {
        this.registro = registro;
    }

    @GetMapping("/csrf")
    public TokenCsrf csrf(CsrfToken token) {
        return new TokenCsrf(token.getHeaderName(), token.getToken());
    }

    @GetMapping("/me")
    public IdentidadResponse identidad(@AuthenticationPrincipal UsuarioPrincipal principal) {
        if (principal == null || !principal.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicia sesión para continuar");
        }
        String rol = principal.getAuthorities().stream()
                .findFirst().map(authority -> authority.getAuthority().replaceFirst("^ROLE_", ""))
                .orElse("ESTUDIANTE");
        return new IdentidadResponse(principal.getId().toString(), principal.getNombre(),
                principal.getUsername(), rol);
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public RegistroResponse registrar(@RequestBody RegistroRequest request) {
        try {
            var usuario = registro.registrar(
                    request.nombre(), request.email(), request.password(), request.confirmacion());
            return new RegistroResponse(
                    usuario.getId().toString(), usuario.getNombre(), usuario.getEmail());
        } catch (IllegalArgumentException ex) {
            HttpStatus status = ex.getMessage() != null && ex.getMessage().contains("ya está registrado")
                    ? HttpStatus.CONFLICT
                    : HttpStatus.BAD_REQUEST;
            throw new ResponseStatusException(status, ex.getMessage(), ex);
        }
    }
}
