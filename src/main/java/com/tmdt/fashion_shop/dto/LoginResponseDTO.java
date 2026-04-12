package com.tmdt.fashion_shop.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponseDTO {

    private String token;
    private String email;
    private String phone;
    private String role;
    private String avatar;
}
