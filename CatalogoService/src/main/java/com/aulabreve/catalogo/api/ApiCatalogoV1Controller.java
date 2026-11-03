package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.dto.CategoriaResponse;
import com.aulabreve.catalogo.dto.CursoDetalleResponse;
import com.aulabreve.catalogo.dto.CursoResumenResponse;
import com.aulabreve.catalogo.service.CategoriaService;
import com.aulabreve.catalogo.service.CursoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/** RF01/RF02: contratos JSON publicos, sin referencias privadas de videos. */
@RestController
@RequestMapping("/api/v1/catalogo")
public class ApiCatalogoV1Controller {
    public record Pagina<T>(List<T>items, int pagina, int tamano,
                            long totalElementos, int totalPaginas) {
        public static <T> Pagina<T> de(Page<T> resultado) {
            return new Pagina<>(resultado.getContent(), resultado.getNumber(),
                    resultado.getSize(), resultado.getTotalElements(),
                    resultado.getTotalPages());
        }
    }

    private final CursoService cursos;
    private final CategoriaService categorias;

    public ApiCatalogoV1Controller(CursoService cursos, CategoriaService categorias) {
        this.cursos = cursos;
        this.categorias = categorias;
    }

    @GetMapping("/cursos")
    public Pagina<CursoResumenResponse> catalogo(
            @RequestParam(required = false) String texto,
            @RequestParam(required = false) UUID categoriaId,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "12") int tamano) {
        validarPagina(pagina, tamano);
        return Pagina.de(cursos.listarPublicados(texto, categoriaId,
                PageRequest.of(pagina, tamano)));
    }

    @GetMapping("/cursos/{cursoId}")
    public CursoDetalleResponse detalle(@PathVariable UUID cursoId) {
        return cursos.obtenerDetalle(cursoId);
    }

    @GetMapping("/cursos/slug/{slug}")
    public CursoDetalleResponse detalleSlug(@PathVariable String slug) {
        return cursos.obtenerDetallePorSlug(slug);
    }

    @GetMapping("/categorias")
    public Pagina<CategoriaResponse> categorias(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "30") int tamano) {
        validarPagina(pagina, tamano);
        return Pagina.de(categorias.listarActivas(PageRequest.of(pagina, tamano)));
    }

    private static void validarPagina(int pagina, int tamano) {
        if (pagina < 0 || tamano < 1 || tamano > 50) {
            throw new IllegalArgumentException("pagina >= 0 y tamano entre 1 y 50");
        }
    }
}
