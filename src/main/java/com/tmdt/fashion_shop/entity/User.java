package com.tmdt.fashion_shop.entity;

import com.tmdt.fashion_shop.enums.UserRole;
import com.tmdt.fashion_shop.enums.UserStatus;

import java.time.LocalDateTime;

public class User {
    private String id;
    private String email;
    private String password;
    private String name;
    private String address;
    private String phone;
    private UserRole role;
    private UserStatus status;
    private String avatar;
    private LocalDateTime createdAt;

}
