package com.aulabreve.catalogo.api;

import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.aulabreve.catalogo.security.UsuarioPrincipal;
import com.aulabreve.catalogo.service.DemoVideoService;

@RestController
@Profile("demo")
@RequestMapping("/api/demo/video")
public class DemoVideoController {
    private final DemoVideoService videos;

    public DemoVideoController(DemoVideoService videos) { this.videos = videos; }

    private static UUID estudiante(UsuarioPrincipal usuario) {
        if (usuario == null || usuario.getId() == null || !usuario.isEnabled()
                || usuario.getAuthorities().stream().noneMatch(
                        a -> "ROLE_ESTUDIANTE".equals(a.getAuthority()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo estudiantes autenticados");
        }
        return usuario.getId();
    }

    @GetMapping("/cursos/{cursoId}/contenido")
    public DemoVideoService.ContenidoVista contenido(@AuthenticationPrincipal UsuarioPrincipal usuario,
                                                    @PathVariable UUID cursoId) {
        return videos.contenido(estudiante(usuario), cursoId);
    }

    @GetMapping("/lecciones/{leccionId}/enlace")
    public DemoVideoService.EnlaceVista enlace(@AuthenticationPrincipal UsuarioPrincipal usuario,
                                              @PathVariable UUID leccionId) {
        return videos.emitirEnlace(estudiante(usuario), leccionId);
    }

    @GetMapping("/lecciones/{leccionId}/stream")
    public ResponseEntity<Resource> stream(@AuthenticationPrincipal UsuarioPrincipal usuario,
                                           @PathVariable UUID leccionId,
                                           @RequestParam String token) {
        Resource mp4 = videos.archivoAutorizado(estudiante(usuario), leccionId, token);
        // Spring MVC gestiona Range/206 al devolver ResponseEntity<Resource> con status 200.
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("video/mp4"))
                .cacheControl(CacheControl.noStore())
                .header("Referrer-Policy", "no-referrer")
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .header("X-Content-Type-Options", "nosniff")
                .body(mp4);
    }
}
