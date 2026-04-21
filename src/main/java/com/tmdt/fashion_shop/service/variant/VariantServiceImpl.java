package com.tmdt.fashion_shop.service.variant;

import com.tmdt.fashion_shop.dto.variants.UpdateVariantRequestDTO;
import com.tmdt.fashion_shop.dto.variants.VariantResponseDTO;
import com.tmdt.fashion_shop.entity.Product;
import com.tmdt.fashion_shop.entity.ProductImage;
import com.tmdt.fashion_shop.entity.ProductVariant;
import com.tmdt.fashion_shop.enums.ProductSize;
import com.tmdt.fashion_shop.enums.ProductStatus;
import com.tmdt.fashion_shop.enums.VariantStatus;
import com.tmdt.fashion_shop.repository.ProductImageRepository;
import com.tmdt.fashion_shop.repository.ProductRepository;
import com.tmdt.fashion_shop.repository.ProductVariantRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VariantServiceImpl implements VariantService {
    private final ProductRepository productRepository;
    private final ProductVariantRepository  productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private void recalcProductStatus(Product product) {

        boolean hasStock = product.getVariants().stream()
                .anyMatch(v -> v.getStatus() == VariantStatus.ACTIVE && v.getQuantity() > 0);
        product.setStatus(hasStock ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK);
    }
    @Override
    public Page<VariantResponseDTO> getAllVariants(Pageable pageable,
                                                   String productId,
                                                   ProductSize productSize,
                                                   VariantStatus status) {

        Specification<ProductVariant> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (productId != null && !productId.isBlank()) {
                predicates.add(cb.equal(root.get("product").get("id"), productId));
            }

            if (productSize != null) {
                predicates.add(cb.equal(root.get("size"), productSize));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productVariantRepository.findAll(spec, pageable)
                .map(v -> {
                    VariantResponseDTO dto = new VariantResponseDTO();
                    dto.setId(v.getId());
                    dto.setProductId(v.getProduct().getId());
                    dto.setProductName(v.getProduct().getName());
                    dto.setColor(v.getColor());
                    dto.setSize(v.getSize());
                    dto.setQuantity(v.getQuantity());
                    dto.setStatus(v.getStatus());

                    if (v.getImages() != null && !v.getImages().isEmpty()) {
                        dto.setImage(v.getImages().get(0).getImageUrl());
                    }

                    return dto;
                });
    }
    @Override
    public void createVariant(String productId,
                              ProductSize size,
                              String color,
                              Integer quantity,
                              List<MultipartFile> images) {

        // ===== CHECK PRODUCT =====
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product không tồn tại"));

        // ===== VALIDATE =====
        if (size == null) throw new RuntimeException("Size không được để trống");
        if (color == null || color.trim().isEmpty()) throw new RuntimeException("Color không hợp lệ");
        if (quantity == null || quantity < 0) throw new RuntimeException("Quantity không hợp lệ");

        color = color.trim();

        // CHECK TRÙNG
        boolean exists = productVariantRepository
                .existsByProduct_IdAndSizeAndColor(productId, size, color);

        if (exists) {
            throw new RuntimeException("Variant đã tồn tại (size + color)");
        }

        //  CREATE VARIANT
        ProductVariant variant = new ProductVariant();
        variant.setId(UUID.randomUUID().toString());
        variant.setProduct(product);
        variant.setSize(size);
        variant.setColor(color);
        variant.setQuantity(quantity);
        variant.setStatus(VariantStatus.ACTIVE);

        productVariantRepository.save(variant);

        // UPLOAD IMAGE
        if (images != null && !images.isEmpty()) {
            for (MultipartFile file : images) {

                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path path = Paths.get("uploads/" + fileName);

                try {
                    Files.copy(file.getInputStream(), path);
                } catch (IOException e) {
                    throw new RuntimeException("Upload ảnh thất bại");
                }

                ProductImage image = new ProductImage();
                image.setId(UUID.randomUUID().toString());
                image.setImageUrl("/uploads/" + fileName);
                image.setProductVariant(variant);

                productImageRepository.save(image);
            }
        }
    }
    @Override
    public void updateVariant(String variantId, UpdateVariantRequestDTO request) {

        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant không tồn tại"));

        // UPDATE SIZE
        if (request.getSize() != null) {
            variant.setSize(request.getSize());
        }

        // UPDATE COLOR
        if (request.getColor() != null && !request.getColor().trim().isEmpty()) {
            variant.setColor(request.getColor().trim());
        }
        if (request.getSize() != null || request.getColor() != null) {

            ProductSize newSize = request.getSize() != null ? request.getSize() : variant.getSize();
            String newColor = request.getColor() != null ? request.getColor() : variant.getColor();

            boolean exists = productVariantRepository
                    .existsByProduct_IdAndSizeAndColor(
                            variant.getProduct().getId(),
                            newSize,
                            newColor
                    );
            if (variant.getStatus() == VariantStatus.INACTIVE) {
                throw new RuntimeException("Variant đã bị vô hiệu hóa");
            }
            if (exists && !(variant.getSize() == newSize && variant.getColor().equals(newColor))) {
                throw new RuntimeException("Variant đã tồn tại (size + color)");
            }
        }

        // ===== UPDATE QUANTITY =====
        if (request.getQuantity() != null) {
            if (request.getQuantity() < 0) {
                throw new RuntimeException("Số lượng không hợp lệ");
            }
            variant.setQuantity(request.getQuantity());
            if (request.getQuantity() == 0) {
                variant.setStatus(VariantStatus.INACTIVE);
            } else {
                variant.setStatus(VariantStatus.ACTIVE);
            }
        }

        productVariantRepository.save(variant);
        recalcProductStatus(variant.getProduct());
    }
    @Override
    public void uploadImages(String variantId, List<MultipartFile> images) {

        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant không tồn tại"));

        if (variant.getStatus() == VariantStatus.INACTIVE) {
            throw new RuntimeException("Không thể thêm ảnh cho variant đã bị xóa");
        }
        for (MultipartFile file : images) {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

            Path path = Paths.get("uploads/" + fileName);

            try {
                Files.copy(file.getInputStream(), path);
            } catch (IOException e) {
                throw new RuntimeException("Upload ảnh thất bại");
            }

            ProductImage image = new ProductImage();
            image.setId(UUID.randomUUID().toString());
            image.setImageUrl("/uploads/" + fileName);
            image.setProductVariant(variant);

            productImageRepository.save(image);
        }
    }
    @Override
    public void deleteImage(String imageId) {

        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Ảnh không tồn tại"));

        // Xóa file trong server (nếu có)
        String filePath = image.getImageUrl().replace("/uploads/", "uploads/");
        try {
            Files.deleteIfExists(Paths.get(filePath));
        } catch (IOException e) {
        }

        productImageRepository.delete(image);
    }
    @Override
    public void deleteVariant(String variantId) {

        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant không tồn tại"));

        variant.setStatus(VariantStatus.INACTIVE);

        productVariantRepository.save(variant);
    }
    @Override
    public void restoreVariant(String variantId) {

        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant không tồn tại"));

        // nếu đã ACTIVE rồi thì không cần mở
        if (variant.getStatus() == VariantStatus.ACTIVE) {
            throw new RuntimeException("Variant đang hoạt động");
        }

        variant.setStatus(VariantStatus.ACTIVE);

        productVariantRepository.save(variant);
    }
}
