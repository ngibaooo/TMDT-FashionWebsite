package com.tmdt.fashion_shop.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalModel {

    @ModelAttribute
    public void addActivePage(Model model, HttpServletRequest request) {

        String uri = request.getRequestURI();

        if (uri.equals("/")) {
            model.addAttribute("activePage", "home");
        } else if (uri.contains("best-selling")) {
            model.addAttribute("activePage", "best");
        } else if (uri.contains("tops")) {
            model.addAttribute("activePage", "tops");
        } else if (uri.contains("bottoms")) {
            model.addAttribute("activePage", "bottoms");
        } else if (uri.contains("outerwear")) {
            model.addAttribute("activePage", "outerwear");
        } else if (uri.contains("sale")) {
            model.addAttribute("activePage", "sale");
        }
    }
}