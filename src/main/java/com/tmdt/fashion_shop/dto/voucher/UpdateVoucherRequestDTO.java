package com.tmdt.fashion_shop.dto.voucher;

import com.tmdt.fashion_shop.enums.VoucherDiscountType;
import com.tmdt.fashion_shop.enums.VoucherStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateVoucherRequestDTO {

    private String code;
    private VoucherDiscountType discountType;
    private Double discountValue;

    private Double minOrderValue;
    private Double maxDiscount;

    private VoucherStatus status;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Integer quantity;
}