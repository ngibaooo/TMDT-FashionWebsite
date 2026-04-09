package com.tmdt.fashion_shop.repository;

import com.tmdt.fashion_shop.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, String> {
    List<CartItem> findByCart_Id(String cartId);
    Optional<CartItem> findByCart_IdAndProductVariant_Id(String cartId, String variantId);
}