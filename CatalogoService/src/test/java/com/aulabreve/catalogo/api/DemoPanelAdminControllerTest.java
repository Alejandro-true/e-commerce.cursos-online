package com.aulabreve.catalogo.api;

import com.aulabreve.catalogo.integration.demo.DemoApiGuard;
import com.aulabreve.catalogo.service.DemoComprasConsultaService;
import com.aulabreve.catalogo.service.DemoSimuladorPagoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** El rol ADMIN se comprueba en SeguridadAdministradorDemoConfig, no aqui. */
@ExtendWith(MockitoExtension.class)
class DemoPanelAdminControllerTest {
    @Mock DemoApiGuard guard;
    @Mock DemoComprasConsultaService consultas;
    @Mock DemoSimuladorPagoService simulador;
    @InjectMocks DemoPanelAdminController admin;

    @Test
    void decisionValidaInvocaSimuladorSinClaveCompartida() {
        UUID id = UUID.randomUUID();
        var esperado = new DemoSimuladorPagoService.ResultadoDemo(id, UUID.randomUUID(),
                true, "PAGADO", "ACTIVO");
        when(simulador.simular(id, DemoSimuladorPagoService.Resultado.APROBADO))
                .thenReturn(esperado);
        var respuesta = admin.decidir(null, id,
                new DemoPanelAdminController.Decision("APROBADO"));
        assertEquals("PAGADO", respuesta.estadoCompra());
        verifyNoInteractions(guard);
    }

    @Test
    void decisionInvalidaNoLlamaAlSimulador() {
        assertThrows(IllegalArgumentException.class, () -> admin.decidir(
                null, UUID.randomUUID(), new DemoPanelAdminController.Decision("INVENTADO")));
        verifyNoInteractions(simulador);
    }
}
