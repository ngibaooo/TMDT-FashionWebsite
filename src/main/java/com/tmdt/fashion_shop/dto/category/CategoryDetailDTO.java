package com.tmdt.fashion_shop.dto.category;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDetailDTO {

    private String id;
    private String name;

    // PARENT
    private String parentId;
    private String parentName;

    //  CHILDREN
    private List<CategoryChildDTO> children;

    // stats
    private long totalProducts;
}
