package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.OrderRequestDTO;
import com.tmdt.fashion_shop.dto.OrderResponseDTO;
import com.tmdt.fashion_shop.entity.*;
import com.tmdt.fashion_shop.enums.OrderStatus;
import com.tmdt.fashion_shop.enums.PaymentMethod;
import com.tmdt.fashion_shop.enums.VoucherDiscountType;
import com.tmdt.fashion_shop.enums.VoucherStatus;
import com.tmdt.fashion_shop.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final VoucherRepository voucherRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final OrderVoucherRepository orderVoucherRepository;
    @Override
    @Transactional
    public OrderResponseDTO createOrder(String userId, OrderRequestDTO request) {

        // lấy cart
        Cart cart = cartRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Cart không tồn tại"));

        List<CartItem> items = cartItemRepository.findByCart_Id(cart.getId());

        if (items.isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống");
        }

        // tính tổng tiền
        double total = items.stream()
                .mapToDouble(i ->
                        i.getProductVariant().getProduct().getPrice() * i.getQuantity()
                )
                .sum();

        double discount = 0;
        Voucher voucher = null;

        // xử lý voucher
        if (request.getVoucherCode() != null && !request.getVoucherCode().isBlank()) {

            voucher = voucherRepository.findByCode(request.getVoucherCode())
                    .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

            if (voucher.getStatus() != VoucherStatus.ACTIVE) {
                throw new RuntimeException("Voucher không hoạt động");
            }

            LocalDateTime now = LocalDateTime.now();

            if (now.isBefore(voucher.getStartDate()) || now.isAfter(voucher.getEndDate())) {
                throw new RuntimeException("Voucher hết hạn");
            }

            if (voucher.getQuantity() <= 0) {
                throw new RuntimeException("Voucher đã hết lượt");
            }

            // tính giảm giá
            if (voucher.getDiscountType() == VoucherDiscountType.PERCENT) {
                discount = total * voucher.getDiscountValue() / 100;
            } else {
                discount = voucher.getDiscountValue();
            }

            if (discount > total) discount = total;

            // trừ lượt
            voucher.setQuantity(voucher.getQuantity() - 1);
            voucherRepository.save(voucher);
        }

        double finalPrice = total - discount;

        // tạo Order
        Order order = new Order();
        order.setId(UUID.randomUUID().toString());
        order.setUser(cart.getUser());
        order.setDeliveryAddress(request.getAddress());
        order.setPhone(request.getPhone());

        try {
            order.setPaymentMethod(
                    PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase())
            );
        } catch (Exception e) {
            throw new RuntimeException("Phương thức thanh toán không hợp lệ");
        }

        order.setTotalPrice(finalPrice);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        orderRepository.save(order);

        // LƯU ORDER_VOUCHER
        if (voucher != null) {
            OrderVoucher ov = new OrderVoucher();
            ov.setId(UUID.randomUUID().toString());
            ov.setOrder(order);
            ov.setVoucher(voucher);

            orderVoucherRepository.save(ov);
        }

        // tạo OrderItem + trừ kho
        for (CartItem item : items) {

            ProductVariant variant = item.getProductVariant();

            if (variant.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sản phẩm không đủ hàng");
            }

            // trừ kho
            variant.setQuantity(variant.getQuantity() - item.getQuantity());
            productVariantRepository.save(variant);

            // tạo order item
            OrderItem oi = new OrderItem();
            oi.setId(UUID.randomUUID().toString());
            oi.setOrder(order);
            oi.setProductVariant(variant);
            oi.setQuantity(item.getQuantity());
            oi.setPrice(variant.getProduct().getPrice());

            orderItemRepository.save(oi);
        }

        // xóa cart
        cartItemRepository.deleteAll(items);

        return new OrderResponseDTO(
                order.getId(),
                finalPrice,
                order.getStatus().name()
        );
    }
}
