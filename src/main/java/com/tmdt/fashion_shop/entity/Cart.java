package com.tmdt.fashion_shop.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

import java.time.LocalDateTime;

@Entity
public class Cart {

    @Id
    private String id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;
}
