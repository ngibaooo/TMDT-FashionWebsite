package com.tmdt.fashion_shop.service.product;
import com.tmdt.fashion_shop.dto.product.*;
import com.tmdt.fashion_shop.enums.ProductSize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    public Page<ProductDTO> getAllForUser(Pageable pageable);
    public Page<ProductDTO> getAllForAdmin(Pageable pageable);

    Page<ProductDTO> search(String keyword, Pageable pageable);

    Page<ProductDTO> getByCategory(String categoryId, Pageable pageable);

    ProductDetailDTO getById(String id);
    //user
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
//   admin
    public Page<ProductDetailDTO> filterForAdmin(
            Double minPrice,
            Double maxPrice,
            ProductSize productSize,
            String color,
            Pageable pageable
    );
}