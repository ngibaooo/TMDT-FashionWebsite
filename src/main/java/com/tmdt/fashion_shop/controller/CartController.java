package com.tmdt.fashion_shop.controller;

import com.tmdt.fashion_shop.dto.AddToCartRequestDTO;
import com.tmdt.fashion_shop.dto.CartUpdateRequestDTO;
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

    @GetMapping
    public ResponseEntity<?> getCart(Authentication authentication) {
        String userId = authentication.getName();

        return ResponseEntity.ok(cartService.getCart(userId));
    }
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @RequestBody AddToCartRequestDTO request,
            Authentication authentication
    ) {

        String userId = authentication.getName(); // lấy từ JWT

        cartService.addToCart(userId, request);
        return ResponseEntity.ok("Thêm vào giỏ hàng thành công");
    }
    @PutMapping("/update-quantity")
    public ResponseEntity<?> updateQuantity(
            @RequestBody CartUpdateRequestDTO request,
            Authentication authentication
    ) {
        String userId = authentication.getName();

        cartService.updateQuantity(request, userId);

        return ResponseEntity.ok(cartService.getCart(userId));
    }
    @DeleteMapping("/delete/{cartItemId}")
    public ResponseEntity<?> removeItem(
            @PathVariable String cartItemId,
            Authentication authentication
    ) {
        String userId = authentication.getName();

        cartService.removeItem(cartItemId, userId);

        // trả lại cart mới
        return ResponseEntity.ok(cartService.getCart(userId));
    }
}