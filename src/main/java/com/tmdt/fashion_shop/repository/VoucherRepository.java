package com.tmdt.fashion_shop.repository;

import com.tmdt.fashion_shop.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface VoucherRepository extends JpaRepository<Voucher, String> {
    Optional<Voucher> findByCode(String code);
//    @Query("SELECT v FROM Voucher v WHERE BINARY v.code = :code")
//    Optional<Voucher> findByCodeCaseSensitive(@Param("code") String code);
    @Query(value = "SELECT * FROM voucher WHERE BINARY code = :code", nativeQuery = true)
    Optional<Voucher> findByCodeCaseSensitive(@Param("code") String code);
}
