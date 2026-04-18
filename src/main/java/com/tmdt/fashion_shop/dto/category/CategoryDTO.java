package com.tmdt.fashion_shop.dto.category;

import com.tmdt.fashion_shop.enums.CategoryStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CategoryDTO {
    private String id;
    private String name;
    private String parentId;
    private String parentName;
    private CategoryStatus status;
}