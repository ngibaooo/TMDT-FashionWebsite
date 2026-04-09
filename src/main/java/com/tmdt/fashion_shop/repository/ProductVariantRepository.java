package com.tmdt.fashion_shop.repository;

import com.tmdt.fashion_shop.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, String> {

    List<ProductVariant> findByProduct_Id(String productId);

}
