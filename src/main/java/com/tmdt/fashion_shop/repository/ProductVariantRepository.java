package com.tmdt.fashion_shop.repository;

import com.tmdt.fashion_shop.entity.ProductVariant;
import com.tmdt.fashion_shop.enums.ProductSize;
import com.tmdt.fashion_shop.enums.VariantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, String>, JpaSpecificationExecutor<ProductVariant> {

    Page<ProductVariant> findByProduct_Id(String productId, Pageable pageable);
    Optional<ProductVariant> findByIdAndStatus(String id, VariantStatus status);
    boolean existsByProduct_IdAndSizeAndColor(
            String productId,
            ProductSize size,
            String color
    );
}
