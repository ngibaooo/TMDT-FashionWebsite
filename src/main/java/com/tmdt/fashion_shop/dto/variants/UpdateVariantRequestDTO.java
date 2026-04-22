package com.tmdt.fashion_shop.dto.variants;

import com.tmdt.fashion_shop.enums.ProductSize;
import lombok.Data;

@Data
public class UpdateVariantRequestDTO {
    private ProductSize size;
    private String color;
    private Integer quantity;
}