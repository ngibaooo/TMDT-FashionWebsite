package com.tmdt.fashion_shop.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class CartDTO {
    private List<CartItemDTO> items;
    private double totalPrice;
}
