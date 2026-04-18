package com.tmdt.fashion_shop.repository;

import com.tmdt.fashion_shop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByParentCategory_Id(String parentId);
    boolean existsByNameIgnoreCaseAndParentCategory_Id(String name, String parentId);
    boolean existsByParentCategory_Id(String parentId);
}
