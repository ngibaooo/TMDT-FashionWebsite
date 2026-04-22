package com.tmdt.fashion_shop.service.user;

import com.tmdt.fashion_shop.dto.auth.ChangePasswordRequestDTO;
import com.tmdt.fashion_shop.dto.user.UpdateUserRequestDTO;
import com.tmdt.fashion_shop.dto.user.UserProfileDTO;
import com.tmdt.fashion_shop.dto.user.UserProfileForAdminDTO;
import com.tmdt.fashion_shop.entity.User;
import com.tmdt.fashion_shop.enums.UserStatus;
import com.tmdt.fashion_shop.repository.OrderRepository;
import com.tmdt.fashion_shop.repository.UserRepository;
import com.tmdt.fashion_shop.service.auth.PasswordValidatorService;
import com.tmdt.fashion_shop.service.file.FileService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final FileService fileService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordValidatorService passwordValidator;
    private final OrderRepository orderRepository;

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
                user.getStatus(),
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
                user.getStatus(),
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
    @Override
    public List<UserProfileForAdminDTO> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(user -> new UserProfileForAdminDTO(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getPhone(),
                        user.getAddress(),
                        user.getAvatar(),
                        user.getRole().name(),
                        user.getStatus(),
                        user.getCreatedAt()
                ))
                .toList();
    }
    @Override
    @Transactional
    public void disableUser(String adminId, String targetUserId) {

        // lấy admin
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin không tồn tại"));

        // check quyền
        if (!admin.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Không có quyền");
        }

        // lấy user cần lock
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // không cho tự khóa chính mình
        if (adminId.equals(targetUserId)) {
            throw new RuntimeException("Không thể tự khóa tài khoản của mình");
        }

        // đã bị khóa rồi
        if (user.getStatus() == UserStatus.LOCKED) {
            throw new RuntimeException("Tài khoản đã bị khóa trước đó");
        }

        // không cho lock ADMIN khác (optional nhưng nên có)
        if (user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Không thể khóa tài khoản ADMIN");
        }
        // đang có đơn hàng chưa hoàn tất
        boolean hasActiveOrders = orderRepository.existsActiveOrdersByUserId(targetUserId);

        if (hasActiveOrders) {
            throw new RuntimeException("Không thể khóa tài khoản đang có đơn hàng đang xử lý");
        }
        // lock
        user.setStatus(UserStatus.LOCKED);

        userRepository.save(user);
    }
    @Override
    @Transactional
    public void enableUser(String adminId, String targetUserId) {

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin không tồn tại"));

        if (!admin.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Không có quyền");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new RuntimeException("Tài khoản đang hoạt động");
        }

        user.setStatus(UserStatus.ACTIVE);

        userRepository.save(user);
    }
}
