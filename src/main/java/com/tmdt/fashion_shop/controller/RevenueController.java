package com.tmdt.fashion_shop.controller;

import com.tmdt.fashion_shop.dto.revenue.RevenueByDateDTO;
import com.tmdt.fashion_shop.dto.revenue.RevenueByMonthDTO;
import com.tmdt.fashion_shop.dto.revenue.RevenueSummaryDTO;
import com.tmdt.fashion_shop.service.orders.OrderService;
import com.tmdt.fashion_shop.service.revenue.RevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/revenue")
@RequiredArgsConstructor
public class RevenueController {

    private final RevenueService revenueService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public RevenueSummaryDTO getSummary(
            @RequestParam String from,
            @RequestParam String to
    ) {
        return revenueService.getSummary(
                LocalDate.parse(from),
                LocalDate.parse(to)
        );
    }
    @GetMapping("/by-date")
    @PreAuthorize("hasRole('ADMIN')")
    public List<RevenueByDateDTO> getByDate(
            @RequestParam String from,
            @RequestParam String to
    ) {
        return revenueService.getRevenueByDate(
                LocalDate.parse(from),
                LocalDate.parse(to)
        );
    }
    @GetMapping("/by-month")
    @PreAuthorize("hasRole('ADMIN')")
    public List<RevenueByMonthDTO> getRevenueByMonth(
            @RequestParam int year
    ) {
        return revenueService.getRevenueByMonth(year);
    }
}
