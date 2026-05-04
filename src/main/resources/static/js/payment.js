/**
 * EAZY VIBES - PAYMENT ENGINE
 * Cập nhật hệ thống thông báo chuyên nghiệp
 */

const API_CART = "http://localhost:8080/api/cart";
const API_ORDER = "http://localhost:8080/api/orders";
const API_VOUCHER = "http://localhost:8080/api/vouchers/apply";

let currentVoucher = null;
let originalPrice = 0;
let discount = 0;
let finalPrice = 0;

// ===== HELPER: THÔNG BÁO CHUYÊN NGHIỆP =====
const notify = {
    toast: (msg, icon = 'success') => {
        if (typeof Swal === 'undefined') { alert(msg); return; }
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#000',
            color: '#fff'
        });
        Toast.fire({ icon: icon, title: msg });
    },
    popup: (title, msg, icon = 'warning') => {
        if (typeof Swal === 'undefined') { alert(title + ": " + msg); return; }
        Swal.fire({
            title: title.toUpperCase(),
            text: msg,
            icon: icon,
            background: '#fff',
            color: '#000',
            confirmButtonColor: '#000',
            confirmButtonText: '<span style="font-weight:900;">ĐÃ HIỂU</span>',
            customClass: { popup: 'ez-swal-popup' }
        });
    }
};

async function loadOrder() {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }

    try {
        const res = await fetch(API_CART, {
            headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();

        const activeItems = data.items.filter(i => i.variantStatus === "ACTIVE");
        originalPrice = activeItems.reduce((sum, i) => sum + i.total, 0);
        finalPrice = originalPrice;

        renderOrder(activeItems);
        updateSummary();
    } catch (err) {
        console.error(err);
    }
}

function renderOrder(items) {
    const container = document.getElementById("orderItems");
    container.innerHTML = "";

    if (!items || items.length === 0) {
        container.innerHTML = "<p style='font-weight:700; text-align:center; padding: 20px;'>Giỏ hàng của bạn đang trống</p>";
        return;
    }

    items.forEach(i => {
        container.innerHTML += `
            <div class="item">
                <div style="display:flex; gap:15px; align-items:center;">
                    <img src="http://localhost:8080${i.image}" class="thumb"/>
                    <div>
                        <div class="name">${i.productName}</div>
                        <div class="meta">SIZE: ${i.size} | MÀU: ${i.color}</div>
                        <div class="qty">x${i.quantity}</div>
                    </div>
                </div>
                <div class="price">${formatMoney(i.price)}</div>
            </div>
        `;
    });
}

function updateSummary() {
    document.getElementById("originalPrice").innerText = formatMoney(originalPrice);
    document.getElementById("discount").innerText = formatMoney(discount);
    document.getElementById("totalPrice").innerText = formatMoney(finalPrice);
}

async function applyVoucher() {
    const token = localStorage.getItem("token");
    const code = document.getElementById("voucher").value.trim();
    const text = document.getElementById("discountText");

    if (!code) {
        notify.toast("Vui lòng nhập mã voucher", "warning");
        return;
    }

    try {
        const res = await fetch(API_VOUCHER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ code })
        });

        const data = await res.json();

        if (!res.ok) {
            text.innerText = data.message || "Voucher không hợp lệ";
            text.className = "error";
            discount = 0;
            finalPrice = originalPrice;
            currentVoucher = null;
            updateSummary();
            notify.toast("Mã giảm giá không hợp lệ", "error");
            return;
        }

        currentVoucher = code;
        discount = data.discount;
        finalPrice = data.finalPrice;

        text.innerText = "Đã áp dụng voucher: -" + formatMoney(discount);
        text.className = "success";

        updateSummary();
        notify.toast("Áp dụng voucher thành công!");

    } catch (err) {
        notify.toast("Lỗi kết nối server", "error");
    }
}

async function placeOrder() {
    const token = localStorage.getItem("token");
    const address = document.getElementById("address").value;
    const phone = document.getElementById("phone").value;
    const btnOrder = document.getElementById("btn-place-order");

    if (!address || !phone) {
        notify.popup("Thiếu thông tin", "Vui lòng nhập địa chỉ và số điện thoại giao hàng!", "warning");
        return;
    }

    const body = {
        address: address,
        phone: phone,
        paymentMethod: document.getElementById("payment").value,
        voucherCode: currentVoucher
    };

    btnOrder.innerText = "ĐANG XỬ LÝ...";
    btnOrder.disabled = true;

    try {
        const res = await fetch(API_ORDER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            notify.popup("Đặt hàng thất bại", data.message || "Có lỗi xảy ra, vui lòng thử lại.", "error");
            btnOrder.innerText = "ĐẶT HÀNG";
            btnOrder.disabled = false;
            return;
        }

        if (body.paymentMethod === "VNPAY") {
            window.location.href = `/vnpay?orderId=${data.orderId}&amount=${finalPrice}`;
        } else {
            notify.popup("Thành công", "Đơn hàng của bạn đã được tiếp nhận!", "success");
            setTimeout(() => {
                window.location.href = "/user/cart";
            }, 2000);
        }

    } catch (err) {
        notify.toast("Lỗi kết nối server", "error");
        btnOrder.innerText = "ĐẶT HÀNG";
        btnOrder.disabled = false;
    }
}

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
}

loadOrder();