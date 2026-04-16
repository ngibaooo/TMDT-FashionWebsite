package com.tmdt.fashion_shop.dto.product;

import com.tmdt.fashion_shop.enums.ProductStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class ProductUpdateRequestDTO {

    private String name;
    private String description;
    private Double price;
    private Double oldPrice;
    private String categoryId;
    private ProductStatus status;

    private List<MultipartFile> images;
}