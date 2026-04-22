package com.tmdt.fashion_shop.entity;

import com.tmdt.fashion_shop.enums.PolicyType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class Policy {

    @Id
    private String id;

    @Enumerated(EnumType.STRING)
    private PolicyType type;

    private String content;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
