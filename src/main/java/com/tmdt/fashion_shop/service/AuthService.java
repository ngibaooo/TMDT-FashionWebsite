package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.RegisterRequestDTO;
import com.tmdt.fashion_shop.entity.User;

public interface AuthService {
    User register(RegisterRequestDTO request);
}