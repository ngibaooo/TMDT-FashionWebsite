package com.tmdt.fashion_shop.repository;

import com.tmdt.fashion_shop.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, String> {
    Optional<Otp> findTopByEmailOrderByExpiredAtDesc(String email);
}
