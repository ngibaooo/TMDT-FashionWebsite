package com.tmdt.fashion_shop.repository;

import com.tmdt.fashion_shop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, String> {
}
