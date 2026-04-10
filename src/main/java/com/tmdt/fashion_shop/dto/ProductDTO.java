package com.tmdt.fashion_shop.dto;


import com.tmdt.fashion_shop.enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ProductDTO {

    private String id;
    private String name;
    private String description;
    private double price;
    private Double oldPrice;

    // chỉ lấy thông tin cần thiết từ category
    private String categoryId;
    private String categoryName;

    private ProductStatus status;
    private LocalDateTime createdAt;
    private List<String> images;
}
