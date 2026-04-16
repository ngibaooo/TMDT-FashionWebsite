package com.tmdt.fashion_shop.dto.cart;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CartItemDTO {
    private String cartItemId;
    private String productName;
    private String image;
    private double price;
    private int quantity;
    private String size;
    private String color;
    private double total;
}
