package com.tmdt.fashion_shop.dto.voucher;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class GetVoucherDTO {
    private String id;
    private String code;
    private String discountType;
    private double discountValue;
    private Double minOrderValue;
    private Double maxDiscount;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private int quantity;
}