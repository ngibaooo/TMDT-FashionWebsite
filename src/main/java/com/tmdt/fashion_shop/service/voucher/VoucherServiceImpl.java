package com.tmdt.fashion_shop.service.voucher;

import com.tmdt.fashion_shop.dto.voucher.*;
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
    @Override
    public List<GetVoucherDTO> getAllVouchers() {
        return voucherRepository.findAll().stream()
                .map(v -> new GetVoucherDTO(
                        v.getId(),
                        v.getCode(),
                        v.getDiscountType().name(),
                        v.getDiscountValue(),
                        v.getMinOrderValue(),
                        v.getMaxDiscount(),
                        v.getStatus().name(),
                        v.getStartDate(),
                        v.getEndDate(),
                        v.getQuantity()
                ))
                .toList();
    }
    @Override
    public void createVoucher(CreateVoucherRequestDTO request) {

        // ===== VALIDATE CODE =====
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            throw new RuntimeException("Code không được để trống");
        }

        String code = request.getCode().trim().toUpperCase();

        if (voucherRepository.findByCode(code).isPresent()) {
            throw new RuntimeException("Voucher đã tồn tại");
        }

        // ===== VALIDATE DISCOUNT =====
        if (request.getDiscountValue() == null || request.getDiscountValue() <= 0) {
            throw new RuntimeException("Giá trị giảm phải > 0");
        }

        if (request.getDiscountType() == VoucherDiscountType.PERCENT &&
                request.getDiscountValue() > 100) {
            throw new RuntimeException("Giảm % không được > 100");
        }

        // ===== VALIDATE MIN/MAX =====
        if (request.getMinOrderValue() != null && request.getMinOrderValue() < 0) {
            throw new RuntimeException("Min order phải >= 0");
        }

        if (request.getMaxDiscount() != null && request.getMaxDiscount() < 0) {
            throw new RuntimeException("Max discount phải >= 0");
        }

        // ===== VALIDATE TIME =====
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new RuntimeException("Phải nhập thời gian bắt đầu và kết thúc");
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new RuntimeException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        // ===== VALIDATE QUANTITY =====
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException("Số lượng phải > 0");
        }

        // ===== CREATE =====
        Voucher voucher = new Voucher();
        voucher.setId(java.util.UUID.randomUUID().toString());
        voucher.setCode(code);

        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());

        voucher.setMinOrderValue(request.getMinOrderValue());
        voucher.setMaxDiscount(request.getMaxDiscount());

        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());

        voucher.setQuantity(request.getQuantity());
        voucher.setStatus(VoucherStatus.ACTIVE);

        // nếu không dùng @PrePersist
        voucher.setStartDate(LocalDateTime.now());

        voucherRepository.save(voucher);
    }
    @Override
    public void updateVoucher(String id, UpdateVoucherRequestDTO request) {

        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        // ===== CODE =====
        if (request.getCode() != null) {
            if (request.getCode().trim().isEmpty()) {
                throw new RuntimeException("Code không được để trống");
            }
            voucher.setCode(request.getCode().trim());
        }

        // DISCOUNT TYPE
        if (request.getDiscountType() != null) {
            voucher.setDiscountType(request.getDiscountType());
        }

        // DISCOUNT VALUE
        if (request.getDiscountValue() != null) {

            if (request.getDiscountValue() <= 0) {
                throw new RuntimeException("Giá trị giảm phải > 0");
            }

            if (request.getDiscountType() == VoucherDiscountType.PERCENT
                    && request.getDiscountValue() > 100) {
                throw new RuntimeException("Voucher % không được > 100%");
            }

            voucher.setDiscountValue(request.getDiscountValue());
        }

        // MIN ORDER
        if (request.getMinOrderValue() != null) {
            voucher.setMinOrderValue(request.getMinOrderValue());
        }

        // MAX DISCOUNT
        if (request.getMaxDiscount() != null) {
            voucher.setMaxDiscount(request.getMaxDiscount());
        }

        // STATUS
        if (request.getStatus() != null) {
            voucher.setStatus(request.getStatus());
        }

        // DATE
        if (request.getStartDate() != null) {
            voucher.setStartDate(request.getStartDate());
        }

        if (request.getEndDate() != null) {
            voucher.setEndDate(request.getEndDate());
        }

        if (voucher.getStartDate() != null && voucher.getEndDate() != null) {
            if (voucher.getEndDate().isBefore(voucher.getStartDate())) {
                throw new RuntimeException("Ngày kết thúc phải sau ngày bắt đầu");
            }
        }

        // QUANTITY
        if (request.getQuantity() != null) {
            if (request.getQuantity() < 0) {
                throw new RuntimeException("Số lượng không hợp lệ");
            }
            voucher.setQuantity(request.getQuantity());
        }

        voucherRepository.save(voucher);
    }
    @Override
    public void disableVoucher(String id) {

        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        // ===== VALIDATE =====

        if (voucher.getStatus() == VoucherStatus.INACTIVE) {
            throw new RuntimeException("Voucher đã bị vô hiệu hóa trước đó");
        }

        // ===== UPDATE =====
        voucher.setStatus(VoucherStatus.INACTIVE);

        voucherRepository.save(voucher);
    }
    @Override
    public void enableVoucher(String id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        if (voucher.getStatus() == VoucherStatus.ACTIVE) {
            throw new RuntimeException("Voucher vẫn đang hoạt động");
        }
        voucher.setStatus(VoucherStatus.ACTIVE);
        voucherRepository.save(voucher);
    }
}
