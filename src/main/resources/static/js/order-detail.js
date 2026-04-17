const API_ORDER_DETAIL = "http://localhost:8080/api/orders";

function getQuery(param) {
    return new URLSearchParams(window.location.search).get(param);
}

const orderId = getQuery("id");

async function loadOrderDetail() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_ORDER_DETAIL}/${orderId}`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();
const statusEl = document.getElementById("status");

statusEl.innerText = formatStatus(data.status);

// reset class cũ
statusEl.className = "";

// add class mới
statusEl.classList.add(data.status);
        // INFO
        document.getElementById("orderId").innerText = data.id;
        document.getElementById("status").innerText = formatStatus(data.status);
        document.getElementById("phone").innerText = data.phone;
        document.getElementById("address").innerText = data.deliveryAddress;
        document.getElementById("payment").innerText = data.paymentMethod;
        document.getElementById("createdAt").innerText =
            new Date(data.createdAt).toLocaleString("vi-VN");

        document.getElementById("totalPrice").innerText =
            formatMoney(data.totalPrice);
        // NEW: USER
        document.getElementById("userName").innerText =
            data.userName || "N/A";

        // NEW: VOUCHER
        if (data.voucher) {
            const v = data.voucher;

            let discountText = "";

            if (v.discountType === "PERCENT") {
                discountText = `-${v.discountValue}% (${v.code})`;
            } else {
                discountText = `-${formatMoney(v.discountValue)} (${v.code})`;
            }

            document.getElementById("voucher").innerText = discountText;

        } else {
            document.getElementById("voucher").innerText = "Không áp dụng";
        }
        // ITEMS
        const table = document.getElementById("orderItems");
        table.innerHTML = "";

        data.items.forEach(item => {
            table.innerHTML += `
                <tr>
                    <td><img src="${item.image}" /></td>
                    <td>${item.productName}</td>
                    <td>${item.size}</td>
                    <td>${item.color}</td>
                    <td>${item.quantity}</td>
                    <td>${formatMoney(item.price)}</td>
                </tr>
            `;
        });
        // SHOW CANCEL BUTTON
        const cancelBtn = document.getElementById("cancelBtn");

        if (data.status === "PENDING" || data.status === "PAID") {
            cancelBtn.style.display = "inline-block";
        } else {
            cancelBtn.style.display = "none";
        }

    } catch (err) {
        console.error(err);
        alert("Không tải được chi tiết đơn");
    }
}
async function cancelOrder() {
    const token = localStorage.getItem("token");

    if (!confirm("Bạn có chắc muốn hủy đơn này?")) return;

    try {
        const res = await fetch(`${API_ORDER_DETAIL}/${orderId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                status: "CANCELLED"
            })
        });

        if (!res.ok) {
            const err = await res.json();
            alert(err.message || "Hủy đơn thất bại");
            return;
        }

        alert("Hủy đơn thành công!");
        loadOrderDetail(); // reload lại UI

    } catch (err) {
        console.error(err);
        alert("Lỗi khi hủy đơn");
    }
}
function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
}

function formatStatus(status) {
    const map = {
        PENDING: "Chờ xác nhận",
        PAID: "Đã thanh toán",
        FAILED: "Thanh toán thất bại",
        SHIPPING: "Đang giao",
        COMPLETED: "Hoàn thành",
        CANCELLED: "Đã hủy"
    };
    return map[status] || status;
}

function goBack() {
    window.history.back();
}

// INIT
loadOrderDetail();