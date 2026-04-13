package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.OrderRequestDTO;
import com.tmdt.fashion_shop.dto.OrderResponseDTO;

public interface OrderService {
    public OrderResponseDTO createOrder(String userId, OrderRequestDTO request);
}
