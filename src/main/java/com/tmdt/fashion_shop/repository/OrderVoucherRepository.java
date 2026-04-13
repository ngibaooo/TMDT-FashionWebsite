package com.tmdt.fashion_shop.repository;

import com.tmdt.fashion_shop.entity.OrderVoucher;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderVoucherRepository extends JpaRepository<OrderVoucher, String> {
}