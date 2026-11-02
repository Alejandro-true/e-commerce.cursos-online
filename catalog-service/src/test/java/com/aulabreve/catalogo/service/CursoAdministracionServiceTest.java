package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.exception.ReglaNegocioException;
import com.aulabreve.catalogo.model.*;
import com.aulabreve.catalogo.model.enums.EstadoCurso;
import com.aulabreve.catalogo.model.enums.EstadoCursoVersion;
import jakarta.persistence.LockModeType;
import com.aulabreve.catalogo.repository.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class CursoAdministracionServiceTest {
    @Test void publicarSinPrecioSeRechaza() {
        var cursos = mock(CursoRepository.class);
        var categorias = mock(CategoriaRepository.class);
        var precios = mock(PrecioPromocionRepository.class);
        var versiones = mock(CursoVersionRepository.class);
        var modulos = mock(ModuloRepository.class);
        var lecciones = mock(LeccionRepository.class);
        var recursos = mock(RecursoLeccionRepository.class);
        var em = mock(EntityManager.class);
        var servicio = new CursoAdministracionService(cursos, categorias, precios,
                versiones, modulos, lecciones, recursos, em);
        UUID cursoId = UUID.randomUUID(), versionId = UUID.randomUUID();
        Curso c = new Curso();
        c.setId(cursoId); c.setTitulo("Java"); c.setDescripcion("Curso completo");
        c.setEstado(EstadoCurso.BORRADOR);
        CursoVersion v = new CursoVersion(); v.setId(versionId);
        v.setCurso(c); v.setEstado(EstadoCursoVersion.BORRADOR);
        when(cursos.findById(cursoId)).thenReturn(Optional.of(c));

        
        when(em.find(eq(CursoVersion.class),eq(versionId),eq(LockModeType.PESSIMISTIC_WRITE))).thenReturn(v);
    

        when(precios.existsByCurso_Id(cursoId)).thenReturn(false);
        assertThrows(ReglaNegocioException.class, () -> servicio.publicar(cursoId, versionId));
        verify(versiones, never()).save(any());
    }
}
