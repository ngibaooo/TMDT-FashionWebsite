package com.tmdt.fashion_shop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserProfileDTO {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String avatar;
    private String role;
    private LocalDateTime createdAt;
}
