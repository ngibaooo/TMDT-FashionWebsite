package com.tmdt.fashion_shop.controller;

import com.tmdt.fashion_shop.dto.variants.UpdateVariantRequestDTO;
import com.tmdt.fashion_shop.enums.ProductSize;
import com.tmdt.fashion_shop.service.variant.VariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/variants")
@RequiredArgsConstructor
public class VariantController {

    private final VariantService variantService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createVariant(
            @RequestParam String productId,
            @RequestParam ProductSize size,
            @RequestParam String color,
            @RequestParam Integer quantity,
            @RequestParam(required = false) List<MultipartFile> images
    ) {
        variantService.createVariant(productId, size, color, quantity, images);
        return ResponseEntity.ok("Tạo variant thành công");
    }
    @PutMapping("/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateVariant(
            @PathVariable String variantId,
            @RequestBody UpdateVariantRequestDTO request
    ) {

        variantService.updateVariant(variantId, request);

        return ResponseEntity.ok("Cập nhật variant thành công");
    }
    @PostMapping("/{variantId}/images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadVariantImages(
            @PathVariable String variantId,
            @RequestParam("files") List<MultipartFile> images
    ) {
        variantService.uploadImages(variantId, images);
        return ResponseEntity.ok("Upload ảnh thành công");
    }
    @DeleteMapping("/images/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteVariantImage(@PathVariable String imageId) {
        variantService.deleteImage(imageId);
        return ResponseEntity.ok("Xóa ảnh thành công");
    }
    @DeleteMapping("/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteVariant(@PathVariable String variantId) {
        variantService.deleteVariant(variantId);
        return ResponseEntity.ok("Vô hiệu hóa variant thành công");
    }
    @PutMapping("/{variantId}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restoreVariant(@PathVariable String variantId) {

        variantService.restoreVariant(variantId);

        return ResponseEntity.ok("Khôi phục variant thành công");
    }
}