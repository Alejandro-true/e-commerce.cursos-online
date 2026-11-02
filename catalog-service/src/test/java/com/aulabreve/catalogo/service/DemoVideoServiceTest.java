package com.aulabreve.catalogo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class DemoVideoServiceTest {
    @Mock JdbcTemplate jdbc;
    @Mock DerechoAccesoService accesos;
    @Mock DemoVideoTokens tokens;
    @InjectMocks DemoVideoService service;

    @Test
    void unTokenNoValidoSeRechazaAntesDeConsultarLaBase() {
        UUID usuario = UUID.randomUUID();
        UUID leccion = UUID.randomUUID();
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.permitirStream(usuario, leccion, "falso"));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verifyNoInteractions(jdbc, accesos);
    }
}
