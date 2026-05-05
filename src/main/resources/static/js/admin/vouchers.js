/**
 * EAZY VIBES - VOUCHERS CORE
 * Chỉnh sửa: Thay thế alert/confirm bằng SweetAlert2
 */

const API_VOUCHERS = "/api/vouchers";

let currentFilterStatus = "ALL";
let allVouchers = [];
let currentPage = 1;
const pageSize = 5;

// Helper thông báo đồng bộ
const notify = {
    toast: (msg, icon = 'success') => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            icon: icon,
            title: msg
        });
    },
    popup: (title, msg, icon = 'warning') => {
        return Swal.fire({
            title: title,
            text: msg,
            icon: icon,
            confirmButtonColor: '#000'
        });
    },
    confirm: async (title, text) => {
        const result = await Swal.fire({
            title: title,
            text: text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#000',
            cancelButtonColor: '#d33'
        });
        return result.isConfirmed;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token || !role || role.toUpperCase() !== "ADMIN") {
        window.location.href = "/login";
        return;
    }
    loadVouchers();
});

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    };
}

async function loadVouchers() {
    const tbody = document.getElementById("voucherTableBody");
    try {
        const res = await fetch(API_VOUCHERS, {
            headers: getAuthHeaders()
        });

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
    const pagination = document.getElementById("pagination");
    if (!tbody) return;

    let filtered = vouchers;
    if (currentFilterStatus !== "ALL") {
        filtered = vouchers.filter(v => v.status === currentFilterStatus);
    }

    const totalPages = Math.ceil(filtered.length / pageSize);
    if (currentPage > totalPages) currentPage = 1;

    const start = (currentPage - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    if (paginated.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 50px; color: #888;">Không có dữ liệu voucher</td></tr>`;
        pagination.innerHTML = "";
        return;
    }

    tbody.innerHTML = paginated.map(v => `
        <tr>
            <td style="font-weight: 900;">${v.code}</td>
            <td>${v.discountType === 'PERCENT' ? 'Phần trăm' : 'Cố định'}</td>
            <td style="font-weight: 900;">
                ${v.discountType === 'PERCENT' ? v.discountValue + '%' : formatMoney(v.discountValue)}
            </td>
            <td>${formatMoney(v.minOrderValue || 0)}</td>
            <td>${v.maxDiscount ? formatMoney(v.maxDiscount) : '-'}</td>
            <td>${v.quantity}</td>
            <td style="text-align: center;">
                <span class="status status-${v.status.toLowerCase()}">${v.status}</span>
            </td>
            <td style="text-align: right;">
                <button class="btn-edit" onclick="editVoucher('${v.id}')">
                    <span class="material-symbols-outlined">edit_square</span>
                </button>
                ${v.status === 'ACTIVE' ?
                    `<button class="btn-toggle disable" onclick="toggleStatus('${v.id}', 'disable')">
                        <span class="material-symbols-outlined">block</span>
                    </button>` :
                    `<button class="btn-toggle enable" onclick="toggleStatus('${v.id}', 'enable')">
                        <span class="material-symbols-outlined">check_circle</span>
                    </button>`
                }
            </td>
        </tr>
    `).join("");

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const container = document.getElementById("pagination");
    if (!container) return;

    let html = "";
    html += `<button ${currentPage === 1 ? "disabled" : ""} onclick="changePage(${currentPage - 1})">‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    html += `<button ${currentPage === totalPages ? "disabled" : ""} onclick="changePage(${currentPage + 1})">›</button>`;
    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderVouchers(allVouchers);
}

function filterBy(status, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilterStatus = status;
    currentPage = 1;
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
    
    const data = {
        code: document.getElementById("code").value.trim().toUpperCase(),
        discountType: document.getElementById("discountType").value,
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
            notify.toast(id ? "Cập nhật voucher thành công!" : "Tạo voucher mới thành công!");
            closeVoucherModal();
            loadVouchers();
        } else {
            const errText = await res.text();
            notify.popup("Lỗi từ server", errText || "Không thể thực hiện yêu cầu.", "error");
        }
    } catch (e) {
        console.error(e);
        notify.popup("Lỗi kết nối", "Không thể kết nối đến server.", "error");
    }
};

async function toggleStatus(id, action) {
    const confirmed = await notify.confirm(
        "Xác nhận", 
        `Bạn có chắc chắn muốn ${action === 'enable' ? 'kích hoạt' : 'khóa'} voucher này?`
    );
    if (!confirmed) return;
    
    const method = (action === 'enable') ? "PUT" : "DELETE";
    const suffix = (action === 'enable') ? "enable" : "disable";

    try {
        const res = await fetch(`${API_VOUCHERS}/${id}/${suffix}`, {
            method: method,
            headers: getAuthHeaders()
        });
        if (res.ok) {
            notify.toast("Cập nhật trạng thái thành công!");
            loadVouchers();
        } else {
            notify.popup("Thất bại", "Không thể thay đổi trạng thái voucher.", "error");
        }
    } catch (e) {
        console.error(e);
        notify.popup("Lỗi hệ thống", "Đã xảy ra lỗi khi gọi API.", "error");
    }
}

function editVoucher(id) {
    const v = allVouchers.find(item => item.id === id);
    if (!v) return;

    document.getElementById("modalTitle").innerText = "CẬP NHẬT VOUCHER";
    document.getElementById("voucherId").value = v.id;
    document.getElementById("code").value = v.code;
    document.getElementById("discountType").value = v.discountType;
    document.getElementById("discountValue").value = v.discountValue;
    document.getElementById("minOrderValue").value = v.minOrderValue || 0;
    document.getElementById("maxDiscount").value = v.maxDiscount || "";
    
    if (v.startDate) document.getElementById("startDate").value = v.startDate.substring(0, 16);
    if (v.endDate) document.getElementById("endDate").value = v.endDate.substring(0, 16);
    
    document.getElementById("quantity").value = v.quantity;

    document.getElementById("voucherModal").style.display = "flex";
    toggleMaxDiscount();
}

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}