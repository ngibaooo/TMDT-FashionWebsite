package com.tmdt.fashion_shop.dto.voucher;

import com.tmdt.fashion_shop.enums.VoucherDiscountType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VoucherDTO {

    private String code;
    private VoucherDiscountType discountType;
    private double discountValue;
}