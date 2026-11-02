package com.aulabreve.catalogo.service;
import com.aulabreve.catalogo.model.DerechoAcceso;
import com.aulabreve.catalogo.model.enums.EstadoAcceso;
import com.aulabreve.catalogo.repository.CompraRepository;
import com.aulabreve.catalogo.repository.DerechoAccesoRepository;
import org.junit.jupiter.api.Test;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class DerechoAccesoServiceTest {
    @Test void accesoExpiradoNoEsVigente() {
        DerechoAcceso d = new DerechoAcceso();
        d.setEstadoAcceso(EstadoAcceso.ACTIVO);
        d.setFechaExpiracion(OffsetDateTime.now(ZoneOffset.UTC).minusMinutes(5));
        assertFalse(DerechoAccesoService.vigente(d));
    }
    @Test void identidadVaciaRechazada() {
        var s = new DerechoAccesoService(mock(DerechoAccesoRepository.class),
                mock(CompraRepository.class));
        assertThrows(IllegalArgumentException.class, () -> s.consultar("  ", java.util.UUID.randomUUID()));
    }
}
