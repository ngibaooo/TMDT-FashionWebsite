package com.tmdt.fashion_shop.dto.orders;

import com.tmdt.fashion_shop.dto.voucher.VoucherDTO;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class OrderDetailDTO {
    private String id;
    private double totalPrice;

    private String status;
    private String phone;
    private String deliveryAddress;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private List<OrderItemDTO> items;
    private String userName;
    private VoucherDTO voucher;
}
