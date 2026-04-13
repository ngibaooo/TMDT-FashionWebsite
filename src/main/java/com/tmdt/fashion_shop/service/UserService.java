package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.ChangePasswordRequestDTO;
import com.tmdt.fashion_shop.dto.UpdateUserRequestDTO;
import com.tmdt.fashion_shop.dto.UserProfileDTO;

public interface UserService {
    UserProfileDTO getProfile(String userId);
    UserProfileDTO updateProfile(String userId, UpdateUserRequestDTO request);
    public void changePassword(String userId, ChangePasswordRequestDTO request);
}
