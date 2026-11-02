package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.model.PrecioPromocion;
import com.aulabreve.catalogo.model.enums.Moneda;
import com.aulabreve.catalogo.repository.PrecioPromocionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PrecioServiceTest {
    @Mock private PrecioPromocionRepository precioRepository;
    @InjectMocks private PrecioService servicio;

    @Test
    void precioSinOfertaUsaPrecioBase() {
        UUID cursoId = UUID.randomUUID();
        PrecioPromocion precio = new PrecioPromocion();
        precio.setPrecioBase(new BigDecimal("70.00"));
        precio.setMoneda(Moneda.PEN);
        when(precioRepository.findByCurso_Id(cursoId)).thenReturn(Optional.of(precio));

        var respuesta = servicio.obtenerPrecio(cursoId);
        assertEquals(new BigDecimal("70.00"), respuesta.precioFinal());
        assertNull(respuesta.precioOfertaVigente());
    }
}
