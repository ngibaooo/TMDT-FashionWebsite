package com.tmdt.fashion_shop.controller;

import com.tmdt.fashion_shop.dto.ChangePasswordRequestDTO;
import com.tmdt.fashion_shop.dto.UpdateUserRequestDTO;
import com.tmdt.fashion_shop.dto.UserProfileDTO;
import com.tmdt.fashion_shop.security.JWTService;
import com.tmdt.fashion_shop.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JWTService jwtService;

    @GetMapping("/me")
    public UserProfileDTO getProfile(@RequestHeader("Authorization") String authHeader) {

        // lấy token
        String token = authHeader.replace("Bearer ", "");

        // lấy userId từ token
        String userId = jwtService.extractUsername(token);

        return userService.getProfile(userId);
    }
    @PutMapping("/me")
    public UserProfileDTO updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @ModelAttribute UpdateUserRequestDTO request
    ) {
        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUsername(token);

        return userService.updateProfile(userId, request);
    }
    @PutMapping("/change-password")
    public String changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ChangePasswordRequestDTO request
    ) {
        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUsername(token);

        userService.changePassword(userId, request);

        return "Đổi mật khẩu thành công";
    }
}