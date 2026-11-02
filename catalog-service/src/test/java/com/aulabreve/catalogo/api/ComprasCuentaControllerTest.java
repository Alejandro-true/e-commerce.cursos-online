package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.dto.IniciarCheckoutResponse;
import com.aulabreve.catalogo.model.Usuario;
import com.aulabreve.catalogo.model.enums.RolUsuario;
import com.aulabreve.catalogo.security.UsuarioPrincipal;
import com.aulabreve.catalogo.service.CheckoutService;
import com.aulabreve.catalogo.service.DemoComprasConsultaService;
import com.aulabreve.catalogo.service.MisCursosService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComprasCuentaControllerTest {
    @Mock CheckoutService checkout;
    @Mock MisCursosService misCursos;
    @Mock DemoComprasConsultaService consultas;
    @InjectMocks ComprasCuentaController api;

    private UsuarioPrincipal usuario(UUID id) {
        Usuario u = new Usuario();
        u.setId(id);
        u.setNombre("Estudiante Demo");
        u.setEmail("prueba@ejemplo.test");
        u.setPasswordHash("hash-no-utilizado");
        u.setRol(RolUsuario.ESTUDIANTE);
        u.setActivo(true);
        return new UsuarioPrincipal(u);
    }

    @Test void compraUsaUuidDeSesionYNoCorreo() {
        UUID estudianteId = UUID.randomUUID(), cursoId = UUID.randomUUID(), compraId = UUID.randomUUID();
        when(checkout.iniciar(estudianteId.toString(), cursoId))
            .thenReturn(new IniciarCheckoutResponse(compraId,
                URI.create("http://127.0.0.1:8080/demo/checkout/prueba"), "PENDIENTE"));
        var r = api.comprar(usuario(estudianteId), new ComprasCuentaController.CompraSolicitada(cursoId));
        assertEquals(compraId, r.compraId());
        assertEquals("PENDIENTE", r.estado());
        verify(checkout).iniciar(estudianteId.toString(), cursoId);
    }

    @Test void sinPrincipalNoPuedeComprarNiConsultarCompras() {
        UUID curso = UUID.randomUUID();
        assertThrows(ResponseStatusException.class,
            () -> api.comprar(null, new ComprasCuentaController.CompraSolicitada(curso)));
        assertThrows(ResponseStatusException.class, () -> api.historial(null));
        verifyNoInteractions(checkout, consultas, misCursos);
    }

    @Test void misCursosEHistorialUsanLaMismaIdentidadAutenticada() {
        UUID id = UUID.randomUUID();
        when(consultas.delEstudiante(id.toString())).thenReturn(List.of());
        when(misCursos.listar(id.toString())).thenReturn(List.of());
        assertTrue(api.historial(usuario(id)).isEmpty());
        assertTrue(api.adquiridos(usuario(id)).isEmpty());
        verify(consultas).delEstudiante(id.toString());
        verify(misCursos).listar(id.toString());
    }
}
