package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.RegisterRequestDTO;
import com.tmdt.fashion_shop.entity.User;
import com.tmdt.fashion_shop.enums.UserRole;
import com.tmdt.fashion_shop.enums.UserStatus;
import com.tmdt.fashion_shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileService fileService;

    @Override
    public User register(RegisterRequestDTO request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("SĐT đã tồn tại");
        }

        // upload avatar
        String avatarFileName = fileService.uploadFile(request.getAvatar());

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole(UserRole.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);

        user.setAvatar(avatarFileName);

        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
}
