package com.tmdt.fashion_shop.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    // Khi người dùng gõ localhost:8080/ hoặc localhost:8080/home
    @GetMapping({"/", "/home"})
    public String homePage() {
        // Spring Boot sẽ tự động tìm file index.html trong thư mục templates/user/
        return "user/index"; 
    }
}