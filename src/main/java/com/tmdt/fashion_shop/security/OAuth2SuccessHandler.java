package com.tmdt.fashion_shop.security;

import com.tmdt.fashion_shop.entity.User;
import com.tmdt.fashion_shop.enums.UserRole;
import com.tmdt.fashion_shop.enums.UserStatus;
import com.tmdt.fashion_shop.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JWTService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // 1. CHECK USER
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setId(UUID.randomUUID().toString());
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setRole(UserRole.CUSTOMER);
            newUser.setStatus(UserStatus.ACTIVE);
            newUser.setProvider("GOOGLE");
            newUser.setCreatedAt(LocalDateTime.now());
            return userRepository.save(newUser);
        });

        // 2. GENERATE JWT
        String token = jwtService.generateToken(user.getId(), user.getRole().name());

        // 3. REDIRECT VỀ FRONTEND
//        response.sendRedirect("http://localhost:8080/oauth2/success?token=" + token);
        response.sendRedirect("http://localhost:8080/?token=" + token);
    }
}