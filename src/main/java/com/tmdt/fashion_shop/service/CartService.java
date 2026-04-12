package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.AddToCartRequestDTO;
import com.tmdt.fashion_shop.dto.CartDTO;
import com.tmdt.fashion_shop.dto.CartUpdateRequestDTO;

public interface CartService {
    public CartDTO getCart(String userId);
    public void addToCart(String userId, AddToCartRequestDTO request);
    public void updateQuantity(CartUpdateRequestDTO request, String userId);
    public void removeItem(String cartItemId, String userId);
}
