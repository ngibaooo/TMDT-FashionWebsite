package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.ApplyVoucherResponseDTO;
import com.tmdt.fashion_shop.entity.Cart;
import com.tmdt.fashion_shop.entity.CartItem;
import com.tmdt.fashion_shop.entity.Voucher;
import com.tmdt.fashion_shop.enums.VoucherDiscountType;
import com.tmdt.fashion_shop.enums.VoucherStatus;
import com.tmdt.fashion_shop.repository.CartItemRepository;
import com.tmdt.fashion_shop.repository.CartRepository;
import com.tmdt.fashion_shop.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Override
    public ApplyVoucherResponseDTO applyVoucher(String userId, String code) {

        // sanitize input
        if (code == null || code.trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập mã voucher");
        }

        String normalizedCode = code.trim();

        Voucher voucher = voucherRepository.findByCodeCaseSensitive(normalizedCode)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));


        // check trạng thái
        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new RuntimeException("Voucher không hoạt động");
        }

        // check thời gian
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(voucher.getStartDate()) || now.isAfter(voucher.getEndDate())) {
            throw new RuntimeException("Voucher đã hết hạn");
        }

        // check số lượng
        if (voucher.getQuantity() <= 0) {
            throw new RuntimeException("Voucher đã hết lượt sử dụng");
        }

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

        // tính discount
        double discount;

        if (voucher.getDiscountType() == VoucherDiscountType.PERCENT) {
            discount = total * voucher.getDiscountValue() / 100;
        } else {
            discount = voucher.getDiscountValue();
        }
        if (voucher.getMinOrderValue() != null && total < voucher.getMinOrderValue()) {
            throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu");
        }
        if (voucher.getMaxDiscount() != null) {
            discount = Math.min(discount, voucher.getMaxDiscount());
        }
        // tránh âm / vượt quá
        discount = Math.min(discount, total);

        double finalPrice = total - discount;

        return new ApplyVoucherResponseDTO(total, discount, finalPrice);
    }
}
