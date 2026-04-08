package com.tmdt.fashion_shop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Ví dụ: Áo Hoodie Eazy OS

    @Column(nullable = false)
    private Double price; // Giá sản phẩm

    @Column(columnDefinition = "TEXT")
    private String description; // Mô tả chi tiết

    private String imageUrl; // Link ảnh sản phẩm

    // Nhiều sản phẩm thuộc về một danh mục
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}