package com.tmdt.fashion_shop.repository;

import com.tmdt.fashion_shop.entity.OrderItem;
import com.tmdt.fashion_shop.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, String> {
    List<OrderItem> findByOrder_Id(String orderId);
    @Query("""
    SELECT p.id, p.name, p.price, SUM(oi.quantity)
    FROM OrderItem oi
    JOIN oi.order o
    JOIN oi.productVariant pv
    JOIN pv.product p
    WHERE o.status = 'COMPLETED'
    GROUP BY p.id, p.name, p.price
    ORDER BY SUM(oi.quantity) DESC
    """)
    Page<Object[]> findBestSellingProducts(Pageable pageable);
    @Query("""
    SELECT COUNT(oi) > 0
    FROM OrderItem oi
    JOIN oi.order o
    WHERE oi.productVariant.product.id = :productId
    AND o.status IN ('PENDING', 'PAID', 'SHIPPING')
    """)
    boolean existsByProductIdAndActiveOrders(@Param("productId") String productId);
    @Query("""
    SELECT COALESCE(SUM(oi.quantity), 0)
    FROM OrderItem oi
    JOIN oi.order o
    WHERE o.status = 'COMPLETED'
    """)
    long getTotalProductsSold();
}
