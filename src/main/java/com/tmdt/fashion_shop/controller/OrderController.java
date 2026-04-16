package com.tmdt.fashion_shop.controller;

import com.tmdt.fashion_shop.dto.*;
import com.tmdt.fashion_shop.enums.OrderStatus;
import com.tmdt.fashion_shop.security.JWTService;
import com.tmdt.fashion_shop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final JWTService jwtService;

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody OrderRequestDTO request
    ) {

        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUsername(token);

        OrderResponseDTO response = orderService.createOrder(userId, request);

        return ResponseEntity.ok(response);
    }
    // User
    @GetMapping("/my-orders")
    public List<OrderDTO> getMyOrders(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "newest") String sort
    ) {
        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUsername(token);

        return orderService.getOrders(userId, status, sort);
    }

    // Admin
    @GetMapping
    public List<OrderDTO> getAllOrders() {
        return orderService.getAllOrders();
    }
    @GetMapping("/{orderId}")
    public OrderDetailDTO getOrderDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String orderId
    ) {
        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUsername(token);

        return orderService.getOrderDetail(userId, orderId);
    }
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody UpdateOrderStatusRequestDTO request
    ) {
        orderService.updateOrderStatus(orderId, request.getStatus());
        return ResponseEntity.ok("Cập nhật trạng thái thành công");
    }
}
