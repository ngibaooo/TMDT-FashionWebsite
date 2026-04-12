package com.tmdt.fashion_shop.controller;

import com.tmdt.fashion_shop.dto.LoginRequestDTO;
import com.tmdt.fashion_shop.dto.RegisterRequestDTO;
import com.tmdt.fashion_shop.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<?> register(@ModelAttribute @Valid RegisterRequestDTO request) {

        authService.register(request);

        return ResponseEntity.ok("Đăng ký thành công");
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }
}