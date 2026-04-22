package com.tmdt.fashion_shop.dto.revenue;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class RevenueByMonthDTO {
    private String month;
    private double revenue;
}