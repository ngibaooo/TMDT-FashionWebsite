package com.tmdt.fashion_shop.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class ProductCreateRequestDTO {

    private String name;
    private String description;
    private double price;
    private Double oldPrice;
    private String categoryId;

    private List<MultipartFile> images;

    private List<VariantRequestDTO> variants;
}