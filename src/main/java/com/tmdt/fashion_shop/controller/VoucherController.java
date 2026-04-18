package com.tmdt.fashion_shop.controller;

import com.tmdt.fashion_shop.dto.voucher.ApplyVoucherResponseDTO;
import com.tmdt.fashion_shop.dto.voucher.ApplyVoucherRequestDTO;
import com.tmdt.fashion_shop.dto.voucher.CreateVoucherRequestDTO;
import com.tmdt.fashion_shop.dto.voucher.UpdateVoucherRequestDTO;
import com.tmdt.fashion_shop.security.JWTService;
import com.tmdt.fashion_shop.service.voucher.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createVoucher(
            @RequestBody CreateVoucherRequestDTO request
    ) {
        voucherService.createVoucher(request);
        return ResponseEntity.ok("Tạo voucher thành công");
    }
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateVoucher(
            @PathVariable String id,
            @RequestBody UpdateVoucherRequestDTO request
    ) {
        voucherService.updateVoucher(id, request);
        return ResponseEntity.ok("Cập nhật voucher thành công");
    }
    @DeleteMapping("/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> disableVoucher(@PathVariable String id) {
        voucherService.disableVoucher(id);
        return ResponseEntity.ok("Voucher đã được vô hiệu hóa");
    }
    @PutMapping("/{id}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enableVoucher(@PathVariable String id) {
        voucherService.enableVoucher(id);
        return ResponseEntity.ok("Voucher đã được kích hoạt lại");
    }
}