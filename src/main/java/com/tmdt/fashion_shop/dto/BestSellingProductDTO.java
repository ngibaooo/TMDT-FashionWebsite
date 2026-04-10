package com.tmdt.fashion_shop.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BestSellingProductDTO {

    private String id;
    private String name;
    private double price;
    private Long totalSold;

    public BestSellingProductDTO(String id, String name, double price, Long totalSold) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.totalSold = totalSold;
    }

}
