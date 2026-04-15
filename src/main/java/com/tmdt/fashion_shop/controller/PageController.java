package com.tmdt.fashion_shop.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    // 1. Trang chủ - Phải trỏ vào thư mục user/
    @GetMapping("/")
    public String homePage() {
        return "user/index"; 
    }

    // 2. Trang Shop - Phải trỏ vào thư mục user/
    @GetMapping("/shop")
    public String shopPage() {
        return "user/shop"; 
    }


    // 4. Trang Login - Nằm trong thư mục auth/ (Bạn đã làm đúng cái này)
    @GetMapping("/login")
    public String loginPage() {
        return "auth/login"; 
    }

    // 5. Trang Register
    @GetMapping("/register")
    public String registerPage() {
        return "auth/register"; 
    }

 
    }
