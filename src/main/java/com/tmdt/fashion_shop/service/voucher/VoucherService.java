package com.tmdt.fashion_shop.service.voucher;

import com.tmdt.fashion_shop.dto.voucher.ApplyVoucherResponseDTO;
import com.tmdt.fashion_shop.dto.voucher.CreateVoucherRequestDTO;
import com.tmdt.fashion_shop.dto.voucher.GetVoucherDTO;
import com.tmdt.fashion_shop.dto.voucher.UpdateVoucherRequestDTO;

import java.util.List;

public interface VoucherService {
    ApplyVoucherResponseDTO applyVoucher(String userId, String code);
    public List<GetVoucherDTO> getAllVouchers();
    public void createVoucher(CreateVoucherRequestDTO request);
    public void updateVoucher(String id, UpdateVoucherRequestDTO request);
    public void disableVoucher(String id);
    public void enableVoucher(String id);
}
