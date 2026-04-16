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

        // ===== INFO =====
        document.getElementById("orderId").innerText = data.id;
        document.getElementById("status").innerText = formatStatus(data.status);
        document.getElementById("phone").innerText = data.phone;
        document.getElementById("address").innerText = data.deliveryAddress;
        document.getElementById("payment").innerText = data.paymentMethod;
        document.getElementById("createdAt").innerText =
            new Date(data.createdAt).toLocaleString("vi-VN");

        document.getElementById("totalPrice").innerText =
            formatMoney(data.totalPrice);

        // ===== ITEMS =====
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

    } catch (err) {
        console.error(err);
        alert("Không tải được chi tiết đơn");
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