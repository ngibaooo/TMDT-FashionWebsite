package com.tmdt.fashion_shop.service;
import com.tmdt.fashion_shop.dto.BestSellingProductDTO;
import com.tmdt.fashion_shop.dto.ProductCreateRequestDTO;
import com.tmdt.fashion_shop.dto.ProductDTO;
import com.tmdt.fashion_shop.dto.ProductDetailDTO;
import com.tmdt.fashion_shop.enums.ProductSize;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    Page<ProductDTO> getAll(Pageable pageable);

    Page<ProductDTO> search(String keyword, Pageable pageable);

    Page<ProductDTO> getByCategory(String categoryId, Pageable pageable);

    ProductDetailDTO getById(String id);
    Page<ProductDetailDTO> filter(
            Double minPrice,
            Double maxPrice,
            ProductSize size,
            String color,
            Pageable pageable
    );
    Page<ProductDTO> getNewProducts(Pageable pageable);
    //admin
    Page<BestSellingProductDTO> getBestSellingProducts(Pageable pageable);
    //user
    Page<ProductDTO> getBestSellingProductsForUser(Pageable pageable);
    ProductDTO create(ProductCreateRequestDTO request);
}