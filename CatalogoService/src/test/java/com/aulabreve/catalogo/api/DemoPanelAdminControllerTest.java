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

@ExtendWith(MockitoExtension.class)
class DemoPanelAdminControllerTest {
    @Mock DemoApiGuard guard;
    @Mock DemoComprasConsultaService consultas;
    @Mock DemoSimuladorPagoService simulador;
    @InjectMocks DemoPanelAdminController admin;

    @Test
    void claveIncorrectaNoPuedeAprobarCompra() {
        UUID compraId=UUID.randomUUID();
        doThrow(new SecurityException("Clave incorrecta")).when(guard).exigir("mala");
        assertThrows(SecurityException.class, () -> admin.decidir(
            "mala", compraId, new DemoPanelAdminController.Decision("APROBADO")));
        verifyNoInteractions(simulador);
    }
}
