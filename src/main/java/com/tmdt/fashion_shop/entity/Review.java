package com.tmdt.fashion_shop.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;

@Entity
public class Review {

    @Id
    private String id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Product product;

    @ManyToOne
    private Order order;

    private int rating;
    private String comment;

    private LocalDateTime createdAt;

    @ManyToOne
    private ProductVariant productVariant;
}