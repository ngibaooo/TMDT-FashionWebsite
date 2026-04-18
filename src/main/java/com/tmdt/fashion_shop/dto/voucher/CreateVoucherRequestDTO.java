package com.tmdt.fashion_shop.dto.voucher;

import com.tmdt.fashion_shop.enums.VoucherDiscountType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateVoucherRequestDTO {

    private String code;
    private VoucherDiscountType discountType; // PERCENT / AMOUNT
    private Double discountValue;

    private Double minOrderValue;
    private Double maxDiscount;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Integer quantity;
}