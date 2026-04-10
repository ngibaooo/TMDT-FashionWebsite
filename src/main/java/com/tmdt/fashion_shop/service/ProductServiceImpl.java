package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.BestSellingProductDTO;
import com.tmdt.fashion_shop.dto.ProductDTO;
import com.tmdt.fashion_shop.dto.ProductDetailDTO;
import com.tmdt.fashion_shop.dto.ProductVariantDTO;
import com.tmdt.fashion_shop.entity.Product;
import com.tmdt.fashion_shop.enums.ProductSize;
import com.tmdt.fashion_shop.enums.ProductStatus;
import com.tmdt.fashion_shop.filter.ProductSpecification;
import com.tmdt.fashion_shop.repository.OrderItemRepository;
import com.tmdt.fashion_shop.repository.ProductRepository;
import com.tmdt.fashion_shop.repository.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;


@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductVariantRepository productVariantRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;

    // mapping function

    private ProductDetailDTO toDetailDTO(Product product) {

        ProductDetailDTO dto = new ProductDetailDTO();

        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setOldPrice(product.getOldPrice());

        if (product.getCategory() != null) {
            dto.setCategoryName(product.getCategory().getName());
        }

        dto.setVariants(
                product.getVariants().stream().map(v -> {
                    ProductVariantDTO vd = new ProductVariantDTO();
                    vd.setId(v.getId());
                    vd.setSize(ProductSize.valueOf(v.getSize().name()));
                    vd.setColor(v.getColor());
                    vd.setQuantity(v.getQuantity());
                    return vd;
                }).toList()
        );

        return dto;
    }
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

        return toDetailDTO(p);
    }

    @Override
    public Page<ProductDetailDTO> filter(Double minPrice,
                                   Double maxPrice,
                                   ProductSize size,
                                   String color,
                                   Pageable pageable) {

        return productRepository.findAll(
                ProductSpecification.filter(minPrice, maxPrice, size, color),
                pageable
        ).map(this::toDetailDTO);
    }
    @Override
    public Page<ProductDTO> getNewProducts(Pageable pageable) {
        return productRepository
                .findByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE, pageable)
                .map(this::toDTO);
    }
    @Override
    public Page<BestSellingProductDTO> getBestSellingProducts(Pageable pageable) {

        return orderItemRepository.findBestSellingProducts(pageable)
                .map(obj -> new BestSellingProductDTO(
                        (String) obj[0],   // id
                        (String) obj[1],   // name
                        (Double) obj[2],   // price
                        (Long) obj[3]      // totalSold
                ));
    }

    @Override
    public Page<ProductDTO> getBestSellingProductsForUser(Pageable pageable) {

        Page<Object[]> result = orderItemRepository.findBestSellingProducts(pageable);

        List<String> productIds = result.getContent().stream()
                .map(r -> (String) r[0])
                .toList();

        List<Product> products = productRepository.findAllById(productIds);

        // giữ đúng thứ tự best-selling
        Map<String, Product> map = products.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        List<ProductDTO> dtoList = productIds.stream()
                .map(map::get)
                .filter(Objects::nonNull)
                .map(this::toDTO)
                .toList();

        return new PageImpl<>(dtoList, pageable, result.getTotalElements());
    }
}
