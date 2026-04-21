package com.tmdt.fashion_shop.service.orders;

import com.tmdt.fashion_shop.dto.orders.*;
import com.tmdt.fashion_shop.dto.voucher.VoucherDTO;
import com.tmdt.fashion_shop.entity.*;
import com.tmdt.fashion_shop.enums.*;
import com.tmdt.fashion_shop.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final VoucherRepository voucherRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final OrderVoucherRepository orderVoucherRepository;
    private final UserRepository userRepository;

    private void recalcProductStatus(Product product) {

        boolean hasStock = product.getVariants().stream()
                .anyMatch(v -> v.getStatus() == VariantStatus.ACTIVE && v.getQuantity() > 0);
        product.setStatus(hasStock ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK);
    }
    @Override
    @Transactional
    public OrderResponseDTO createOrder(String userId, OrderRequestDTO request) {
        // lấy user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        // Lấy cart
        Cart cart = cartRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Cart không tồn tại"));
        if (user.getStatus() == UserStatus.LOCKED) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }
        List<CartItem> items = cartItemRepository.findByCart_Id(cart.getId())
                .stream()
                .filter(i -> i.getProductVariant().getStatus() == VariantStatus.ACTIVE)
                .toList();

        if (items.isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống");
        }

        // Tính tổng tiền
        double total = items.stream()
                .mapToDouble(i ->
                        i.getProductVariant().getProduct().getPrice() * i.getQuantity()
                )
                .sum();

        double discount = 0;
        Voucher voucher = null;

        // Xử lý voucher
        if (request.getVoucherCode() != null && !request.getVoucherCode().isBlank()) {

            String code = request.getVoucherCode().trim().toUpperCase();

            voucher = voucherRepository.findByCodeCaseSensitive(code)
                    .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

            if (voucher.getStatus() != VoucherStatus.ACTIVE) {
                throw new RuntimeException("Voucher không hoạt động");
            }

            LocalDateTime now = LocalDateTime.now();

            if (now.isBefore(voucher.getStartDate()) || now.isAfter(voucher.getEndDate())) {
                throw new RuntimeException("Voucher hết hạn");
            }

            if (voucher.getQuantity() <= 0) {
                throw new RuntimeException("Voucher đã hết lượt");
            }

            // tính giảm giá
            if (voucher.getDiscountType() == VoucherDiscountType.PERCENT) {
                discount = total * voucher.getDiscountValue() / 100;
            } else {
                discount = voucher.getDiscountValue();
            }

            // không cho vượt quá tổng tiền
            discount = Math.min(discount, total);

            // trừ lượt voucher
            voucher.setQuantity(voucher.getQuantity() - 1);
            voucherRepository.save(voucher);
        }

        double finalPrice = total - discount;

        // 4. Tạo Order
        Order order = new Order();
        order.setId(UUID.randomUUID().toString());
        order.setUser(cart.getUser());
        order.setDeliveryAddress(request.getAddress());
        order.setPhone(request.getPhone());

        try {
            order.setPaymentMethod(
                    PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase())
            );
        } catch (Exception e) {
            throw new RuntimeException("Phương thức thanh toán không hợp lệ");
        }

        // LUÔN PENDING (COD & VNPAY)
        order.setStatus(OrderStatus.PENDING);
        order.setTotalPrice(finalPrice);
        order.setCreatedAt(LocalDateTime.now());

        orderRepository.save(order);

        // Lưu OrderVoucher
        if (voucher != null) {
            OrderVoucher ov = new OrderVoucher();
            ov.setId(UUID.randomUUID().toString());
            ov.setOrder(order);
            ov.setVoucher(voucher);

            orderVoucherRepository.save(ov);
        }
        Set<Product> affectedProducts = new HashSet<>();
        // Tạo OrderItem + TRỪ KHO NGAY
        for (CartItem item : items) {

            ProductVariant variant = item.getProductVariant();
            Product product = variant.getProduct();
            if (variant.getStatus() != VariantStatus.ACTIVE) {
                throw new RuntimeException("Sản phẩm không còn bán");
            }
            if (variant.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sản phẩm không đủ hàng");
            }

            // trừ kho
            variant.setQuantity(variant.getQuantity() - item.getQuantity());
            productVariantRepository.save(variant);

            // lưu product để update status sau
            affectedProducts.add(product);

            OrderItem oi = new OrderItem();
            oi.setId(UUID.randomUUID().toString());
            oi.setOrder(order);
            oi.setProductVariant(variant);
            oi.setQuantity(item.getQuantity());
            oi.setPrice(product.getPrice());

            orderItemRepository.save(oi);
        }
        for (Product p : affectedProducts) {
            recalcProductStatus(p);
        }

        // XÓA CART
        cartItemRepository.deleteAll(items);

        return new OrderResponseDTO(
                order.getId(),
                finalPrice,
                order.getStatus().name()
        );
    }

    //    User
    @Override
    public List<OrderDTO> getMyOrders(String userId) {

        List<Order> orders = orderRepository.findByUserId(userId);

        return orders.stream().map(order -> new OrderDTO(
                order.getId(),
                order.getTotalPrice(),
                order.getStatus() != null ? order.getStatus().name() : null,
                order.getPhone(),
                order.getDeliveryAddress(),
                order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
                order.getCreatedAt()
        )).toList();
    }

    //    Admin
    @Override
    public List<OrderDTO> getAllOrders() {

        List<Order> orders = orderRepository.findAll();

        return orders.stream().map(order -> new OrderDTO(
                order.getId(),
                order.getTotalPrice(),
                order.getStatus() != null ? order.getStatus().name() : null,
                order.getPhone(),
                order.getDeliveryAddress(),
                order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
                order.getCreatedAt()
        )).toList();
    }

    @Override
    public OrderDetailDTO getOrderDetail(String userId, String orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order không tồn tại"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");

        // check quyền
        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền xem đơn này");
        }

        List<OrderItem> items = orderItemRepository.findByOrder_Id(orderId);

        List<OrderItemDTO> itemDTOs = items.stream().map(item -> {

            ProductVariant pv = item.getProductVariant();
            String image = null;

            if (pv.getProduct().getImages() != null && !pv.getProduct().getImages().isEmpty()) {
                image = pv.getProduct().getImages().get(0).getImageUrl();
            }

            return new OrderItemDTO(
                    pv.getProduct().getName(),
                    image,
                    pv.getSize().toString(),
                    pv.getColor(),
                    item.getQuantity(),
                    item.getPrice()
            );

        }).toList();

        // USER NAME
        String userName = order.getUser().getName();

        // VOUCHER
        VoucherDTO voucherDTO = null;

        Optional<OrderVoucher> ovOpt = orderVoucherRepository.findByOrder_Id(orderId);

        if (ovOpt.isPresent()) {
            Voucher v = ovOpt.get().getVoucher();

            voucherDTO = new VoucherDTO(
                    v.getCode(),
                    v.getDiscountType(),
                    v.getDiscountValue()
            );
        }

        return new OrderDetailDTO(
                order.getId(),
                order.getTotalPrice(),
                order.getStatus() != null ? order.getStatus().name() : null,
                order.getPhone(),
                order.getDeliveryAddress(),
                order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
                order.getCreatedAt(),
                itemDTOs,
                userName,
                voucherDTO
        );
    }

    @Override
    public List<OrderDTO> getOrders(String userId, String status, String sort) {

        List<Order> orders;

        // FILTER
        if (status != null && !status.isBlank()) {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            orders = orderRepository.findByUserIdAndStatus(userId, orderStatus);
        } else {
            orders = orderRepository.findByUserId(userId);
        }

        // SORT
        if (sort != null) {
            switch (sort) {
                case "price_asc":
                    orders.sort(Comparator.comparing(Order::getTotalPrice));
                    break;
                case "price_desc":
                    orders.sort(Comparator.comparing(Order::getTotalPrice).reversed());
                    break;
                case "oldest":
                    orders.sort(Comparator.comparing(Order::getCreatedAt));
                    break;
                default: // newest
                    orders.sort(Comparator.comparing(Order::getCreatedAt).reversed());
            }
        }

        // MAP DTO
        return orders.stream().map(order -> new OrderDTO(
                order.getId(),
                order.getTotalPrice(),
                order.getStatus() != null ? order.getStatus().name() : null,
                order.getPhone(),
                order.getDeliveryAddress(),
                order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
                order.getCreatedAt()
        )).toList();
    }
    @Override
    public List<OrderDTO> getOrdersForAdmin(String status, String sort) {

        List<Order> orders;

        // ===== FILTER STATUS =====
        if (status != null && !status.isEmpty()) {

            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());

            orders = orderRepository.findByStatus(orderStatus);

        } else {
            orders = orderRepository.findAll();
        }

        // ===== SORT =====
        if (sort != null) {
            switch (sort) {
                case "price_asc":
                    orders.sort(Comparator.comparing(Order::getTotalPrice));
                    break;
                case "price_desc":
                    orders.sort(Comparator.comparing(Order::getTotalPrice).reversed());
                    break;
                case "oldest":
                    orders.sort(Comparator.comparing(Order::getCreatedAt));
                    break;
                default: // newest
                    orders.sort(Comparator.comparing(Order::getCreatedAt).reversed());
            }
        }

        return orders.stream().map(order -> new OrderDTO(
                order.getId(),
                order.getTotalPrice(),
                order.getStatus() != null ? order.getStatus().name() : null,
                order.getPhone(),
                order.getDeliveryAddress(),
                order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
                order.getCreatedAt()
        )).toList();
    }
    @Override
    @Transactional
    public void updateOrderStatus(String orderId, String status) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order không tồn tại"));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Status không hợp lệ");
        }

        OrderStatus currentStatus = order.getStatus();

        // VALIDATE FLOW
        PaymentMethod paymentMethod = order.getPaymentMethod();

        boolean isValid = switch (currentStatus) {

            case PENDING -> {
                if (paymentMethod == PaymentMethod.COD) {
                    yield (newStatus == OrderStatus.SHIPPING ||
                            newStatus == OrderStatus.CANCELLED);
                } else { // VNPAY
                    yield (newStatus == OrderStatus.PAID ||
                            newStatus == OrderStatus.FAILED ||
                            newStatus == OrderStatus.CANCELLED);
                }
            }

            case PAID -> (newStatus == OrderStatus.SHIPPING ||
                    newStatus == OrderStatus.CANCELLED);

            case SHIPPING -> (newStatus == OrderStatus.COMPLETED);

            default -> false;
        };
        // không cho update lại nếu đã COMPLETED
        if (currentStatus == OrderStatus.COMPLETED) {
            throw new RuntimeException("Đơn đã hoàn thành, không thể cập nhật");
        }

        if (!isValid) {
            throw new RuntimeException(
                    "Không thể chuyển từ " + currentStatus + " sang " + newStatus
            );
        }

        // HOÀN KHO
        if (newStatus == OrderStatus.FAILED || newStatus == OrderStatus.CANCELLED) {

            List<OrderItem> items = orderItemRepository.findByOrder_Id(orderId);

            Set<Product> affectedProducts = new HashSet<>();

            for (OrderItem item : items) {

                ProductVariant variant = item.getProductVariant();
                Product product = variant.getProduct();

                // hoàn kho
                variant.setQuantity(variant.getQuantity() + item.getQuantity());
                productVariantRepository.save(variant);

                affectedProducts.add(product);
            }

            // update lại status
            for (Product p : affectedProducts) {
                recalcProductStatus(p);
            }
        }
        // ===== UPDATE STATUS =====
        order.setStatus(newStatus);
        orderRepository.save(order);
    }
    @Override
    public Map<String, Long> getOrderStatusSummary() {

        List<Object[]> result = orderRepository.countOrderByStatus();

        Map<String, Long> map = new HashMap<>();

        // default = 0
        map.put("PENDING", 0L);
        map.put("PAID", 0L);
        map.put("FAILED", 0L);
        map.put("SHIPPING", 0L);
        map.put("COMPLETED", 0L);
        map.put("CANCELLED", 0L);

        for (Object[] row : result) {
            String status = row[0].toString();
            Long count = (Long) row[1];
            map.put(status, count);
        }

        return map;
    }
}