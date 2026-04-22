package com.tmdt.fashion_shop.repository;

import com.tmdt.fashion_shop.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByProduct_Id(String productId);
    boolean existsByUser_IdAndProduct_Id(String userId, String productId);
}
