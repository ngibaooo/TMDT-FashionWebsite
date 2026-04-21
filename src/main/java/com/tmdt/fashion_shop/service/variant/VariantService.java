package com.tmdt.fashion_shop.service.variant;

import com.tmdt.fashion_shop.dto.variants.UpdateVariantRequestDTO;
import com.tmdt.fashion_shop.dto.variants.VariantResponseDTO;
import com.tmdt.fashion_shop.enums.ProductSize;
import com.tmdt.fashion_shop.enums.VariantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface VariantService {
//    public Page<VariantResponseDTO> getAllVariants(Pageable pageable, String productId);
    public Page<VariantResponseDTO> getAllVariants(Pageable pageable,
                                               String productId,
                                               ProductSize productSize,
                                               VariantStatus status);
    void updateVariant(String variantId, UpdateVariantRequestDTO request);
    public void deleteImage(String imageId);
    public void uploadImages(String variantId, List<MultipartFile> files);
    public void createVariant(String productId, ProductSize size, String color, Integer quantity, List<MultipartFile> files);
    public void deleteVariant(String variantId);
    public void restoreVariant(String variantId);
}
