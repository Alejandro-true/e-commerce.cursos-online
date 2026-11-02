package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.dto.MiCursoResponse;
import com.aulabreve.catalogo.model.DerechoAcceso;
import com.aulabreve.catalogo.model.enums.EstadoAcceso;
import com.aulabreve.catalogo.repository.DerechoAccesoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/** RF08: exclusivamente cursos adquiridos del estudiante autenticado. */
@Service
@Transactional(readOnly = true)
public class MisCursosService {
    private final DerechoAccesoRepository derechos;

    public MisCursosService(DerechoAccesoRepository derechos) {
        this.derechos = derechos;
    }

    public List<MiCursoResponse> listar(String estudianteId) {
        DerechoAccesoService.requireIdentity(estudianteId);
        return derechos.findByEstudianteIdAndEstadoAcceso(estudianteId, EstadoAcceso.ACTIVO)
                .stream().filter(DerechoAccesoService::vigente)
                .map(this::aResponse).toList();
    }

    private MiCursoResponse aResponse(DerechoAcceso d) {
        return new MiCursoResponse(d.getCurso().getId(), d.getCurso().getTitulo(),
                d.getCursoVersion().getId(), d.getCursoVersion().getNumeroVersion(),
                d.getFechaOtorgamiento(), d.getFechaExpiracion());
    }
}
