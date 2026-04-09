package com.tmdt.fashion_shop.entity;

import com.tmdt.fashion_shop.enums.VoucherDiscountType;
import com.tmdt.fashion_shop.enums.VoucherStatus;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class Voucher {

    @Id
    private String id;

    private String code;

    @Enumerated(EnumType.STRING)
    private VoucherDiscountType discountType;

    private double discountValue;

    @Enumerated(EnumType.STRING)
    private VoucherStatus status;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private int quantity;
}