/**
 * EAZY VIBES - VOUCHERS CORE
 * Chỉnh sửa: Khớp Enum AMOUNT và xử lý lỗi Header 400
 */

const API_VOUCHERS = "/api/vouchers";

let currentFilterStatus = "ALL";
let allVouchers = [];

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    // Nếu không có token hoặc không phải admin, đá về trang login ngay lập tức
    if (!token || !role || role.toUpperCase() !== "ADMIN") {
        window.location.href = "/login";
        return;
    }
    loadVouchers();
});

// Hàm lấy Header an toàn
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    };
}

// LOAD DANH SÁCH VOUCHER
async function loadVouchers() {
    const tbody = document.getElementById("voucherTableBody");
    try {
        const res = await fetch(API_VOUCHERS, {
            headers: getAuthHeaders()
        });

        // Nếu backend trả về 400, 401 hoặc 403
        if (!res.ok) {
            if (res.status === 400) throw new Error("Lỗi yêu cầu (400): Header hoặc tham số không hợp lệ.");
            if (res.status === 401 || res.status === 403) window.location.href = "/login";
            throw new Error("Lỗi hệ thống: " + res.status);
        }

        allVouchers = await res.json();
        renderVouchers(allVouchers);
    } catch (e) {
        console.error(e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 50px; color: red; font-weight: 700;">${e.message}</td></tr>`;
    }
}

function renderVouchers(vouchers) {
    const tbody = document.getElementById("voucherTableBody");
    if (!tbody) return;

    let filtered = vouchers;
    if (currentFilterStatus !== "ALL") {
        filtered = vouchers.filter(v => v.status === currentFilterStatus);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 50px; color: #888;">Không có dữ liệu voucher</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(v => `
        <tr>
            <td style="font-weight: 900; color: #000;">${v.code}</td>
            <td style="font-weight: 600; color: #666;">${v.discountType === 'PERCENT' ? 'Phần trăm' : 'Cố định'}</td>
            <td style="font-weight: 900; color: #000;">${v.discountType === 'PERCENT' ? v.discountValue + '%' : formatMoney(v.discountValue)}</td>
            <td style="font-weight: 600;">${formatMoney(v.minOrderValue || 0)}</td>
            <td style="font-weight: 600;">${v.maxDiscount ? formatMoney(v.maxDiscount) : '-'}</td>
            <td style="font-weight: 800;">${v.quantity}</td>
            <td style="text-align: center;">
                <span class="status status-${v.status.toLowerCase()}">${v.status}</span>
            </td>
            <td style="text-align: right;">
                <button class="btn-edit" onclick="editVoucher('${v.id}')" title="Chỉnh sửa">
                    <span class="material-symbols-outlined">edit_square</span>
                </button>
                ${v.status === 'ACTIVE' ? 
                    `<button class="btn-toggle disable" onclick="toggleStatus('${v.id}', 'disable')" title="Khóa voucher">
                        <span class="material-symbols-outlined">block</span>
                    </button>` :
                    `<button class="btn-toggle enable" onclick="toggleStatus('${v.id}', 'enable')" title="Mở lại">
                        <span class="material-symbols-outlined">check_circle</span>
                    </button>`
                }
            </td>
        </tr>
    `).join("");
}

function filterBy(status, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilterStatus = status;
    renderVouchers(allVouchers);
}

function openVoucherModal() {
    document.getElementById("modalTitle").innerText = "TẠO VOUCHER MỚI";
    document.getElementById("voucherForm").reset();
    document.getElementById("voucherId").value = "";
    document.getElementById("voucherModal").style.display = "flex";
    toggleMaxDiscount();
}

function closeVoucherModal() {
    document.getElementById("voucherModal").style.display = "none";
}

function toggleMaxDiscount() {
    const type = document.getElementById("discountType").value;
    const group = document.getElementById("maxDiscountGroup");
    group.style.opacity = (type === "PERCENT") ? "1" : "0.3";
    document.getElementById("maxDiscount").disabled = (type !== "PERCENT");
}

document.getElementById("voucherForm").onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById("voucherId").value;
    
    // Thu thập dữ liệu
    const data = {
        code: document.getElementById("code").value.trim().toUpperCase(),
        discountType: document.getElementById("discountType").value, // Sẽ là PERCENT hoặc AMOUNT
        discountValue: parseFloat(document.getElementById("discountValue").value),
        minOrderValue: parseFloat(document.getElementById("minOrderValue").value) || 0,
        maxDiscount: document.getElementById("maxDiscount").value ? parseFloat(document.getElementById("maxDiscount").value) : null,
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value,
        quantity: parseInt(document.getElementById("quantity").value)
    };

    const url = id ? `${API_VOUCHERS}/${id}` : API_VOUCHERS;
    const method = id ? "PATCH" : "POST";

    try {
        const res = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeVoucherModal();
            loadVouchers();
        } else {
            const errText = await res.text();
            alert("Lỗi từ server: " + (errText || res.status));
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối server.");
    }
};

async function toggleStatus(id, action) {
    if (!confirm(`Xác nhận ${action === 'enable' ? 'kích hoạt' : 'khóa'} voucher?`)) return;
    
    const method = (action === 'enable') ? "PUT" : "DELETE";
    const suffix = (action === 'enable') ? "enable" : "disable";

    try {
        const res = await fetch(`${API_VOUCHERS}/${id}/${suffix}`, {
            method: method,
            headers: getAuthHeaders()
        });
        if (res.ok) loadVouchers();
    } catch (e) {
        console.error(e);
    }
}

function editVoucher(id) {
    const v = allVouchers.find(item => item.id === id);
    if (!v) return;

    document.getElementById("modalTitle").innerText = "CẬP NHẬT VOUCHER";
    document.getElementById("voucherId").value = v.id;
    document.getElementById("code").value = v.code;
    document.getElementById("discountType").value = v.discountType; // Sẽ tự chọn PERCENT/AMOUNT
    document.getElementById("discountValue").value = v.discountValue;
    document.getElementById("minOrderValue").value = v.minOrderValue || 0;
    document.getElementById("maxDiscount").value = v.maxDiscount || "";
    
    // Chuyển định dạng ngày cho datetime-local (yyyy-MM-ddThh:mm)
    if (v.startDate) document.getElementById("startDate").value = v.startDate.substring(0, 16);
    if (v.endDate) document.getElementById("endDate").value = v.endDate.substring(0, 16);
    
    document.getElementById("quantity").value = v.quantity;

    document.getElementById("voucherModal").style.display = "flex";
    toggleMaxDiscount();
}

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}