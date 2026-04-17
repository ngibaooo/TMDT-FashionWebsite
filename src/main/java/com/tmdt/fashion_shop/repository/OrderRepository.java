package com.tmdt.fashion_shop.repository;

import com.tmdt.fashion_shop.entity.Order;
import com.tmdt.fashion_shop.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {
    List<Order> findByUserId(String userId);
    List<Order> findByUserIdAndStatus(String userId, OrderStatus status);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    @Query("""
        SELECT SUM(o.totalPrice)
        FROM Order o
        WHERE o.status = 'COMPLETED'
    """)
    Double getTotalRevenue();
    @Query("""
    SELECT COUNT(o) > 0
    FROM Order o
    WHERE o.user.id = :userId
      AND o.status NOT IN ('COMPLETED', 'CANCELLED', 'FAILED')
    """)
    boolean existsActiveOrdersByUserId(String userId);
}
