package com.aulabreve.catalogo.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.aulabreve.catalogo.model.Compra;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CompraRepository extends JpaRepository<Compra, UUID> {
    Page<Compra> findByEstudianteIdOrderByFechaCompraDesc(
            String estudianteId, Pageable pageable);
    Optional<Compra> findByProveedorCheckoutAndCheckoutSesionId(
            String proveedorCheckout, String checkoutSesionId);
    Optional<Compra> findByProveedorCheckoutAndPedidoExternoId(
            String proveedorCheckout, String pedidoExternoId);
            
            
        @Query("""
        SELECT c
        FROM Compra c
        JOIN FETCH c.curso
        WHERE c.id = :compraId
        """)
        Optional<Compra> buscarConCursoPorId(
         @Param("compraId") UUID compraId
);
}
