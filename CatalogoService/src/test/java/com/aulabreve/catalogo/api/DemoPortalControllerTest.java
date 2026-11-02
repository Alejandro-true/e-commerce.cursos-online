package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.dto.IniciarCheckoutResponse;
import com.aulabreve.catalogo.service.CheckoutService;
import com.aulabreve.catalogo.service.CursoService;
import com.aulabreve.catalogo.service.MisCursosService;
import com.aulabreve.catalogo.service.DemoComprasConsultaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.net.URI;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DemoPortalControllerTest {
    @Mock CursoService cursos;
    @Mock CheckoutService checkout;
    @Mock MisCursosService misCursos;
    @Mock DemoComprasConsultaService consultas;
    @InjectMocks DemoPortalController portal;

    @Test
    void permiteSolicitudDeAlumnoDePrueba() {
        UUID cursoId=UUID.randomUUID(), compraId=UUID.randomUUID();
        when(checkout.iniciar("alumno-web-001", cursoId)).thenReturn(
            new IniciarCheckoutResponse(compraId,
                URI.create("http://127.0.0.1:8080/demo/checkout/prueba"), "PENDIENTE"));
        var respuesta=portal.iniciar(new DemoPortalController.NuevaCompra("alumno-web-001",cursoId));
        assertEquals(compraId, respuesta.compraId());
        assertEquals("PENDIENTE", respuesta.estado());
    }

    @Test
    void bloqueaIdentidadFueraDelDemo() {
        assertThrows(IllegalArgumentException.class, () ->
            portal.iniciar(new DemoPortalController.NuevaCompra("otro-estudiante",UUID.randomUUID())));
        verifyNoInteractions(checkout);
    }
}
