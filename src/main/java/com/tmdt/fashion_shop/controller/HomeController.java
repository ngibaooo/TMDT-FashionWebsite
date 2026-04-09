package com.tmdt.fashion_shop.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping({"/", "/home"})
    public String homePage(Model model) {
        model.addAttribute("activePage", "home");
        return "user/index"; 
    }

    @GetMapping("/vintage")
    public String vintagePage(Model model) {
        model.addAttribute("title", "BỘ SƯU TẬP VINTAGE.");
        model.addAttribute("desc", "Cổ điển, vượt thời gian và đầy phong cách.");
        model.addAttribute("activePage", "vintage");
        return "user/product_list";
    }

    @GetMapping("/streetwear")
    public String streetwearPage(Model model) {
        model.addAttribute("title", "BỘ SƯU TẬP STREETWEAR.");
        model.addAttribute("desc", "Phong cách đường phố hiện đại. Thiết kế độc đáo.");
        model.addAttribute("activePage", "streetwear");
        return "user/product_list";
    }

    @GetMapping("/polo")
    public String poloPage(Model model) {
        model.addAttribute("title", "BỘ SƯU TẬP POLO.");
        model.addAttribute("desc", "Lịch lãm, trẻ trung và năng động.");
        model.addAttribute("activePage", "polo");
        return "user/product_list";
    }

    @GetMapping("/outerwear")
    public String outerwearPage(Model model) {
        model.addAttribute("title", "BỘ SƯU TẬP ÁO KHOÁC.");
        model.addAttribute("desc", "Ấm áp và cá tính cho mọi hành trình.");
        model.addAttribute("activePage", "outerwear");
        return "user/product_list";
    }

    @GetMapping("/sale")
    public String salePage(Model model) {
        model.addAttribute("title", "CHƯƠNG TRÌNH KHUYẾN MÃI.");
        model.addAttribute("desc", "Săn deal cực hời với những sản phẩm hot nhất.");
        model.addAttribute("activePage", "sale");
        return "user/product_list";
    }

    // --- TRANG BEST SELLING MỚI ---
    @GetMapping("/best-selling")
    public String bestSellingPage(Model model) {
        model.addAttribute("title", "BEST SELLING.");
        model.addAttribute("desc", "Những sản phẩm được yêu thích nhất tại EAZY VIBES.");
        model.addAttribute("activePage", "best-selling");
        return "user/product_list"; // Dùng chung layout product_list nhưng tiêu đề sẽ khác
    }

    @GetMapping("/login")
    public String loginPage(Model model) {
        model.addAttribute("activePage", "login");
        return "user/login"; 
    }

    @GetMapping("/register")
    public String registerPage(Model model) {
        model.addAttribute("activePage", "register");
        return "user/register"; 
    }
}