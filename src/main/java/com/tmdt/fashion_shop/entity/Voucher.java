package com.tmdt.fashion_shop.entity;

import com.tmdt.fashion_shop.enums.VoucherDiscountType;
import com.tmdt.fashion_shop.enums.VoucherStatus;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class Voucher {

    @Id
    private String id;

    private String code;

    @Enumerated(EnumType.STRING)
    private VoucherDiscountType discountType;

    private double discountValue;
    private Double minOrderValue; //điều kiện giá trị tối thiểu của đơn hàng để dùng voucher
    private Double maxDiscount; //giới hạn giảm giá (giảm cao nhất là bao nhiêu) chủ yếu cho voucher %
                                // - khong cần cho voucher giảm cố định như 50k 100k

    @Enumerated(EnumType.STRING)
    private VoucherStatus status;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private int quantity;
}