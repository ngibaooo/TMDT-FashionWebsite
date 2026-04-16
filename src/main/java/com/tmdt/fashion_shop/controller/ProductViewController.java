package com.tmdt.fashion_shop.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class ProductViewController {

    // Khi người dùng nhấn vào sản phẩm, URL là /products/id-cua-ban
    // Hàm này sẽ trả về file product-detail.html trong thư mục templates/user/
    @GetMapping("/products/{id}")
    public String viewProductDetail(@PathVariable String id) {
        return "user/product-detail"; 
    }
}