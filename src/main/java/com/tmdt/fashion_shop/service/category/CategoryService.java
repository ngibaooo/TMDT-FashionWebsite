package com.tmdt.fashion_shop.service.category;


import com.tmdt.fashion_shop.dto.category.CategoryDTO;
import com.tmdt.fashion_shop.dto.category.CategoryDetailDTO;
import com.tmdt.fashion_shop.dto.category.CreateCategoryRequestDTO;
import com.tmdt.fashion_shop.dto.category.UpdateCategoryRequestDTO;

import java.util.List;

public interface CategoryService {
    public List<CategoryDTO> getAllCategories();
    public CategoryDetailDTO getDetail(String id);
    public void createCategory(CreateCategoryRequestDTO request);
    public void updateCategory(String id, UpdateCategoryRequestDTO request);
    public void deleteCategory(String id);
    public void enableCategory(String id);
}
