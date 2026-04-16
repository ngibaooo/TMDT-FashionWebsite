const API_CART = "http://localhost:8080/api/cart";
const API_ORDER = "http://localhost:8080/api/orders";
const API_VOUCHER = "http://localhost:8080/api/vouchers/apply";

let currentVoucher = null;
let originalPrice = 0;
let discount = 0;
let finalPrice = 0;

async function loadOrder() {
    console.log("RUN LOAD ORDER");

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(API_CART, {
            headers: { Authorization: "Bearer " + token }
        });

        const data = await res.json();
        console.log("CART DATA:", data);

        originalPrice = data.totalPrice;
        finalPrice = data.totalPrice;

        renderOrder(data.items);
        updateSummary();

    } catch (err) {
        console.error(err);
    }
}

function renderOrder(items) {
    const container = document.getElementById("orderItems");
    container.innerHTML = "";

    if (!items || items.length === 0) {
        container.innerHTML = "<p>Không có sản phẩm</p>";
        return;
    }

    items.forEach(i => {
    container.innerHTML += `
        <div class="item">
            <div style="display:flex; gap:10px; align-items:center;">
                <img src="http://localhost:8080${i.image}" class="thumb"/>

                <div>
                    <div class="name">${i.productName}</div>
                    <div class="meta">Size: ${i.size} | Màu: ${i.color}</div>
                    <div class="qty">x${i.quantity}</div>
                </div>
            </div>

            <div class="price">
                ${formatMoney(i.price)}
            </div>
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
        text.innerText = "Vui lòng nhập mã voucher";
        text.className = "error";
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

            // reset lại giá gốc
            discount = 0;
            finalPrice = originalPrice;
            currentVoucher = null;

            updateSummary();
            return;
        }

        currentVoucher = code;

//        originalPrice = data.originalPrice;
        discount = data.discount;
        finalPrice = data.finalPrice;

        text.innerText = "Đã áp dụng voucher: -" + formatMoney(discount);
        text.className = "success";

        updateSummary();

    } catch (err) {
        console.error(err);

        text.innerText = "Lỗi kết nối server";
        text.className = "error";

        // reset
        discount = 0;
        finalPrice = originalPrice;
        currentVoucher = null;

        updateSummary();
    }
}

async function placeOrder() {
    const token = localStorage.getItem("token");

    const body = {
        address: document.getElementById("address").value,
        phone: document.getElementById("phone").value,
        paymentMethod: document.getElementById("payment").value,
        voucherCode: currentVoucher
    };

    if (!body.address || !body.phone) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

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
            alert(data.message || "Đặt hàng thất bại");
            return;
        }

//        if (body.paymentMethod === "VNPAY") {
//            alert("Redirect sang VNPAY (giả lập)");
//            window.location.href = "/payment-success?orderId=" + data.orderId;
//        }
//        if (body.paymentMethod === "VNPAY") {
//            // chuyển sang trang giả lập VNPAY
////            window.location.href = `/vnpay.html?orderId=${data.orderId}&amount=${finalPrice}`;
//            window.location.href = "/vnpay?orderId=${data.orderId}&amount=${finalPrice}";
//        }
        if (body.paymentMethod === "VNPAY") {
            window.location.href = `/vnpay?orderId=${data.orderId}&amount=${finalPrice}`;
        }
        else {
            alert("Đặt hàng thành công!");
            window.location.href = "/user/cart";
        }

    } catch (err) {
        console.error(err);
    }
}

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
}

loadOrder();