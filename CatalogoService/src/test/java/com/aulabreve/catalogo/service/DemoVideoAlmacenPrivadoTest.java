package com.aulabreve.catalogo.service;

import static org.junit.jupiter.api.Assertions.*;

import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

class DemoVideoAlmacenPrivadoTest {
    @TempDir Path temporal;

    @Test
    void almacenaMp4ConNombreOpacoYLoRecupera() throws Exception {
        var almacen = new DemoVideoAlmacenPrivado(temporal.toString());
        byte[] mp4 = {0,0,0,24,'f','t','y','p','i','s','o','m'};
        var archivo = new MockMultipartFile("archivo", "mi leccion.mp4", "video/mp4", mp4);
        String ref = almacen.guardar(archivo);
        assertTrue(DemoVideoAlmacenPrivado.esReferenciaLocal(ref));
        assertTrue(almacen.abrir(ref).exists());
        assertNotEquals("local:mi leccion.mp4", ref);
        almacen.eliminarSiExiste(ref);
        assertThrows(ResponseStatusException.class, () -> almacen.abrir(ref));
    }

    @Test
    void rechazaRutasYExtensionIncorrecta() {
        var almacen = new DemoVideoAlmacenPrivado(temporal.toString());
        assertFalse(DemoVideoAlmacenPrivado.esReferenciaLocal("local:../../secreto"));
        var archivo = new MockMultipartFile("archivo", "foto.jpg", "image/jpeg", new byte[]{1,2,3});
        assertThrows(ResponseStatusException.class, () -> almacen.guardar(archivo));
    }
}
