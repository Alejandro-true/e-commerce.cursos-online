package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.dto.ActualizarCursoRequest;
import com.aulabreve.catalogo.dto.ConfigurarPrecioRequest;
import com.aulabreve.catalogo.dto.CrearCursoRequest;
import com.aulabreve.catalogo.model.enums.Moneda;
import com.aulabreve.catalogo.model.enums.NivelCurso;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DemoCursosAdminServiceTest {
    @Mock CursoAdministracionService administracion;
    @Mock JdbcTemplate jdbc;
    @InjectMocks DemoCursosAdminService servicio;

    private DemoCursosAdminService.CursoFormulario formulario() {
        return new DemoCursosAdminService.CursoFormulario(
                UUID.randomUUID(), "Python desde cero", "python-desde-cero",
                "Introduccion al lenguaje Python", NivelCurso.BASICO,
                null, new BigDecimal("149.90"), Moneda.PEN);
    }

    @Test
    void crearCursoGuardaBorradorYPrecio() {
        UUID id = UUID.randomUUID();
        when(administracion.crearBorrador(any(CrearCursoRequest.class))).thenReturn(id);
        var resultado = servicio.crear(formulario());
        assertEquals(id, resultado.cursoId());
        assertEquals("BORRADOR", resultado.estado());
        verify(administracion).crearBorrador(any(CrearCursoRequest.class));
        verify(administracion).configurarPrecio(eq(id), any(ConfigurarPrecioRequest.class));
    }

    @Test
    void editarSoloDelegaEnServicioDeReglas() {
        UUID id = UUID.randomUUID();
        var resultado = servicio.editar(id, formulario());
        assertEquals(id, resultado.cursoId());
        verify(administracion).actualizarBorrador(eq(id), any(ActualizarCursoRequest.class));
        verify(administracion).configurarPrecio(eq(id), any(ConfigurarPrecioRequest.class));
    }

    @Test
    void precioInvalidoNoCreaCurso() {
        var original = formulario();
        var invalido = new DemoCursosAdminService.CursoFormulario(
                original.categoriaId(), original.titulo(), original.slug(),
                original.descripcion(), original.nivel(), original.miniaturaUrl(),
                new BigDecimal("-1.00"), original.moneda());
        assertThrows(IllegalArgumentException.class, () -> servicio.crear(invalido));
        verifyNoInteractions(administracion);
    }
}
