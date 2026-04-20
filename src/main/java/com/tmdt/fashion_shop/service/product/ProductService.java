package com.tmdt.fashion_shop.service.product;
import com.tmdt.fashion_shop.dto.product.*;
import com.tmdt.fashion_shop.enums.ProductSize;
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
            ProductSize productSize,
            String color,
            Pageable pageable
    );
    Page<ProductDTO> getNewProducts(Pageable pageable);
    //admin
    Page<BestSellingProductDTO> getBestSellingProducts(Pageable pageable);
    //user
    Page<ProductDTO> getBestSellingProductsForUser(Pageable pageable);
    ProductDTO create(ProductCreateRequestDTO request);
    public ProductDTO update(String id, ProductUpdateRequestDTO request);
    public void deleteProduct(String productId);
    public void restoreProduct(String productId);
}