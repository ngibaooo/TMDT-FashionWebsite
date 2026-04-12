package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.AddToCartRequestDTO;

public interface CartService {
    void addToCart(String userId, AddToCartRequestDTO request);
}
