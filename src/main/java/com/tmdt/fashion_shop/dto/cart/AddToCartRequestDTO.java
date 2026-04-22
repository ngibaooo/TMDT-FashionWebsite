package com.tmdt.fashion_shop.dto.cart;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddToCartRequestDTO {
    private String variantId;
    private int quantity;
}