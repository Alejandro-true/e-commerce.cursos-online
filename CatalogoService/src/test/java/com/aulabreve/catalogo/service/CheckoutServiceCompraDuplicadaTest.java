package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.dto.EstadoDerechoResponse;
import com.aulabreve.catalogo.exception.ReglaNegocioException;
import com.aulabreve.catalogo.integration.CheckoutGateway;
import com.aulabreve.catalogo.model.Curso;
import com.aulabreve.catalogo.model.CursoVersion;
import com.aulabreve.catalogo.model.enums.EstadoCurso;
import com.aulabreve.catalogo.model.enums.EstadoCursoVersion;
import com.aulabreve.catalogo.repository.CompraRepository;
import com.aulabreve.catalogo.repository.CursoRepository;
import com.aulabreve.catalogo.repository.CursoVersionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CheckoutServiceCompraDuplicadaTest {
    @Mock CursoRepository cursos;
    @Mock CursoVersionRepository versiones;
    @Mock CompraRepository compras;
    @Mock PrecioService precios;
    @Mock DerechoAccesoService acceso;
    @Mock CheckoutGateway proveedor;
    @InjectMocks CheckoutService servicio;

    private final UUID cursoId = UUID.randomUUID();

    private void cursoPublicado() {
        Curso curso = new Curso();
        curso.setId(cursoId);
        curso.setEstado(EstadoCurso.PUBLICADO);
        CursoVersion version = new CursoVersion();
        version.setEstado(EstadoCursoVersion.PUBLICADA);
        when(cursos.findById(cursoId)).thenReturn(Optional.of(curso));
        when(versiones.findByCurso_IdAndEsVersionOfertadaTrue(cursoId))
                .thenReturn(Optional.of(version));
    }

    @Test
    void noPermiteComprarCursoYaAdquirido() {
        cursoPublicado();
        when(acceso.consultar("alumno-web-001", cursoId))
                .thenReturn(new EstadoDerechoResponse(cursoId, "ACTIVO", null, null));
        ReglaNegocioException error = assertThrows(ReglaNegocioException.class,
                () -> servicio.iniciar("alumno-web-001", cursoId));
        assertTrue(error.getMessage().contains("Ya tienes este curso"));
        verifyNoInteractions(proveedor, precios, compras);
    }

    @Test
    void noPermiteOtraSolicitudSiYaHayUnaPendiente() {
        cursoPublicado();
        when(acceso.consultar("alumno-web-001", cursoId))
                .thenReturn(new EstadoDerechoResponse(cursoId, "PENDIENTE", null, null));
        ReglaNegocioException error = assertThrows(ReglaNegocioException.class,
                () -> servicio.iniciar("alumno-web-001", cursoId));
        assertTrue(error.getMessage().contains("solicitud pendiente"));
        verifyNoInteractions(proveedor, precios, compras);
    }
}
