package com.tmdt.fashion_shop.service.revenue;

import com.tmdt.fashion_shop.dto.revenue.RevenueByDateDTO;
import com.tmdt.fashion_shop.dto.revenue.RevenueByMonthDTO;
import com.tmdt.fashion_shop.dto.revenue.RevenueSummaryDTO;

import java.time.LocalDate;
import java.util.List;

public interface RevenueService {
//    public RevenueSummaryDTO getSummary();
    public List<RevenueByDateDTO> getRevenueByDate(LocalDate from, LocalDate to);
    public List<RevenueByMonthDTO> getRevenueByMonth(int year);
    public RevenueSummaryDTO getSummary(LocalDate from, LocalDate to);
}
