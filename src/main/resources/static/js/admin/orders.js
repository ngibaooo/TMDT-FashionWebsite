/**
 * EAZY VIBES - ORDERS CORE
 */

const API_ORDERS = "http://localhost:8080/api/orders";
let allOrders = [];
let currentEditingOrderId = null;

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    if (!role || role.toUpperCase() !== "ADMIN") {
        window.location.href = "/login";
        return;
    }
    loadOrders();
});

async function loadOrders() {
    const tbody = document.getElementById("orderTableBody");
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(API_ORDERS, {
            headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error("API ERROR");
        const data = await res.json();
        allOrders = data.content || data;
        renderOrders(allOrders);
    } catch (e) {
        console.error(e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 50px; color: red;">Lỗi kết nối API</td></tr>`;
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById("orderTableBody");
    if (!tbody) return;
    if (!Array.isArray(orders) || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 50px; color: #888;">Không tìm thấy đơn hàng nào</td></tr>`;
        return;
    }
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td style="font-weight: 700; color: #000;">#${o.id}</td>
            <td>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 900; color: #000; text-transform: uppercase; font-size: 14px;">KHÁCH HÀNG</span>
                    <span style="font-size: 11px; color: #999; font-weight: 600;">${o.phone || '0000000000'}</span>
                </div>
            </td>
            <td style="color: #888; font-weight: 600;">${o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '---'}</td>
            <td style="font-weight: 900; color: #000;">${formatMoney(o.totalPrice)}</td>
            <td style="text-align: center;">
                <span class="status status-${(o.status || 'PENDING').toLowerCase()}">${o.status || 'PENDING'}</span>
            </td>
            <td style="text-align: right;">
                <button class="btn-edit" onclick="openStatusModal('${o.id}', '${o.status}')">
                    <span class="material-symbols-outlined">edit_square</span>
                </button>
            </td>
        </tr>
    `).join("");
}

function openStatusModal(id, currentStatus) {
    currentEditingOrderId = id;
    currentStatus = currentStatus.toUpperCase();
    document.getElementById("modalOrderIdText").innerText = `Đơn hàng: #${id}`;

    // Reset hiển thị nút
    const buttons = document.querySelectorAll(".btn-status");
    buttons.forEach(btn => btn.style.display = "none");

    // LOGIC CHỈNH SỬA THEO YÊU CẦU CỦA BẠN
    if (currentStatus === "PAID") {
        // PAID: Có thể về PENDING, hoặc lên SHIPPING, CANCELLED
        document.getElementById("btn-pending").style.display = "block";
        document.getElementById("btn-shipping").style.display = "block";
        document.getElementById("btn-cancelled").style.display = "block";
    } 
    else if (currentStatus === "PENDING") {
        // PENDING: Chỉ có thể lên SHIPPING hoặc CANCELLED (Ẩn nút PAID)
        document.getElementById("btn-shipping").style.display = "block";
        document.getElementById("btn-cancelled").style.display = "block";
    } 
    else if (currentStatus === "SHIPPING") {
        // SHIPPING: Chỉ có thể thành COMPLETED
        document.getElementById("btn-completed").style.display = "block";
    }

    document.getElementById("statusModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("statusModal").style.display = "none";
    currentEditingOrderId = null;
}

async function confirmStatus(newStatus) {
    if (!currentEditingOrderId) return;
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_ORDERS}/${currentEditingOrderId}/status`, {
            method: "PUT",
            headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            closeModal();
            loadOrders();
        } else {
            const err = await res.text();
            alert("Lỗi Backend: " + err);
        }
    } catch (e) {
        console.error(e);
    }
}

function filterBy(status, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (!allOrders || allOrders.length === 0) return;
    let filtered = [];
    if (status === 'ALL') filtered = allOrders;
    else if (status === 'PENDING') filtered = allOrders.filter(o => o.status === 'PENDING' || o.status === 'PAID');
    else if (status === 'DELIVERED') filtered = allOrders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED');
    else if (status === 'CANCELLED_FAILED') filtered = allOrders.filter(o => o.status === 'CANCELLED' || o.status === 'FAILED');
    else filtered = allOrders.filter(o => o.status === status);
    renderOrders(filtered);
}

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
}