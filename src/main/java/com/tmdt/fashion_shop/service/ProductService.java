package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.ProductDTO;
import com.tmdt.fashion_shop.dto.ProductDetailDTO;
import com.tmdt.fashion_shop.enums.ProductSize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    Page<ProductDTO> getAll(Pageable pageable);

    Page<ProductDTO> search(String keyword, Pageable pageable);

    Page<ProductDTO> getByCategory(String categoryId, Pageable pageable);

    ProductDetailDTO getById(String id);
    Page<ProductDTO> filter(
            Double minPrice,
            Double maxPrice,
            ProductSize size,
            String color,
            Pageable pageable
    );
}