package com.tmdt.fashion_shop.repository;

import com.tmdt.fashion_shop.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductImageRepository extends JpaRepository<ProductImage, String> {
}