package com.tmdt.fashion_shop.repository;

import com.tmdt.fashion_shop.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, String> {
    List<OrderItem> findByOrder_Id(String orderId);
}
