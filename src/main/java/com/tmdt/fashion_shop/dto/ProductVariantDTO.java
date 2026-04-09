package com.tmdt.fashion_shop.dto;


import com.tmdt.fashion_shop.enums.ProductSize;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ProductVariantDTO {

    private String id;
    private ProductSize size;
    private String color;
    private int quantity;
}