package com.tmdt.fashion_shop.dto;


import com.tmdt.fashion_shop.enums.ProductSize;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ProductVariantDTO {

    private String id;
    private ProductSize size;
    private String color;
    private int quantity;
    private List<String> images;
    public ProductVariantDTO() {}
}