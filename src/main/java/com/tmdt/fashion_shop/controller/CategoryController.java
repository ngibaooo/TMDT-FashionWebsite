package com.tmdt.fashion_shop.controller;

import com.tmdt.fashion_shop.dto.category.CreateCategoryRequestDTO;
import com.tmdt.fashion_shop.dto.category.UpdateCategoryRequestDTO;
import com.tmdt.fashion_shop.service.category.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDetail(@PathVariable String id) {
        return ResponseEntity.ok(categoryService.getDetail(id));
    }
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCategory(@RequestBody CreateCategoryRequestDTO request) {
        categoryService.createCategory(request);
        return ResponseEntity.ok("Tạo category thành công");
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCategory(
            @PathVariable String id,
            @RequestBody UpdateCategoryRequestDTO request
    ) {
        categoryService.updateCategory(id, request);
        return ResponseEntity.ok("Cập nhật category thành công");
    }
    @DeleteMapping("/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> disableCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("Category đã được vô hiệu hóa");
    }
    @PutMapping("/{id}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enableCategory(@PathVariable String id) {
        categoryService.enableCategory(id);
        return ResponseEntity.ok("Category đã được kích hoạt lại");
    }
}