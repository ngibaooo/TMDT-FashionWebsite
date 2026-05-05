package com.tmdt.fashion_shop.service.auth;

import com.tmdt.fashion_shop.dto.auth.LoginRequestDTO;
import com.tmdt.fashion_shop.dto.auth.LoginResponseDTO;
import com.tmdt.fashion_shop.dto.auth.RegisterRequestDTO;
import com.tmdt.fashion_shop.entity.User;

public interface AuthService {
    User register(RegisterRequestDTO request);
    LoginResponseDTO login(LoginRequestDTO request);
    public void sendOtp(String email);
    public boolean verifyOtp(String email, String code);
}