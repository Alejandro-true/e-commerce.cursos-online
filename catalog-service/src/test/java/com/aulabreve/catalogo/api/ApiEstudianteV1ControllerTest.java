package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.dto.IniciarCheckoutResponse;
import com.aulabreve.catalogo.model.Usuario;
import com.aulabreve.catalogo.model.enums.RolUsuario;
import com.aulabreve.catalogo.security.UsuarioPrincipal;
import com.aulabreve.catalogo.service.CheckoutService;
import com.aulabreve.catalogo.service.DemoComprasConsultaService;
import com.aulabreve.catalogo.service.MisCursosService;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ApiEstudianteV1ControllerTest {
    @Test
    void compraUsaUuidDeLaSesionNoUnIdDelNavegador() {
        UUID id = UUID.randomUUID();
        UUID curso = UUID.randomUUID();
        UUID compra = UUID.randomUUID();
        Usuario u = new Usuario();
        u.setId(id);
        u.setNombre("Estudiante Demo");
        u.setEmail("demo@example.test");
        u.setPasswordHash("hash");
        u.setRol(RolUsuario.ESTUDIANTE);
        u.setActivo(true);

        CheckoutService checkout = mock(CheckoutService.class);
        DemoComprasConsultaService consultas = mock(DemoComprasConsultaService.class);
        MisCursosService misCursos = mock(MisCursosService.class);
        when(checkout.iniciar(id.toString(), curso))
                .thenReturn(new IniciarCheckoutResponse(compra, null, "PENDIENTE"));
        var api = new ApiEstudianteV1Controller(checkout, consultas, misCursos);
        var resultado = api.comprar(new UsuarioPrincipal(u),
                new ApiEstudianteV1Controller.Comprar(curso));
        assertEquals(compra, resultado.compraId());
        assertEquals("PENDIENTE", resultado.estado());
        verify(checkout).iniciar(id.toString(), curso);
    }
}
