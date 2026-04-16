package com.tmdt.fashion_shop.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

   @Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // Giữ nguyên phần uploads của bạn
    Path uploadDir = Paths.get("uploads");
    String uploadPath = uploadDir.toFile().getAbsolutePath();
    registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:/" + uploadPath + "/");

    // THÊM DÒNG NÀY: Để đảm bảo thư mục static/images luôn hoạt động
    registry.addResourceHandler("/images/**")
            .addResourceLocations("classpath:/static/images/");
}
}