package com.tmdt.fashion_shop.service;

import com.tmdt.fashion_shop.dto.ApplyVoucherResponseDTO;

public interface VoucherService {
    ApplyVoucherResponseDTO applyVoucher(String userId, String code);
}
