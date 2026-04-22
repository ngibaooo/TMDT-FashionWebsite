package com.tmdt.fashion_shop.dto.product;

import com.tmdt.fashion_shop.dto.variants.ProductVariantDTO;
import com.tmdt.fashion_shop.enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ProductDetailDTO {

    private String id;
    private String name;
    private String description;
    private double price;
    private Double oldPrice;

    private String categoryId;
    private String categoryName;

    private ProductStatus status;
    private LocalDateTime createdAt;

    private List<ProductVariantDTO> variants;
    private List<String> images;
    public ProductDetailDTO(){}
}