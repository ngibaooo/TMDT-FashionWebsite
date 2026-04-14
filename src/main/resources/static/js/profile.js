const API_USER = "http://localhost:8080/api/users/me";
const API_ORDERS = "http://localhost:8080/api/orders/my-orders";

// ===== ELEMENTS =====
const btnAccount = document.getElementById("btnAccount");
const btnOrders = document.getElementById("btnOrders");

const accountSection = document.getElementById("accountSection");
const ordersSection = document.getElementById("ordersSection");

const grid = document.querySelector(".grid");

const filterStatus = document.getElementById("filterStatus");
const sortOrder = document.getElementById("sortOrder");

// ===== TAB SWITCH =====
function switchTab(tab) {
    const isOrders = tab === "orders";

    accountSection.classList.toggle("active-section", !isOrders);
    ordersSection.classList.toggle("active-section", isOrders);

    btnAccount.classList.toggle("active", !isOrders);
    btnOrders.classList.toggle("active", isOrders);

    grid.classList.toggle("orders-mode", isOrders);

    localStorage.setItem("activeTab", tab);
}

btnAccount.onclick = () => switchTab("account");
btnOrders.onclick = () => switchTab("orders");

function restoreTab() {
    switchTab(localStorage.getItem("activeTab") || "account");
}

// ===== PROFILE =====
async function loadProfile() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Chưa đăng nhập");
        return window.location.href = "/login";
    }

    try {
        const res = await fetch(API_USER, {
            headers: { Authorization: "Bearer " + token }
        });

        const user = await res.json();

        document.getElementById("avatar").src =
            "http://localhost:8080/uploads/" + user.avatar;

        document.getElementById("userId").innerText = user.id;
        document.getElementById("name").innerText = user.name;
        document.getElementById("phone").innerText = user.phone;
        document.getElementById("address").innerText =
            user.address || "Chưa cập nhật";

        const createdDate = new Date(user.createdAt);
        document.getElementById("memberSince").innerText =
            !isNaN(createdDate) ? createdDate.getFullYear() : "N/A";

    } catch {
        logout();
    }
}

// ===== ORDERS =====
async function loadOrders() {
    const token = localStorage.getItem("token");

    let url = API_ORDERS;
    const params = [];

    if (filterStatus.value) params.push(`status=${filterStatus.value}`);
    if (sortOrder.value) params.push(`sort=${sortOrder.value}`);

    if (params.length) url += "?" + params.join("&");

    try {
        const res = await fetch(url, {
            headers: { Authorization: "Bearer " + token }
        });

        const orders = await res.json();
        renderOrders(orders);

    } catch (err) {
        console.error(err);
    }
}

function renderOrders(orders) {
    const table = document.getElementById("orderTable");
    table.innerHTML = "";

    if (!Array.isArray(orders) || orders.length === 0) {
        table.innerHTML = `<tr><td colspan="5">Không có đơn hàng</td></tr>`;
        updateSummary(0, 0);
        return;
    }

    let totalSpent = 0;

    orders.forEach(order => {
        totalSpent += Number(order.totalPrice) || 0;

        table.innerHTML += `
            <tr>
                <td>#${order.id.slice(0, 8)}</td>
                <td>${formatDate(order.createdAt)}</td>
                <td>
                    <span class="status ${order.status}">
                        ${formatStatus(order.status)}
                    </span>
                </td>
                <td>${formatMoney(order.totalPrice)}</td>
                <td>
                    <button class="btn-view" onclick="viewOrder('${order.id}')">
                        Xem chi tiết
                    </button>
                </td>
            </tr>
        `;
    });

    updateSummary(orders.length, totalSpent);
}

function updateSummary(totalOrders, totalSpent) {
    document.getElementById("totalOrders").innerText = totalOrders;
    document.getElementById("totalSpent").innerText = formatMoney(totalSpent);
}

// ===== EVENTS =====
filterStatus.onchange = loadOrders;
sortOrder.onchange = loadOrders;

// ===== NAVBAR =====
document.getElementById("cartIcon").onclick = () => {
    window.location.href = "/cart.html";
};

const accountIcon = document.getElementById("accountIcon");
const dropdown = document.getElementById("accountDropdown");

accountIcon.onclick = () => {
    dropdown.classList.toggle("show");
};

document.addEventListener("click", (e) => {
    if (!e.target.closest(".account-wrapper")) {
        dropdown.classList.remove("show");
    }
});

document.getElementById("btnProfile").onclick = () => {
    window.location.href = "http://localhost:8080/user/profile";
};

document.getElementById("btnLogout").onclick = logout;

// ===== UTIL =====
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("vi-VN");
}

function formatMoney(amount) {
    const number = Number(amount);
    if (isNaN(number)) return "0 ₫";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(number);
}

function formatStatus(status) {
    const map = {
        PENDING: "Chờ xác nhận",
        PAID: "Đã thanh toán",
        FAILED: "Thanh toán thất bại",
        SHIPPING: "Đang giao",
        COMPLETED: "Đã hoàn thành",
        CANCELLED: "Đã hủy"
    };
    return map[status] || "Không xác định";
}

function viewOrder(id) {
    window.location.href = `/order-detail?id=${id}`;
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
}

// ===== INIT =====
restoreTab();
loadProfile();
loadOrders();