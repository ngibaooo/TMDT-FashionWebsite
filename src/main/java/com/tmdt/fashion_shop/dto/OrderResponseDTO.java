package com.tmdt.fashion_shop.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class OrderResponseDTO {
    private String orderId;
    private double totalPrice;
    private String status;
}
