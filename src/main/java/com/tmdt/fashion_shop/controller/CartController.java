package com.tmdt.fashion_shop.controller;

import com.tmdt.fashion_shop.dto.AddToCartRequestDTO;
import com.tmdt.fashion_shop.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @RequestBody AddToCartRequestDTO request,
            Authentication authentication
    ) {

        String userId = authentication.getName(); // lấy từ JWT

        cartService.addToCart(userId, request);
        return ResponseEntity.ok("Thêm vào giỏ hàng thành công");
    }
}