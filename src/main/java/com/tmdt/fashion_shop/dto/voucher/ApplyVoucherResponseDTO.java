package com.tmdt.fashion_shop.dto.voucher;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ApplyVoucherResponseDTO {
    private double originalPrice;
    private double discount;
    private double finalPrice;
}
