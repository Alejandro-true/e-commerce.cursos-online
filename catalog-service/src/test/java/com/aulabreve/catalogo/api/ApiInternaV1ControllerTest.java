package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.service.IntegracionConsultaService;
import org.junit.jupiter.api.Test;
import java.time.OffsetDateTime;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ApiInternaV1ControllerTest {
    @Test void consultaDerechoSinCambiarEstadoComercial() {
        UUID usuario = UUID.randomUUID();
        UUID curso = UUID.randomUUID();
        UUID version = UUID.randomUUID();
        IntegracionConsultaService consulta = mock(IntegracionConsultaService.class);
        var esperado = new IntegracionConsultaService.Acceso(
                usuario, curso, version, true, OffsetDateTime.now());
        when(consulta.comprobarAcceso(usuario, curso, version)).thenReturn(esperado);
        var controlador = new ApiInternaV1Controller(consulta);
        var respuesta = controlador.acceso(usuario, curso, version);
        assertTrue(respuesta.activo());
        assertEquals(version, respuesta.cursoVersionId());
        verify(consulta).comprobarAcceso(usuario, curso, version);
    }
}
