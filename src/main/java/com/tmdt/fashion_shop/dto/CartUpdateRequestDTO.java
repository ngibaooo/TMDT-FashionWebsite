package com.tmdt.fashion_shop.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartUpdateRequestDTO {
    private String cartItemId;
    private String action; // INCREASE | DECREASE
}