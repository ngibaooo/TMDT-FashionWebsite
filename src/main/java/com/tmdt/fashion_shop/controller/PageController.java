package com.tmdt.fashion_shop.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class PageController {
    @GetMapping("/terms")
    public String terms() {
        return "policy/terms";
    }

    @GetMapping("/privacy")
    public String privacy() {
        return "policy/privacy";
    }

    @GetMapping("/return-policy")
    public String returnPolicy() {
        return "policy/return";
    }

    @GetMapping("/shipping")
    public String shipping() {
        return "policy/shipping";
    }
    @GetMapping("/company-info")
    public String companyInfo() {
        return "legal/company-info";
    }
    @GetMapping("/license")
    public String license() {
        return "legal/business-license";
    }

    // 1. Trang chủ - Phải trỏ vào thư mục user/
    @GetMapping("/")
    public String homePage() {
        return "user/index"; 
    }

    @GetMapping("/user/profile")
    public String profilePage() {
        return "user/profile";
    }
    @GetMapping("/user/order-detail")
    public String orderDetailPage() {
        return "/user/order-detail";
    }

    @GetMapping("/user/cart")
    public String cartPage() {
        return "user/cart";
    }
    @GetMapping("/user/payment")
    public String checkoutPage() {
        return "user/payment";
    }
    @GetMapping("/vnpay")
    public String vnpayPage() {
        return "vnpay";
    }
    @GetMapping("/payment-success")
    public String paymentSuccessPage() {
        return "payment-success";
    }

    @GetMapping("/user/update-profile")
    public String updateProfilePage() {
        return "user/update-profile"; 
    }

    @GetMapping("/login")
    public String loginPage() {
        return "auth/login";
    }

    // 5. Trang Register
    @GetMapping("/register")
    public String registerPage() {
        return "auth/register";
    }
    @GetMapping("/all-products")
    public String allProductsPage() {
        return "user/all-products";
    }

    @GetMapping("/tops")
    public String topsPage() {
        return "user/tops";
    }
    @GetMapping("/bottoms")
    public String bottomsPage() {
        return "user/bottoms";
    }
    @GetMapping("/outerwear")
    public String outerwearPage() {
        return "user/outerwear";
    }
    @GetMapping("/best-selling")
    public String bestSellingPage() {
        return "user/best-selling";
    }

    @GetMapping("/sale")
    public String salePage() {
        return "user/sale";
    }

//    admin
    @GetMapping("/admin/dashboard")
    public String dashboardPage() {
    return "admin/dashboard";
}
    @GetMapping("/admin/products")
    public String productsPage() {
        return "admin/products";
    }
    @GetMapping("/admin/orders")
    public String ordersPage() {
        return "admin/orders";
    }
    @GetMapping("/admin/users")
    public String usersPage() {
        return "admin/users";
    }
    @GetMapping("/admin/vouchers")
    public String vouchersPage() {
        return "admin/vouchers";
    }
    @GetMapping("/admin/variants")
    public String variantsPage() {
        return "admin/variants";
    }
    @GetMapping("/admin/categories")
    public String categoriesPage() {
        return "admin/categories";
    }
    @GetMapping("/admin/products/edit-product/{id}")
    public String editProductPage(@PathVariable String id) {
        return "admin/edit-product";
    }
    @GetMapping("/admin/products/add-product")
    public String addProductPage() {
        return "admin/add-product";
    }

}

