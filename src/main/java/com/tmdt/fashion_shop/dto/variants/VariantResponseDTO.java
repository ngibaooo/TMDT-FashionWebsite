package com.tmdt.fashion_shop.dto.variants;

import com.tmdt.fashion_shop.enums.ProductSize;
import com.tmdt.fashion_shop.enums.VariantStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VariantResponseDTO {
    private String id;
    private String productId;
    private String productName;
    private String color;
    private ProductSize size;
    private int quantity;
    private VariantStatus status;
    private String image;
}