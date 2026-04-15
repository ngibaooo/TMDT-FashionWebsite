package com.tmdt.fashion_shop.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/user/profile")
    public String profilePage() {
        return "user/profile";
    }
    @GetMapping("/user/cart")
    public String cartPage() {
        return "user/cart";
    }
    @GetMapping("/user/update-profile")
        public String updateProfilePage() {
        return "user/update-profile"; // nếu dùng Thymeleaf
    }
    @GetMapping("/login")
    public String loginPage() {
        return "auth/login";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "auth/register";
    }
}