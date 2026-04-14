package com.tmdt.fashion_shop.service;
import org.springframework.stereotype.Component;

@Component
public class PasswordValidatorService {
    public void validate(String password) {

        if (password == null || password.isBlank()) {
            throw new RuntimeException("Mật khẩu không được để trống");
        }

        if (password.length() < 8 || !password.matches(".*[A-Z].*") || !password.matches(".*[a-z].*") || !password.matches(".*\\d.*") || !password.matches(".*[@$!%*?&].*")) {
//            throw new RuntimeException("Mật khẩu phải có ít nhất 8 ký tự");
            throw new RuntimeException("Mật khẩu phải đúng yêu cầu");
        }
//
//        if () {
//            throw new RuntimeException("Mật khẩu phải có ít nhất 1 chữ hoa");
//        }
//
//        if () {
//            throw new RuntimeException("Mật khẩu phải có ít nhất 1 chữ thường");
//        }
//
//        if () {
//            throw new RuntimeException("Mật khẩu phải có ít nhất 1 số");
//        }
//
//        if () {
//            throw new RuntimeException("Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
//        }
    }
}
