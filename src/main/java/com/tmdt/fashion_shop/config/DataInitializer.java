package com.tmdt.fashion_shop.config;

import com.tmdt.fashion_shop.entity.User;
import com.tmdt.fashion_shop.enums.UserRole;
import com.tmdt.fashion_shop.enums.UserStatus;
import com.tmdt.fashion_shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initAdmin() {
        return args -> {

            // kiểm tra đã có admin chưa
            if (!userRepository.existsByEmail("admin@gmail.com")) {

                User admin = new User();
                admin.setId(UUID.randomUUID().toString());
                admin.setName("Admin");
                admin.setEmail("admin@gmail.com");
                admin.setPhone("0123456789");
                admin.setPassword(passwordEncoder.encode("123456"));
                admin.setRole(UserRole.ADMIN);
                admin.setStatus(UserStatus.ACTIVE);
                admin.setCreatedAt(LocalDateTime.now());

                userRepository.save(admin);

                System.out.println("Admin đã được tạo!");
            }
        };
    }
}