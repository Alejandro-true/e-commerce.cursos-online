package com.aulabreve.catalogo.service;
import com.aulabreve.catalogo.exception.ReglaNegocioException;
import com.aulabreve.catalogo.integration.VideoGateway;
import com.aulabreve.catalogo.model.Leccion;
import com.aulabreve.catalogo.model.enums.EstadoVideo;
import com.aulabreve.catalogo.model.enums.TipoLeccion;
import com.aulabreve.catalogo.repository.LeccionRepository;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class AutorizacionVideoServiceTest {
    @Test void lecturaNoPuedeEmitirEnlace() {
        var repo = mock(LeccionRepository.class);
        var derechos = mock(DerechoAccesoService.class);
        var video = mock(VideoGateway.class);
        var servicio = new AutorizacionVideoService(repo, derechos, video);
        UUID id = UUID.randomUUID();
        Leccion l = new Leccion(); l.setTipo(TipoLeccion.LECTURA);
        l.setEstadoVideo(EstadoVideo.NO_APLICA);
        when(repo.findById(id)).thenReturn(Optional.of(l));
        assertThrows(ReglaNegocioException.class, () -> servicio.autorizar("uid-1", id));
        verifyNoInteractions(video);
    }
}
