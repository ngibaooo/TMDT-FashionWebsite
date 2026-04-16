package com.tmdt.fashion_shop.service.user;

import com.tmdt.fashion_shop.dto.auth.ChangePasswordRequestDTO;
import com.tmdt.fashion_shop.dto.user.UpdateUserRequestDTO;
import com.tmdt.fashion_shop.dto.user.UserProfileDTO;

public interface UserService {
    UserProfileDTO getProfile(String userId);
    UserProfileDTO updateProfile(String userId, UpdateUserRequestDTO request);
    public void changePassword(String userId, ChangePasswordRequestDTO request);
}
