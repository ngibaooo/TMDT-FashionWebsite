package com.tmdt.fashion_shop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OrderItemDTO {
    private String productName;
    private String image;
    private String size;
    private String color;
    private int quantity;
    private double price;
}