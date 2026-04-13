package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.OrderDTO;
import com.tmdt.fashion_shop.dto.OrderDetailDTO;
import com.tmdt.fashion_shop.dto.OrderRequestDTO;
import com.tmdt.fashion_shop.dto.OrderResponseDTO;

import java.util.List;

public interface OrderService {
    public OrderResponseDTO createOrder(String userId, OrderRequestDTO request);

    List<OrderDTO> getMyOrders(String userId);
    List<OrderDTO> getAllOrders();
    public OrderDetailDTO getOrderDetail(String userId, String orderId);
}
