package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.exception.RecursoNoEncontradoException;
import com.aulabreve.catalogo.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CursoServiceTest {

    @Mock private CursoRepository cursoRepository;
    @Mock private CursoVersionRepository versionRepository;
    @Mock private CursoEtiquetaRepository cursoEtiquetaRepository;
    @Mock private ModuloRepository moduloRepository;
    @Mock private LeccionRepository leccionRepository;
    @Mock private PrecioService precioService;

    private CursoService servicio;

    @BeforeEach
    void configurar() {
        servicio = new CursoService(cursoRepository, versionRepository,
                cursoEtiquetaRepository, moduloRepository, leccionRepository,
                precioService);
    }

    @Test
    void sinCursosPublicadosDevuelvePaginaVacia() {
        Pageable pageable = Pageable.ofSize(10);
        when(cursoRepository.buscarPublicados(null, null, pageable))
                .thenReturn(Page.empty(pageable));
        assertTrue(servicio.listarPublicados(" ", null, pageable).isEmpty());
    }

    @Test
    void cursoInexistenteNoSeExpone() {
        UUID id = UUID.randomUUID();
        when(cursoRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(RecursoNoEncontradoException.class,
                () -> servicio.obtenerDetalle(id));
    }
}
