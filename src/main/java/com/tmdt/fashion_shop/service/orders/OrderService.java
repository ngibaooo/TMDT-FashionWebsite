package com.tmdt.fashion_shop.service.orders;

import com.tmdt.fashion_shop.dto.orders.OrderDTO;
import com.tmdt.fashion_shop.dto.orders.OrderDetailDTO;
import com.tmdt.fashion_shop.dto.orders.OrderRequestDTO;
import com.tmdt.fashion_shop.dto.orders.OrderResponseDTO;

import java.util.List;
import java.util.Map;

public interface OrderService {
    public OrderResponseDTO createOrder(String userId, OrderRequestDTO request);

    List<OrderDTO> getMyOrders(String userId);
    List<OrderDTO> getAllOrders();
    public OrderDetailDTO getOrderDetail(String userId, String orderId);
    List<OrderDTO> getOrders(String userId, String status, String sort);
    void updateOrderStatus(String orderId, String status);
    public List<OrderDTO> getOrdersForAdmin(String status, String sort);
    public Map<String, Long> getOrderStatusSummary();
}
