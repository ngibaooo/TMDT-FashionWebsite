package com.tmdt.fashion_shop.service.voucher;

import com.tmdt.fashion_shop.dto.voucher.ApplyVoucherResponseDTO;

public interface VoucherService {
    ApplyVoucherResponseDTO applyVoucher(String userId, String code);
}
