package com.tmdt.fashion_shop.service.auth;
import com.tmdt.fashion_shop.dto.auth.LoginRequestDTO;
import com.tmdt.fashion_shop.dto.auth.LoginResponseDTO;
import com.tmdt.fashion_shop.dto.auth.RegisterRequestDTO;
import com.tmdt.fashion_shop.entity.Otp;
import com.tmdt.fashion_shop.entity.User;
import com.tmdt.fashion_shop.enums.UserRole;
import com.tmdt.fashion_shop.enums.UserStatus;
import com.tmdt.fashion_shop.repository.OtpRepository;
import com.tmdt.fashion_shop.repository.UserRepository;
import com.tmdt.fashion_shop.service.file.FileService;
import com.tmdt.fashion_shop.service.gmail.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.tmdt.fashion_shop.security.JWTService;
import java.time.LocalDateTime;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;
    private final FileService fileService;
    private final MailService mailService;
    private final PasswordValidatorService passwordValidator;
    private final OtpRepository otpRepository;

    @Override
    public User register(RegisterRequestDTO request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        boolean valid = verifyOtp(request.getEmail(), request.getOtp());

        if (!valid) {
            throw new RuntimeException("OTP không hợp lệ");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("SĐT đã tồn tại");
        }

        passwordValidator.validate(request.getPassword());

        // upload avatar
        String avatarFileName = fileService.uploadFile(request.getAvatar());

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
// encode băm mật khẩu thay vì mã hóa. Không thể giải mã được
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole(UserRole.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);

        user.setAvatar(avatarFileName);

        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
    @Override
    public LoginResponseDTO login(LoginRequestDTO request) {

        String username = request.getUsername().trim();

        User user;

        // tìm theo email hoặc phone
        if (username.contains("@")) {
            user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("Tài khoản hoặc mật khẩu không tồn tại! Vui lòng kiểm tra lại"));
        } else {
            user = userRepository.findByPhone(username)
                    .orElseThrow(() -> new RuntimeException("Tài khoản hoặc mật khẩu không tồn tại! Vui lòng kiểm tra lại"));
        }

        // check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Tài khoản hoặc mật khẩu không tồn tại! Vui lòng kiểm tra lại");
        }

        // tạo JWT
        String token = jwtService.generateToken(user.getId(), user.getRole().name());

        return new LoginResponseDTO(
                token,
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getAvatar()
        );
    }
    @Override
    public void sendOtp(String email) {
        String code = String.valueOf((int)(Math.random() * 900000) + 100000);

        Otp otp = new Otp();
        otp.setEmail(email);
        otp.setCode(code);
        otp.setExpiredAt(LocalDateTime.now().plusMinutes(5));
        otp.setUsed(false);

        otpRepository.save(otp);

        mailService.sendOtp(email, code);
    }
    @Override
    public boolean verifyOtp(String email, String code) {
        Otp otp = otpRepository.findTopByEmailOrderByExpiredAtDesc(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy OTP"));

        if (otp.isUsed()) return false;
        if (!otp.getCode().equals(code)) return false;
        if (otp.getExpiredAt().isBefore(LocalDateTime.now())) return false;

        otp.setUsed(true);
        otpRepository.save(otp);

        return true;
    }
}
