package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.UpdateUserRequestDTO;
import com.tmdt.fashion_shop.dto.UserProfileDTO;
import com.tmdt.fashion_shop.entity.User;
import com.tmdt.fashion_shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final FileService fileService;

    @Override
    public UserProfileDTO getProfile(String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        return new UserProfileDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getAvatar(),
                user.getRole().name()
        );
    }
    @Override
    public UserProfileDTO updateProfile(String userId, UpdateUserRequestDTO request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // update phone (check trùng)
        if (request.getPhone() != null &&
                !request.getPhone().equals(user.getPhone())) {

            if (userRepository.existsByPhone(request.getPhone())) {
                throw new RuntimeException("SĐT đã tồn tại");
            }
            user.setPhone(request.getPhone());
        }

        // update name
        if (request.getName() != null) {
            user.setName(request.getName());
        }

        // update address
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        // update avatar (GIỐNG REGISTER)
        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {

            String avatarFileName = fileService.uploadFile(request.getAvatar());
            user.setAvatar(avatarFileName);
        }

        userRepository.save(user);

        return new UserProfileDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getAvatar(),
                user.getRole().name()
        );
    }
}
