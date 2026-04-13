package com.tmdt.fashion_shop.service;
import org.springframework.stereotype.Component;

@Component
public class PasswordValidatorService {
    public void validate(String password) {

        if (password == null || password.isBlank()) {
            throw new RuntimeException("Mật khẩu không được để trống");
        }

        if (password.length() < 8) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 8 ký tự");
        }

        if (!password.matches(".*[A-Z].*")) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 1 chữ hoa");
        }

        if (!password.matches(".*[a-z].*")) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 1 chữ thường");
        }

        if (!password.matches(".*\\d.*")) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 1 số");
        }

        if (!password.matches(".*[@$!%*?&].*")) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
        }
    }
}
