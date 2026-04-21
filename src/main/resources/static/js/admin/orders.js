/**
 * EAZY VIBES - ORDERS CORE
 * Fix: Lỗi lặp lại /uploads/ trong đường dẫn ảnh
 */

const API_ORDERS = "http://localhost:8080/api/orders";
// Sử dụng ảnh placeholder từ dịch vụ ngoài để đảm bảo không bao giờ bị lỗi 404
const FALLBACK_IMG = "https://placehold.co/100x100?text=No+Image";

let currentStatus = "";
let currentSort = "neweast";
let currentEditingOrderId = null;

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    if (!role || role.toUpperCase() !== "ADMIN") {
        window.location.href = "/login";
        return;
    }
    loadOrders();
});

// LOAD DANH SÁCH ĐƠN HÀNG
async function loadOrders() {
    const tbody = document.getElementById("orderTableBody");
    try {
        const token = localStorage.getItem("token");
        let url = `${API_ORDERS}/admin?sort=${currentSort}`;
        if (currentStatus && currentStatus !== "ALL") {
            url += `&status=${currentStatus}`;
        }

        const res = await fetch(url, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!res.ok) throw new Error("API ERROR");
        const data = await res.json();
        const orders = data.content || data;
        renderOrders(orders);
    } catch (e) {
        console.error(e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 50px; color: red; font-weight: 700;">LỖI KẾT NỐI API</td></tr>`;
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById("orderTableBody");
    if (!tbody) return;
    if (!Array.isArray(orders) || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 50px; color: #888;">Không có đơn hàng nào</td></tr>`;
        return;
    }
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td style="font-weight: 700; color: #000;">#${o.id.substring(0, 8)}</td>
            <td>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 900; color: #000; text-transform: uppercase; font-size: 13px;">KHÁCH HÀNG</span>
                    <span style="font-size: 11px; color: #999; font-weight: 600;">${o.phone || 'N/A'}</span>
                </div>
            </td>
            <td style="color: #888; font-weight: 600;">${o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '---'}</td>
            <td style="font-weight: 900; color: #000;">${formatMoney(o.totalPrice)}</td>
            <td style="text-align: center;">
                <span class="status status-${(o.status || 'PENDING').toLowerCase()}">${o.status || 'PENDING'}</span>
            </td>
            <td style="text-align: right;">
                <button class="btn-view" onclick="viewOrderDetail('${o.id}')" title="Xem sản phẩm">
                    <span class="material-symbols-outlined">visibility</span>
                </button>
                <button class="btn-edit" onclick="openStatusModal('${o.id}', '${o.status}')" title="Sửa trạng thái">
                    <span class="material-symbols-outlined">edit_square</span>
                </button>
            </td>
        </tr>
    `).join("");
}

/**
 * XEM CHI TIẾT ĐƠN HÀNG (FIX ẢNH THẬT)
 */
async function viewOrderDetail(id) {
    const token = localStorage.getItem("token");
    const tbody = document.getElementById("detailTableBody");
    
    document.getElementById("detailOrderId").innerText = `Đang tải mã đơn #${id.substring(0, 8)}...`;
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 30px;">Đang lấy dữ liệu sản phẩm...</td></tr>`;
    document.getElementById("orderDetailModal").style.display = "flex";

    try {
        const res = await fetch(`${API_ORDERS}/${id}`, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!res.ok) throw new Error("API ERROR");
        const order = await res.json();

        document.getElementById("detailOrderId").innerText = `Mã đơn: #${order.id}`;
        document.getElementById("detailDiscount").innerText = formatMoney(order.voucher ? order.voucher.discountValue : 0);
        document.getElementById("detailTotal").innerText = formatMoney(order.totalPrice);

        if (order.items && order.items.length > 0) {
            tbody.innerHTML = order.items.map(item => {
                
                // LOGIC FIX ẢNH THẬT:
                let imgUrl = FALLBACK_IMG;
                if (item.image) {
                    // Nếu Backend đã trả về "/uploads/filename.jpg" -> Không nối thêm /uploads/
                    if (item.image.startsWith('/uploads/') || item.image.startsWith('http')) {
                        imgUrl = item.image; 
                    } else {
                        // Nếu chỉ có tên file -> Nối thêm /uploads/
                        imgUrl = "/uploads/" + item.image;
                    }
                }

                return `
                <tr>
                    <td>
                        <div class="prod-info">
                            <img src="${imgUrl}" class="prod-img" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">
                            <span class="prod-name">${item.productName}</span>
                        </div>
                    </td>
                    <td style="font-size: 12px; color: #666; font-weight: 700;">
                        ${item.color} / ${item.size}
                    </td>
                    <td style="text-align: center; font-weight: 900;">x${item.quantity}</td>
                    <td style="text-align: right; font-weight: 800;">${formatMoney(item.price)}</td>
                </tr>
            `}).join("");
        } else {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">Không có dữ liệu sản phẩm.</td></tr>`;
        }

    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Lỗi tải chi tiết đơn hàng.</td></tr>`;
    }
}

function closeDetailModal() {
    document.getElementById("orderDetailModal").style.display = "none";
}

// CÁC HÀM KHÁC
function filterBy(status, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentStatus = (status === 'ALL') ? "" : status;
    loadOrders();
}

function changeSort(sortValue) {
    currentSort = sortValue;
    loadOrders();
}

function openStatusModal(id, currentStatus) {
    currentEditingOrderId = id;
    currentStatus = currentStatus.toUpperCase();
    document.getElementById("modalOrderIdText").innerText = `Đơn hàng: #${id.substring(0, 8)}...`;
    const buttons = document.querySelectorAll(".btn-status");
    buttons.forEach(btn => btn.style.display = "none");

    if (currentStatus === "PAID") {
        document.getElementById("btn-pending").style.display = "block";
        document.getElementById("btn-shipping").style.display = "block";
        document.getElementById("btn-cancelled").style.display = "block";
    } else if (currentStatus === "PENDING") {
        document.getElementById("btn-shipping").style.display = "block";
        document.getElementById("btn-cancelled").style.display = "block";
    } else if (currentStatus === "SHIPPING") {
        document.getElementById("btn-completed").style.display = "block";
    }
    document.getElementById("statusModal").style.display = "flex";
}

function closeModal() { document.getElementById("statusModal").style.display = "none"; }

async function confirmStatus(newStatus) {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_ORDERS}/${currentEditingOrderId}/status`, {
            method: "PUT",
            headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) { closeModal(); loadOrders(); }
    } catch (e) { console.error(e); }
}

function formatMoney(amount) {
    const number = Number(amount);
    if (isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
}