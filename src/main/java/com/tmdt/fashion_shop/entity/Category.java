package com.tmdt.fashion_shop.entity;

import com.tmdt.fashion_shop.enums.CategoryStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Category {

    @Id
    private String id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Category parentCategory;
    @Enumerated(EnumType.STRING)
    private CategoryStatus status;
}