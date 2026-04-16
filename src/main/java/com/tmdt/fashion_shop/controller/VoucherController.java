package com.tmdt.fashion_shop.controller;

import com.tmdt.fashion_shop.dto.voucher.ApplyVoucherResponseDTO;
import com.tmdt.fashion_shop.dto.voucher.ApplyVoucherRequestDTO;
import com.tmdt.fashion_shop.security.JWTService;
import com.tmdt.fashion_shop.service.voucher.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;
    private final JWTService jwtService;

    @PostMapping("/apply")
    public ResponseEntity<?> applyVoucher(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ApplyVoucherRequestDTO request
    ) {
        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUsername(token);

        ApplyVoucherResponseDTO result =
                voucherService.applyVoucher(userId, request.getCode());

        return ResponseEntity.ok(result);
    }
}