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
        return "user/update-profile"; 
    }

    @GetMapping("/login")
    public String loginPage() {
        return "auth/login";
    }

    // 2. Trang Shop - Phải trỏ vào thư mục user/
    @GetMapping("/shop")
    public String shopPage() {
        return "user/shop"; 
    }

    // 5. Trang Register
    @GetMapping("/register")
    public String registerPage() {
        return "auth/register"; 
    }
    @GetMapping("/tops") // Thay đổi từ /shop?category=tops thành /tops
public String topsPage() {
    return "user/tops"; 
}  @GetMapping("/bottoms")
public String bottomsPage() {
    return "user/bottoms"; 
}@GetMapping("/outerwear")
public String outerwearPage() {
    return "user/outerwear"; 
}@GetMapping("/best-selling")
public String bestSellingPage() {
    return "user/best-selling";
}

@GetMapping("/sale")
public String salePage() {
    return "user/sale";
}} 

