package com.tmdt.fashion_shop.controller;

import com.tmdt.fashion_shop.dto.auth.ChangePasswordRequestDTO;
import com.tmdt.fashion_shop.dto.user.UpdateUserRequestDTO;
import com.tmdt.fashion_shop.dto.user.UserProfileDTO;
import com.tmdt.fashion_shop.dto.user.UserProfileForAdminDTO;
import com.tmdt.fashion_shop.security.JWTService;
import com.tmdt.fashion_shop.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @GetMapping
    public List<UserProfileForAdminDTO> getAllUsers(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUsername(token);

        UserProfileDTO user = userService.getProfile(userId);

        if (!user.getRole().equals("ADMIN")) {
            throw new RuntimeException("Không có quyền");
        }

        return userService.getAllUsers();
    }
    @DeleteMapping("/{id}")
    public String disableUser(
            @PathVariable("id") String targetUserId,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        String adminId = jwtService.extractUsername(token);

        userService.disableUser(adminId, targetUserId);

        return "Khóa tài khoản thành công";
    }
    @PutMapping("/{id}/unlock")
    public String enableUser(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        String adminId = jwtService.extractUsername(token);

        userService.enableUser(adminId, id);

        return "Mở khóa tài khoản thành công";
    }
}