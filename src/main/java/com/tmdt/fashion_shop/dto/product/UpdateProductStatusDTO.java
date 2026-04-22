package com.tmdt.fashion_shop.dto.product;

import com.tmdt.fashion_shop.enums.ProductStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProductStatusDTO {
    private ProductStatus status;
}
