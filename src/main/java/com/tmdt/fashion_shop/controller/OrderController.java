package com.tmdt.fashion_shop.controller;

import com.tmdt.fashion_shop.dto.OrderRequestDTO;
import com.tmdt.fashion_shop.dto.OrderResponseDTO;
import com.tmdt.fashion_shop.security.JWTService;
import com.tmdt.fashion_shop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
