package com.tmdt.fashion_shop.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;

@Entity
public class Feedback {

    @Id
    private String id;

    @ManyToOne
    private User user;

    private String name;
    private String email;
    private String message;

    private LocalDateTime createdAt;
}