package com.tmdt.fashion_shop.dto.orders;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderRequestDTO {
    private String address;
    private String phone;
    private String paymentMethod; // COD
    private String voucherCode;   // optional
}
