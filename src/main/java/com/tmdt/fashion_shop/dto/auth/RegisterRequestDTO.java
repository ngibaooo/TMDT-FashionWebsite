package com.tmdt.fashion_shop.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class RegisterRequestDTO {
    @NotBlank(message = "Tên không được để trống")
    private String name;

    @Email(message = "Email không hợp lệ")
    @NotBlank
    private String email;

    @NotBlank(message = "SĐT không được để trống")
    private String phone;

    @Size(min = 6, message = "Password phải >= 6 ký tự")
    private String password;

    @NotBlank
    private String address;

    private MultipartFile avatar;
}