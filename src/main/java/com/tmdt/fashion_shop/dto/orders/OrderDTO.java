    package com.tmdt.fashion_shop.dto.orders;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class OrderDTO {
    private String id;
    private double totalPrice;
    private String status;
    private String phone;
    private String deliveryAddress;
    private String paymentMethod;
    private LocalDateTime createdAt;
}