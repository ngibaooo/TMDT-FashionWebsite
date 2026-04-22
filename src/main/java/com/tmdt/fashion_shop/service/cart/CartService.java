package com.tmdt.fashion_shop.service.cart;

import com.tmdt.fashion_shop.dto.cart.AddToCartRequestDTO;
import com.tmdt.fashion_shop.dto.cart.CartDTO;
import com.tmdt.fashion_shop.dto.cart.CartUpdateRequestDTO;

public interface CartService {
    public CartDTO getCart(String userId);
    public void addToCart(String userId, AddToCartRequestDTO request);
    public void updateQuantity(CartUpdateRequestDTO request, String userId);
    public void removeItem(String cartItemId, String userId);
}
