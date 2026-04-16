package com.tmdt.fashion_shop.dto.user;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UpdateUserRequestDTO {
    private String name;
    private String phone;
    private String address;
    private MultipartFile avatar;
}