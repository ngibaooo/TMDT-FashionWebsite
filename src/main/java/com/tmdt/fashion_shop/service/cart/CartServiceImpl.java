package com.tmdt.fashion_shop.service.cart;

import com.tmdt.fashion_shop.dto.cart.AddToCartRequestDTO;
import com.tmdt.fashion_shop.dto.cart.CartDTO;
import com.tmdt.fashion_shop.dto.cart.CartItemDTO;
import com.tmdt.fashion_shop.dto.cart.CartUpdateRequestDTO;
import com.tmdt.fashion_shop.entity.*;
import com.tmdt.fashion_shop.enums.ProductStatus;
import com.tmdt.fashion_shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
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
    public CartDTO getCart(String userId) {

        Cart cart = cartRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Cart không tồn tại"));

        List<CartItem> items = cartItemRepository.findByCart_Id(cart.getId());

        List<CartItemDTO> itemDTOs = items.stream().filter(item -> item.getProductVariant() != null).map(item -> {

            var variant = item.getProductVariant();
            var product = variant.getProduct();

            String image = null;

            if (variant.getImages() != null && !variant.getImages().isEmpty()) {
                image = variant.getImages().get(0).getImageUrl();
            }
            // fallback ảnh product
            else if (product.getImages() != null && !product.getImages().isEmpty()) {
                image = product.getImages().get(0).getImageUrl();
            }

            double price = product.getPrice();
            int quantity = item.getQuantity();

            return new CartItemDTO(
                    item.getId(),
                    product.getName(),
                    image,
                    price,
                    quantity,
                    variant.getSize().name(),
                    variant.getColor(),
                    price * quantity
            );

        }).toList();

        double totalPrice = itemDTOs.stream()
                .mapToDouble(CartItemDTO::getTotal)
                .sum();

        return new CartDTO(itemDTOs, totalPrice);
    }
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

        Product product = variant.getProduct();
        // không cho thêm nếu product không active
        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new RuntimeException("Sản phẩm không khả dụng");
        }
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

    @Override
    public void updateQuantity(CartUpdateRequestDTO request, String userId) {

        Cart cart = cartRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Cart không tồn tại"));

        CartItem item = cartItemRepository.findById(request.getCartItemId())
                .orElseThrow(() -> new RuntimeException("Item không tồn tại"));

        // check item thuộc cart của user
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Không hợp lệ");
        }

        int currentQty = item.getQuantity();

        // xử lý action
        if ("INCREASE".equalsIgnoreCase(request.getAction())) {

            // check tồn kho
            int stock = item.getProductVariant().getQuantity();

            if (currentQty + 1 > stock) {
                throw new RuntimeException("Đã đạt số lượng tối đa");
            }

            item.setQuantity(currentQty + 1);

        } else if ("DECREASE".equalsIgnoreCase(request.getAction())) {

            if (currentQty - 1 <= 0) {
                // nếu giảm về 0 -> xóa luôn
                cartItemRepository.delete(item);
                return;
            }

            item.setQuantity(currentQty - 1);

        } else {
            throw new RuntimeException("Action không hợp lệ");
        }

        cartItemRepository.save(item);
    }
    @Override
    public void removeItem(String cartItemId, String userId) {

        // lấy cart của user
        Cart cart = cartRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Cart không tồn tại"));

        // lấy item
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Item không tồn tại"));

        // check item có thuộc cart của user không
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Không có quyền xóa item này");
        }

        // xóa
        cartItemRepository.delete(item);
    }
}