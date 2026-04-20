package com.tmdt.fashion_shop.service.product;

import com.tmdt.fashion_shop.dto.product.*;
import com.tmdt.fashion_shop.dto.variants.ProductVariantDTO;
import com.tmdt.fashion_shop.dto.variants.VariantRequestDTO;
import com.tmdt.fashion_shop.entity.Category;
import com.tmdt.fashion_shop.entity.Product;
import com.tmdt.fashion_shop.entity.ProductImage;
import com.tmdt.fashion_shop.entity.ProductVariant;
import com.tmdt.fashion_shop.enums.ProductSize;
import com.tmdt.fashion_shop.enums.ProductStatus;
import com.tmdt.fashion_shop.enums.VariantStatus;
import com.tmdt.fashion_shop.filter.ProductSpecification;
import com.tmdt.fashion_shop.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductVariantRepository productVariantRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private ProductImageRepository productImageRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    private String saveFile(MultipartFile file) {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        Path path = Paths.get("uploads/" + fileName);

        try {
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Upload failed");
        }

        return "/uploads/" + fileName;
    }
    // mapping function

    private ProductDetailDTO toDetailDTO(Product product) {

        ProductDetailDTO dto = new ProductDetailDTO();

        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setOldPrice(product.getOldPrice());
        dto.setStatus(product.getStatus());

        if (product.getCategory() != null) {
            dto.setCategoryName(product.getCategory().getName());
        }
        dto.setImages(
                product.getImages().stream()
                        .map(img -> img.getImageUrl())
                        .toList()
        );
        dto.setVariants(
                product.getVariants().stream()
                        .filter(v -> v.getStatus() == VariantStatus.ACTIVE)
                        .map(v -> {

                    ProductVariantDTO vd = new ProductVariantDTO();
                    vd.setId(v.getId());
                    vd.setSize(v.getSize());
                    vd.setColor(v.getColor());
                    vd.setQuantity(v.getQuantity());

                    vd.setImages(
                            v.getImages().stream()
                                    .map(img -> img.getImageUrl())
                                    .toList()
                    );

                    return vd;
                }).toList()
        );

        return dto;
    }
    private ProductDTO toDTO(Product p) {
        List<String> imageUrls = null;

        if (p.getImages() != null) {
            imageUrls = p.getImages()
                    .stream()
                    .map(img -> img.getImageUrl())
                    .toList();
        }
        return new ProductDTO(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getOldPrice(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getStatus(),
                p.getCreatedAt(),
                imageUrls
        );
    }

    @Override
    public Page<ProductDTO> getAllForUser(Pageable pageable) {
        return productRepository.findByStatus(ProductStatus.ACTIVE, pageable)
                .map(this::toDTO); //convert
    }
    @Override
    public Page<ProductDTO> getAllForAdmin(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(this::toDTO);
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

//    user
    @Override
    public Page<ProductDetailDTO> filter(Double minPrice,
                                   Double maxPrice,
                                   ProductSize productSize,
                                   String color,
                                   Pageable pageable) {

        return productRepository.findAll(
                ProductSpecification.filter(minPrice, maxPrice, productSize, color)
                        .and(ProductSpecification.hasStatus(ProductStatus.ACTIVE)),
                pageable
        ).map(this::toDetailDTO);
    }
    @Override
    public Page<ProductDetailDTO> filterForAdmin(
            Double minPrice,
            Double maxPrice,
            ProductSize productSize,
            String color,
            Pageable pageable
    ) {
        return productRepository.findAll(
                ProductSpecification.filter(minPrice, maxPrice, productSize, color)
                        .and(ProductSpecification.hasStatus(ProductStatus.ACTIVE)),
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
    @Transactional
    @Override
    public ProductDTO create(ProductCreateRequestDTO request) {

        // 1. CREATE PRODUCT
        Product product = new Product();
        product.setId(UUID.randomUUID().toString());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setOldPrice(request.getOldPrice());
        product.setCreatedAt(LocalDateTime.now());
        product.setStatus(ProductStatus.ACTIVE);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setCategory(category);
        productRepository.save(product);

        // 2. SAVE PRODUCT IMAGES
        if (request.getImages() != null) {
            for (MultipartFile file : request.getImages()) {
                String url = saveFile(file);

                ProductImage img = new ProductImage();
                img.setId(UUID.randomUUID().toString());
                img.setProduct(product);
                img.setImageUrl(url);

                productImageRepository.save(img);
            }
        }

        // 3. CREATE VARIANTS
        if (request.getVariants() != null) {
            for (VariantRequestDTO vReq : request.getVariants()) {

                ProductVariant variant = new ProductVariant();
                variant.setId(UUID.randomUUID().toString());
                variant.setProduct(product);
                variant.setSize(vReq.getSize());
                variant.setColor(vReq.getColor());
                variant.setQuantity(vReq.getQuantity());

                productVariantRepository.save(variant);

                // 4. SAVE VARIANT IMAGES
                if (vReq.getImages() != null) {
                    for (MultipartFile file : vReq.getImages()) {

                        String url = saveFile(file);

                        ProductImage img = new ProductImage();
                        img.setId(UUID.randomUUID().toString());
                        img.setProductVariant(variant);
                        img.setImageUrl(url);

                        productImageRepository.save(img);
                    }
                }
            }
        }

        // 5. RETURN DETAIL
        Product saved = productRepository.findById(product.getId()).get();
        return toDTO(saved);
    }
    @Override
    @Transactional
    public ProductDTO update(String id, ProductUpdateRequestDTO request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product không tồn tại"));

        // ===== UPDATE INFO =====
        if (request.getName() != null) {
            product.setName(request.getName());
        }

        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            if (request.getPrice() <= 0) {
                throw new RuntimeException("Price phải > 0");
            }
            product.setPrice(request.getPrice());
        }

        if (request.getOldPrice() != null) {
            product.setOldPrice(request.getOldPrice());
        }

        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category không tồn tại"));
            product.setCategory(category);
        }

        if (request.getImages() != null && !request.getImages().isEmpty()) {

            // XÓA ảnh cũ
            productImageRepository.deleteAll(product.getImages());

            // ADD ảnh mới
            for (MultipartFile file : request.getImages()) {
                String url = saveFile(file);

                ProductImage img = new ProductImage();
                img.setId(UUID.randomUUID().toString());
                img.setProduct(product);
                img.setImageUrl(url);

                productImageRepository.save(img);
            }
        }

        productRepository.save(product);

        return toDTO(product);
    }
    @Override
    @Transactional
    public void deleteProduct(String productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product không tồn tại"));

        // đã inactive rồi
        if (product.getStatus() == ProductStatus.INACTIVE) {
            throw new RuntimeException("Sản phẩm đã bị xóa trước đó");
        }

        // check sản phẩm đang nằm trong đơn chưa hoàn tất
        boolean isUsed = orderItemRepository.existsByProductIdAndActiveOrders(productId);

        if (isUsed) {
            throw new RuntimeException("Không thể xóa sản phẩm đang có trong đơn hàng");
        }

        // soft delete
        product.setStatus(ProductStatus.INACTIVE);

        productRepository.save(product);
    }
    @Override
    @Transactional
    public void restoreProduct(String productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product không tồn tại"));

        // nếu đang active rồi thì không cần mở
        if (product.getStatus() == ProductStatus.ACTIVE) {
            throw new RuntimeException("Sản phẩm đang hoạt động");
        }
        // nếu không phải INACTIVE thì không cho restore
        if (product.getStatus() != ProductStatus.INACTIVE) {
            throw new RuntimeException("Chỉ có thể khôi phục sản phẩm INACTIVE");
        }
        // mở lại
        product.setStatus(ProductStatus.ACTIVE);

        productRepository.save(product);
    }
}
