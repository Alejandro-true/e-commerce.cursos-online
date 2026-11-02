package com.aulabreve.catalogo.service;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DemoContenidoAdminServiceTest {
    private final CursoAdministracionService admin=mock(CursoAdministracionService.class);
    private final JdbcTemplate jdbc=mock(JdbcTemplate.class);
    private final DemoContenidoAdminService servicio=new DemoContenidoAdminService(admin,jdbc);

    @Test void rechazaVersionSinNumero() {
        assertThrows(IllegalArgumentException.class, () ->
                servicio.crearVersion(UUID.randomUUID(),new DemoContenidoAdminService.NuevaVersion(" ")));
        verifyNoInteractions(admin,jdbc);
    }
    @Test void rechazaModuloSinOrden() {
        assertThrows(IllegalArgumentException.class, () ->
                servicio.agregarModulo(UUID.randomUUID(),UUID.randomUUID(),
                  new DemoContenidoAdminService.NuevoModulo("Intro",null,0)));
        verifyNoInteractions(admin,jdbc);
    }
    @Test void rechazaLeccionSinTipo() {
        assertThrows(IllegalArgumentException.class, () ->
                servicio.agregarLeccion(UUID.randomUUID(),UUID.randomUUID(),
                  new DemoContenidoAdminService.NuevaLeccion("Leccion",null,null,null,null,null,null,true,1)));
        verifyNoInteractions(admin,jdbc);
    }
    @Test void rechazaRecursoSinReferencia() {
        assertThrows(IllegalArgumentException.class, () ->
                servicio.agregarRecurso(UUID.randomUUID(),UUID.randomUUID(),
                   new DemoContenidoAdminService.NuevoRecurso("PDF", " ",null)));
        verifyNoInteractions(admin,jdbc);
    }
}
