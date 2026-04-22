package com.tmdt.fashion_shop.service.revenue;

import com.tmdt.fashion_shop.dto.revenue.RevenueByDateDTO;
import com.tmdt.fashion_shop.dto.revenue.RevenueByMonthDTO;
import com.tmdt.fashion_shop.dto.revenue.RevenueSummaryDTO;
import com.tmdt.fashion_shop.repository.OrderItemRepository;
import com.tmdt.fashion_shop.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RevenueServiceImpl implements RevenueService{

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public RevenueSummaryDTO getSummary(LocalDate from, LocalDate to) {

        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.atTime(23, 59, 59);

        double totalRevenue = orderRepository.getRevenueBetween(fromDateTime, toDateTime);
        long totalOrders = orderRepository.getOrdersBetween(fromDateTime, toDateTime);
        long totalProductsSold = orderItemRepository.getProductsSoldBetween(fromDateTime, toDateTime);

        return new RevenueSummaryDTO(
                totalRevenue,
                totalOrders,
                totalProductsSold
        );
    }
    @Override
    public List<RevenueByDateDTO> getRevenueByDate(LocalDate from, LocalDate to) {

        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.atTime(23, 59, 59);

        List<Object[]> result = orderRepository.getRevenueByDate(fromDateTime, toDateTime);

        return result.stream()
                .map(obj -> new RevenueByDateDTO(
                        obj[0].toString(),
                        ((Number) obj[1]).doubleValue()
                ))
                .toList();
    }
    @Override
    public List<RevenueByMonthDTO> getRevenueByMonth(int year) {

        List<Object[]> result = orderRepository.getRevenueByMonth(year);

        // map data DB
        Map<Integer, Double> map = new HashMap<>();

        for (Object[] row : result) {
            Integer month = (Integer) row[0];
            Double revenue = (Double) row[1];
            map.put(month, revenue);
        }

        // đảm bảo đủ 12 tháng
        List<RevenueByMonthDTO> response = new ArrayList<>();

        for (int i = 1; i <= 12; i++) {
            double revenue = map.getOrDefault(i, 0.0);

            response.add(new RevenueByMonthDTO(
                    String.format("%02d", i),
                    revenue
            ));
        }

        return response;
    }
}