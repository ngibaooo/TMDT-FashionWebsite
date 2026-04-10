package com.tmdt.fashion_shop.controller;

import com.tmdt.fashion_shop.dto.BestSellingProductDTO;
import com.tmdt.fashion_shop.dto.ProductCreateRequestDTO;
import com.tmdt.fashion_shop.dto.ProductDTO;
import com.tmdt.fashion_shop.dto.ProductDetailDTO;
import com.tmdt.fashion_shop.enums.ProductSize;
import com.tmdt.fashion_shop.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // lấy danh sách
    @GetMapping
    public Page<ProductDTO> getAll(Pageable pageable) {
        return productService.getAll(pageable);
    }

    // tìm kiếm
    @GetMapping("/search")
    public Page<ProductDTO> search(
            @RequestParam String keyword,
            Pageable pageable
    ) {
        return productService.search(keyword, pageable);
    }

    // theo category
    @GetMapping("/category/{id}")
    public Page<ProductDTO> getByCategory(
            @PathVariable String id,
            Pageable pageable
    ) {
        return productService.getByCategory(id, pageable);
    }

    // chi tiết
    @GetMapping("/{id}")
    public ProductDetailDTO getDetail(@PathVariable String id) {
        return productService.getById(id);
    }

    //filter
    @GetMapping("/filter")
    public Page<ProductDetailDTO> filter(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) ProductSize size,
            @RequestParam(required = false) String color,
            Pageable pageable
    ) {
        return productService.filter(minPrice, maxPrice, size, color, pageable);
    }
    @GetMapping("/new")
    public Page<ProductDTO> getNewProducts(Pageable pageable) {
        return productService.getNewProducts(pageable);
    }
    @GetMapping("/admin/best-selling")
    public Page<BestSellingProductDTO> getBestSellingProducts(Pageable pageable) {
        return productService.getBestSellingProducts(pageable);
    }
    // USER
    @GetMapping("/best-selling")
    public Page<ProductDTO> bestSelling(Pageable pageable) {
        return productService.getBestSellingProductsForUser(pageable);
    }
    @PostMapping
    public ProductDTO create(@ModelAttribute ProductCreateRequestDTO request) {
        return productService.create(request);
    }
}