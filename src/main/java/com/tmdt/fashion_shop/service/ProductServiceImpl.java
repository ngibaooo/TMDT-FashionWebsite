package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.ProductDTO;
import com.tmdt.fashion_shop.dto.ProductDetailDTO;
import com.tmdt.fashion_shop.dto.ProductVariantDTO;
import com.tmdt.fashion_shop.entity.Product;
import com.tmdt.fashion_shop.enums.ProductSize;
import com.tmdt.fashion_shop.enums.ProductStatus;
import com.tmdt.fashion_shop.filter.ProductSpecification;
import com.tmdt.fashion_shop.repository.ProductRepository;
import com.tmdt.fashion_shop.repository.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;

import java.util.List;


@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductVariantRepository productVariantRepository;

    // mapping function
    private ProductDTO toDTO(Product p) {
        return new ProductDTO(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getOldPrice(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getStatus(),
                p.getCreatedAt()
        );
    }

    @Override
    public Page<ProductDTO> getAll(Pageable pageable) {
        return productRepository.findByStatus(ProductStatus.ACTIVE, pageable)
                .map(this::toDTO); //convert
    }

    @Override
    public Page<ProductDTO> search(String keyword, Pageable pageable) {
        return productRepository.search(keyword, pageable)
                .map(this::toDTO);
    }

    @Override
    public Page<ProductDTO> getByCategory(String categoryId, Pageable pageable) {
        return productRepository.findByCategory_Id(categoryId, pageable)
                .map(this::toDTO);
    }

    @Override
    public ProductDetailDTO getById(String id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // lấy variant
        List<ProductVariantDTO> variants = productVariantRepository
                .findByProduct_Id(id)
                .stream()
                .map(v -> new ProductVariantDTO(
                        v.getId(),
                        v.getSize(),
                        v.getColor(),
                        v.getQuantity()
                ))
                .toList();

        return new ProductDetailDTO(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getOldPrice(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getStatus(),
                p.getCreatedAt(),
                variants
        );
    }

    @Override
    public Page<ProductDTO> filter(Double minPrice,
                                   Double maxPrice,
                                   ProductSize size,
                                   String color,
                                   Pageable pageable) {

        return productRepository.findAll(
                ProductSpecification.filter(minPrice, maxPrice, size, color),
                pageable
        ).map(this::toDTO);
    }
}
