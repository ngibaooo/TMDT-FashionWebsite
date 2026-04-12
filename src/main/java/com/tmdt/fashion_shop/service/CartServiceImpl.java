package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.AddToCartRequestDTO;
import com.tmdt.fashion_shop.entity.*;
import com.tmdt.fashion_shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    @Override
    public void addToCart(String userId, AddToCartRequestDTO request) {

        // validate
        if (request.getQuantity() <= 0) {
            throw new RuntimeException("Số lượng không hợp lệ");
        }

        // lấy user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // lấy hoặc tạo cart
        Cart cart = cartRepository.findByUser_Id(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setId(UUID.randomUUID().toString());
                    newCart.setUser(user);
                    newCart.setCreatedAt(LocalDateTime.now());
                    return cartRepository.save(newCart);
                });

        // lấy variant
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Variant không tồn tại"));

        // check tồn kho
        if (variant.getQuantity() < request.getQuantity()) {
            throw new RuntimeException("Không đủ hàng");
        }

        // check đã tồn tại trong cart chưa
        Optional<CartItem> existingItem =
                cartItemRepository.findByCart_IdAndProductVariant_Id(
                        cart.getId(),
                        variant.getId()
                );

        if (existingItem.isPresent()) {
            // đã có -> cộng thêm số lượng
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);

        } else {
            // chưa có -> tạo mới
            CartItem item = new CartItem();
            item.setId(UUID.randomUUID().toString());
            item.setCart(cart);
            item.setProductVariant(variant);
            item.setQuantity(request.getQuantity());

            cartItemRepository.save(item);
        }
    }
}