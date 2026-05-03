package com.tmdt.fashion_shop.controller;

import com.tmdt.fashion_shop.dto.orders.*;
import com.tmdt.fashion_shop.security.JWTService;
import com.tmdt.fashion_shop.service.orders.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
//    @GetMapping("/admin")
//    @PreAuthorize("hasRole('ADMIN')")
//    public List<OrderDTO> getOrdersByStatusForAdmin(
//            @RequestParam(required = false) String status,
//            @RequestParam(required = false, defaultValue = "newest") String sort
//    ) {
//        return orderService.getOrdersForAdmin(status, sort);
//    }
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<OrderDTO> getOrdersByStatusForAdmin(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {

        Sort sorting = switch (sort) {
            case "price_asc" -> Sort.by("totalPrice").ascending();
            case "price_desc" -> Sort.by("totalPrice").descending();
            case "oldest" -> Sort.by("createdAt").ascending();
            default -> Sort.by("createdAt").descending(); // newest
        };

        Pageable pageable = PageRequest.of(page, size, sorting);

        return orderService.getOrdersForAdmin(status, sort, pageable);
    }

    // Admin
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
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
    @GetMapping("/admin/status-summary")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Long> getOrderStatusSummary() {
        return orderService.getOrderStatusSummary();
    }
}
