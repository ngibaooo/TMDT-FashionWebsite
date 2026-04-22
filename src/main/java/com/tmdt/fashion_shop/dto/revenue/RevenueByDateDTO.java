package com.tmdt.fashion_shop.dto.revenue;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
@AllArgsConstructor
public class RevenueByDateDTO {
    private String date;
    private double revenue;
}