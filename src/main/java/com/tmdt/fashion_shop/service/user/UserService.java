package com.tmdt.fashion_shop.service.user;

import com.tmdt.fashion_shop.dto.auth.ChangePasswordRequestDTO;
import com.tmdt.fashion_shop.dto.user.UpdateUserRequestDTO;
import com.tmdt.fashion_shop.dto.user.UserProfileDTO;
import com.tmdt.fashion_shop.dto.user.UserProfileForAdminDTO;

import java.util.List;

public interface UserService {
    UserProfileDTO getProfile(String userId);
    UserProfileDTO updateProfile(String userId, UpdateUserRequestDTO request);
    public void changePassword(String userId, ChangePasswordRequestDTO request);
    public List<UserProfileForAdminDTO> getAllUsers();
    public void disableUser(String adminId, String targetUserId);
    public void enableUser(String adminId, String targetUserId);
}
