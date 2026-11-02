package com.aulabreve.catalogo.service;

import com.aulabreve.catalogo.dto.IniciarCheckoutResponse;
import com.aulabreve.catalogo.exception.RecursoNoEncontradoException;
import com.aulabreve.catalogo.exception.ReglaNegocioException;
import com.aulabreve.catalogo.integration.CheckoutGateway;
import com.aulabreve.catalogo.model.Compra;
import com.aulabreve.catalogo.model.Curso;
import com.aulabreve.catalogo.model.CursoVersion;
import com.aulabreve.catalogo.model.enums.EstadoCompra;
import com.aulabreve.catalogo.model.enums.EstadoCurso;
import com.aulabreve.catalogo.model.enums.EstadoCursoVersion;
import com.aulabreve.catalogo.repository.CompraRepository;
import com.aulabreve.catalogo.repository.CursoRepository;
import com.aulabreve.catalogo.repository.CursoVersionRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/** RF04: crea compra pendiente; la aprobacion se procesa via webhook verificado. */
@Service
public class CheckoutService {
    private final CursoRepository cursos;
    private final CursoVersionRepository versiones;
    private final CompraRepository compras;
    private final PrecioService precios;
    private final DerechoAccesoService acceso;
    private final CheckoutGateway proveedor;

    @Value("${app.demo.allow-loopback-checkout:false}")
    private boolean permitirHttpLocalDemo;

    public CheckoutService(CursoRepository cursos, CursoVersionRepository versiones,
            CompraRepository compras, PrecioService precios, DerechoAccesoService acceso,
            CheckoutGateway proveedor) {
        this.cursos = cursos;
        this.versiones = versiones;
        this.compras = compras;
        this.precios = precios;
        this.acceso = acceso;
        this.proveedor = proveedor;
    }

    @Transactional
    public IniciarCheckoutResponse iniciar(String estudianteId, UUID cursoId) {
        DerechoAccesoService.requireIdentity(estudianteId);
        Curso curso = cursos.findById(cursoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Curso no encontrado"));
        if (curso.getEstado() != EstadoCurso.PUBLICADO)
            throw new ReglaNegocioException("Curso no disponible para compras");
        CursoVersion version = versiones.findByCurso_IdAndEsVersionOfertadaTrue(cursoId)
                .filter(v -> v.getEstado() == EstadoCursoVersion.PUBLICADA)
                .orElseThrow(() -> new ReglaNegocioException("Sin version ofertada"));
        // No generar otra sesión si el alumno ya tiene el curso o una solicitud pendiente.
        // La validación se hace en el backend, incluso si alguien evita el botón del HTML.
        String estadoActual = acceso.consultar(estudianteId, cursoId).estado();
        if ("ACTIVO".equals(estadoActual)) {
            throw new ReglaNegocioException("Ya tienes este curso con acceso vigente. Ingresa a Mis cursos.");
        }
        if ("PENDIENTE".equals(estadoActual)) {
            throw new ReglaNegocioException("Ya tienes una solicitud pendiente para este curso.");
        }
        var precio = precios.obtenerPrecio(cursoId);
        // El adapter real debe crear una sesion comercial verificable, ligada a usuario y oferta.
        var sesion = proveedor.crearSesion(new CheckoutGateway.Solicitud(estudianteId,
                cursoId, version.getId(), precio.precioFinal(), precio.moneda()));
        if (sesion == null || sesion.proveedor() == null || sesion.proveedor().isBlank()
                || sesion.sesionId() == null || sesion.sesionId().isBlank()
                || sesion.urlCheckout() == null)
            throw new ReglaNegocioException("Proveedor devolvio una sesion de checkout invalida");
        var url = sesion.urlCheckout();
        boolean https = "https".equalsIgnoreCase(url.getScheme());
        boolean demoLocal = permitirHttpLocalDemo
                && "AULABREVE_DEMO".equals(sesion.proveedor())
                && "http".equalsIgnoreCase(url.getScheme())
                && "127.0.0.1".equals(url.getHost());
        if (!https && !demoLocal)
            throw new ReglaNegocioException("URL de checkout no autorizada");
        Compra compra = new Compra();
        compra.setEstudianteId(estudianteId);
        compra.setCurso(curso);
        compra.setCursoVersion(version);
        compra.setProveedorCheckout(sesion.proveedor());
        compra.setCheckoutSesionId(sesion.sesionId());
        compra.setPedidoExternoId(sesion.pedidoId());
        compra.setMontoTotal(precio.precioFinal());
        compra.setMoneda(precio.moneda());
        compra.setEstado(EstadoCompra.PENDIENTE);
        compra = compras.saveAndFlush(compra);
        return new IniciarCheckoutResponse(compra.getId(), sesion.urlCheckout(), "PENDIENTE");
    }
}
