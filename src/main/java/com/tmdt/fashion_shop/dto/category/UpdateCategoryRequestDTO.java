package com.tmdt.fashion_shop.dto.category;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCategoryRequestDTO {
    private String name;
    private String parentId;
}
