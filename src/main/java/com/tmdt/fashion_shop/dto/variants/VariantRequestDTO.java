package com.tmdt.fashion_shop.dto.variants;

import com.tmdt.fashion_shop.enums.ProductSize;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class VariantRequestDTO {

    private ProductSize size;
    private String color;
    private int quantity;

    private List<MultipartFile> images; // ảnh riêng variant
}
