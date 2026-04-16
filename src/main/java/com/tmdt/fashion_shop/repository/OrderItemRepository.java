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
    SELECT pv.product.id, pv.product.name, pv.product.price, SUM(oi.quantity)
    FROM OrderItem oi
    JOIN oi.productVariant pv
    GROUP BY pv.product.id, pv.product.name, pv.product.price
    ORDER BY SUM(oi.quantity) DESC
""")
    Page<Object[]> findBestSellingProducts(Pageable pageable);
    @Query("""
    SELECT COUNT(oi) > 0
    FROM OrderItem oi
    WHERE oi.productVariant.product.id = :productId
    AND oi.order.status IN ('PENDING', 'PAID', 'SHIPPING')
    """)
    boolean existsByProductIdAndActiveOrders(@Param("productId") String productId);
}
