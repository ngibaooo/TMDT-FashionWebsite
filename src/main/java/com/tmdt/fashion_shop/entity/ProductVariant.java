package com.tmdt.fashion_shop.entity;

import com.tmdt.fashion_shop.enums.ProductSize;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
public class ProductVariant {

    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Enumerated(EnumType.STRING)
    private ProductSize size;

    private String color;
    private int quantity;

    @OneToMany(mappedBy = "productVariant")
    private List<ProductImage> images = new ArrayList<>();
}