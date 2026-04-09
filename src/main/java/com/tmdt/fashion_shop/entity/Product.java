package com.tmdt.fashion_shop.entity;

import com.tmdt.fashion_shop.enums.ProductStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Product {

    @Id
    private String id;

    private String name;
    private String description;
    private double price;
    private Double oldPrice;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    private LocalDateTime createdAt;
}