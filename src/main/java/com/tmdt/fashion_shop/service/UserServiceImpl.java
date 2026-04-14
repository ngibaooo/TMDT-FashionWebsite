package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.ChangePasswordRequestDTO;
import com.tmdt.fashion_shop.dto.UpdateUserRequestDTO;
import com.tmdt.fashion_shop.dto.UserProfileDTO;
import com.tmdt.fashion_shop.entity.User;
import com.tmdt.fashion_shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final FileService fileService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordValidatorService passwordValidator;

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
                user.getRole().name(),
                user.getCreatedAt()
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
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
    @Override
    public void changePassword(String userId, ChangePasswordRequestDTO request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // check mật khẩu cũ
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new RuntimeException("Mật khẩu mới không được để trống");
        }
        passwordValidator.validate(request.getNewPassword());
        // check confirm password
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }
        // không cho đặt lại giống mật khẩu cũ
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu mới không được trùng mật khẩu cũ");
        }

        // encode password mới
        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(encodedPassword);

        userRepository.save(user);
    }
}
