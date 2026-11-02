package com.aulabreve.catalogo.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/** Almacenamiento privado DEMO: UUID opaco, no rutas suministradas por usuarios. */
@Service
@Profile("demo")
public class DemoVideoAlmacenPrivado {
    private static final long MAX_BYTES = 200L * 1024L * 1024L;
    private final Path raiz;

    public DemoVideoAlmacenPrivado(@Value("${VIDEO_STORAGE_DIR:}") String directorio) {
        if (directorio == null || directorio.isBlank()) {
            throw new IllegalStateException("Configura VIDEO_STORAGE_DIR en CatalogoService/.env");
        }
        try {
            raiz = Paths.get(directorio).toAbsolutePath().normalize();
            Files.createDirectories(raiz);
            if (!Files.isDirectory(raiz, LinkOption.NOFOLLOW_LINKS) || !Files.isWritable(raiz)) {
                throw new IOException("Carpeta de videos no disponible para escritura");
            }
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo preparar VIDEO_STORAGE_DIR", ex);
        }
    }

    /** Devuelve solo una referencia, nunca la ruta local del archivo. */
    public String guardar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona un MP4 no vacio");
        }
        String nombre = archivo.getOriginalFilename();
        if (nombre == null || !nombre.toLowerCase(Locale.ROOT).endsWith(".mp4")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se permiten archivos .mp4");
        }
        if (archivo.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "El limite DEMO es 200 MB");
        }
        UUID id = UUID.randomUUID();
        Path destino = rutaPara(id);
        Path temporal = null;
        try {
            temporal = Files.createTempFile(raiz, "upload-", ".part");
            long total = 0L;
            try (InputStream in = archivo.getInputStream();
                 OutputStream out = Files.newOutputStream(temporal)) {
                byte[] buffer = new byte[8192];
                int leidos;
                while ((leidos = in.read(buffer)) != -1) {
                    total += leidos;
                    if (total > MAX_BYTES) {
                        throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "El limite DEMO es 200 MB");
                    }
                    out.write(buffer, 0, leidos);
                }
            }
            // Comprobacion basica de contenedor MP4: tamano + firma 'ftyp' en byte 4.
            byte[] cabecera = new byte[12];
            try (InputStream in = Files.newInputStream(temporal)) {
                if (in.readNBytes(cabecera, 0, cabecera.length) != cabecera.length
                        || cabecera[4] != 'f' || cabecera[5] != 't'
                        || cabecera[6] != 'y' || cabecera[7] != 'p') {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo no parece ser un contenedor MP4 valido");
                }
            }
            try {
                Files.move(temporal, destino, StandardCopyOption.ATOMIC_MOVE);
            } catch (AtomicMoveNotSupportedException ex) {
                Files.move(temporal, destino);
            }
            return "local:" + id;
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "No se pudo guardar el MP4 privado", ex);
        } finally {
            if (temporal != null) {
                try { Files.deleteIfExists(temporal); } catch (IOException ignored) { }
            }
        }
    }

    public static boolean esReferenciaLocal(String referencia) {
        if (referencia == null || !referencia.startsWith("local:")) return false;
        try {
            UUID id = UUID.fromString(referencia.substring(6));
            return referencia.equals("local:" + id);
        } catch (IllegalArgumentException ex) { return false; }
    }

    public Resource abrir(String referencia) {
        if (!esReferenciaLocal(referencia)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Referencia de video invalida");
        }
        Path ruta = rutaPara(UUID.fromString(referencia.substring(6)));
        if (!Files.isRegularFile(ruta, LinkOption.NOFOLLOW_LINKS) || !Files.isReadable(ruta)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "MP4 privado no encontrado");
        }
        return new FileSystemResource(ruta);
    }

    public void eliminarSiExiste(String referencia) {
        if (!esReferenciaLocal(referencia)) return;
        try { Files.deleteIfExists(rutaPara(UUID.fromString(referencia.substring(6)))); }
        catch (IOException ex) { /* Se puede limpiar manualmente un huerfano DEMO. */ }
    }

    private Path rutaPara(UUID id) {
        Path ruta = raiz.resolve(id.toString() + ".mp4").normalize();
        if (!ruta.getParent().equals(raiz)) throw new IllegalArgumentException("Ruta de video invalida");
        return ruta;
    }
}
