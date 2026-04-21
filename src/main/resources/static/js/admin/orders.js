/**
 * EAZY VIBES - ORDERS SYSTEM
 * Chỉnh sửa: Thay CONFIRMED thành PENDING trong Modal, giữ nhãn KHÁCH HÀNG
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

// Tải dữ liệu từ Server
async function loadOrders() {
    const tbody = document.getElementById("orderTableBody");
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(API_ORDERS, {
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error("API ERROR");

        const data = await res.json();
        allOrders = data.content || data;
        renderOrders(allOrders);

    } catch (e) {
        console.error("Load orders error:", e);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 50px; color: red;">Lỗi kết nối API</td></tr>`;
        }
    }
}

// Vẽ bảng dữ liệu
function renderOrders(orders) {
    const tbody = document.getElementById("orderTableBody");
    if (!tbody) return;

    if (!Array.isArray(orders) || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 50px; color: #888;">Không tìm thấy đơn hàng nào</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td style="font-weight: 700;">#${o.id}</td>
            <td>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 700; color: #000;">KHÁCH HÀNG</span>
                    <span style="font-size: 11px; color: #888;">${o.phone || 'N/A'}</span>
                </div>
            </td>
            <td style="color: #666;">${o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '---'}</td>
            <td style="font-weight: 700;">${formatMoney(o.totalPrice)}</td>
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

// --- LOGIC MODAL ---

function openStatusModal(id, current) {
    currentEditingOrderId = id;
    document.getElementById("modalOrderIdText").innerText = `Đơn hàng: #${id}`;
    document.getElementById("statusModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("statusModal").style.display = "none";
    currentEditingOrderId = null;
}

// Hàm xác nhận từ nút bấm trong Modal
async function confirmStatus(newStatus) {
    if (!currentEditingOrderId) return;

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_ORDERS}/${currentEditingOrderId}/status`, {
            method: "PUT",
            headers: { 
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            closeModal();
            loadOrders();
        } else {
            const errorText = await res.text();
            alert("Lỗi cập nhật: " + errorText);
        }
    } catch (e) {
        console.error(e);
    }
}

// --- BỘ LỌC ---
function filterBy(status, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (!allOrders || allOrders.length === 0) return;

    let filtered = [];
    if (status === 'ALL') {
        filtered = allOrders;
    } else if (status === 'PENDING') {
        filtered = allOrders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PAID');
    } else if (status === 'DELIVERED') {
        filtered = allOrders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED');
    } else {
        filtered = allOrders.filter(o => o.status === status);
    }
    renderOrders(filtered);
}

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount || 0);
}