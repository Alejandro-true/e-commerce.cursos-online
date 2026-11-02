package com.aulabreve.catalogo.repository;

import com.aulabreve.catalogo.model.EventoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventoPagoRepository extends JpaRepository<EventoPago, UUID> {
    boolean existsByProveedorAndEventoExternoId(
            String proveedor, String eventoExternoId);
    Optional<EventoPago> findByProveedorAndEventoExternoId(
            String proveedor, String eventoExternoId);
    List<EventoPago> findByCompra_IdOrderByFechaRegistroDesc(UUID compraId);
}
