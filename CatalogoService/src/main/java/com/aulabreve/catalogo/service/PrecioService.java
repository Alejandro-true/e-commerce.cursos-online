package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.dto.PrecioResponse;
import com.aulabreve.catalogo.exception.ConfiguracionCatalogoException;
import com.aulabreve.catalogo.model.PrecioPromocion;
import com.aulabreve.catalogo.repository.PrecioPromocionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PrecioService {

    private final PrecioPromocionRepository precioRepository;

    public PrecioService(PrecioPromocionRepository precioRepository) {
        this.precioRepository = precioRepository;
    }

    public PrecioResponse obtenerPrecio(UUID cursoId) {
        PrecioPromocion p = precioRepository.findByCurso_Id(cursoId)
                .orElseThrow(() -> new ConfiguracionCatalogoException(
                        "El curso no tiene precio configurado: " + cursoId));

        OffsetDateTime ahora = OffsetDateTime.now(ZoneOffset.UTC);
        boolean ofertaVigente = p.getPrecioOferta() != null
                && p.getFechaInicio() != null
                && p.getFechaFin() != null
                && !ahora.isBefore(p.getFechaInicio())
                && ahora.isBefore(p.getFechaFin());

        return new PrecioResponse(
                p.getPrecioBase(),
                ofertaVigente ? p.getPrecioOferta() : p.getPrecioBase(),
                ofertaVigente ? p.getPrecioOferta() : null,
                p.getMoneda(),
                ofertaVigente ? p.getFechaFin() : null);
    }
}
