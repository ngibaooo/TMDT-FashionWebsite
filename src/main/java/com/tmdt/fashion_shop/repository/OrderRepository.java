package com.tmdt.fashion_shop.repository;

import com.tmdt.fashion_shop.entity.Order;
import com.tmdt.fashion_shop.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {
    List<Order> findByUserId(String userId);
    List<Order> findByUserIdAndStatus(String userId, OrderStatus status);
    List<Order> findByStatus(OrderStatus status);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    @Query("""
        SELECT SUM(o.totalPrice)
        FROM Order o
        WHERE o.status = 'COMPLETED'
    """)
    Double getTotalRevenue();
//    @Query("""
//    SELECT COALESCE(SUM(o.totalPrice), 0)
//    FROM Order o
//    WHERE o.status = 'COMPLETED'
//    """)
//    double getTotalRevenue();

    @Query("""
    SELECT COUNT(o) > 0
    FROM Order o
    WHERE o.user.id = :userId
      AND o.status NOT IN ('COMPLETED', 'CANCELLED', 'FAILED')
    """)
    boolean existsActiveOrdersByUserId(String userId);
    @Query("""
    SELECT COUNT(o)
    FROM Order o
    WHERE o.status = 'COMPLETED'
    """)
    long getTotalOrders();

//    Get revenue by date
    @Query("""
    SELECT DATE(o.createdAt), COALESCE(SUM(o.totalPrice), 0)
    FROM Order o
    WHERE o.status = 'COMPLETED'
    AND o.createdAt BETWEEN :from AND :to
    GROUP BY DATE(o.createdAt)
    ORDER BY DATE(o.createdAt)
    """)
    List<Object[]> getRevenueByDate(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
//    Get revenue by month
    @Query("""
        SELECT MONTH(o.createdAt), SUM(o.totalPrice)
        FROM Order o
        WHERE o.status = 'COMPLETED'
        AND YEAR(o.createdAt) = :year
        GROUP BY MONTH(o.createdAt)
        ORDER BY MONTH(o.createdAt)
    """)
    List<Object[]> getRevenueByMonth(@Param("year") int year);
}
