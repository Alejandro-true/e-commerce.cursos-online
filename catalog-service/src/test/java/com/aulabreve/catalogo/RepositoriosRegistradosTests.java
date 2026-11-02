package com.aulabreve.catalogo;

import com.aulabreve.catalogo.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class RepositoriosRegistradosTests {
    @Autowired ApplicationContext context;

    @Test
    void detectaLosTreceRepositorios() {
        assertNotNull(context.getBean(CategoriaRepository.class));
        assertNotNull(context.getBean(EtiquetaRepository.class));
        assertNotNull(context.getBean(CursoRepository.class));
        assertNotNull(context.getBean(CursoEtiquetaRepository.class));
        assertNotNull(context.getBean(CursoInstructorRepository.class));
        assertNotNull(context.getBean(PrecioPromocionRepository.class));
        assertNotNull(context.getBean(CursoVersionRepository.class));
        assertNotNull(context.getBean(ModuloRepository.class));
        assertNotNull(context.getBean(LeccionRepository.class));
        assertNotNull(context.getBean(RecursoLeccionRepository.class));
        assertNotNull(context.getBean(CompraRepository.class));
        assertNotNull(context.getBean(EventoPagoRepository.class));
        assertNotNull(context.getBean(DerechoAccesoRepository.class));
    }
}
