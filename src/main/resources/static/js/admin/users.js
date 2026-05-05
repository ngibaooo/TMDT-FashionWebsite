/**
 * EAZY VIBES - USERS CORE (FIXED OVERLAP ISSUE)
 */

const API_USERS = "http://localhost:8080/api/users";
let allUsers = []; 
let currentRole = "ALL";
let currentKeyword = "";
let currentSort = "newest";
let currentPage = 0;
let pageSize = 5;
let totalPages = 0;

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token || !role || role.toUpperCase() !== "ADMIN") {
        window.location.href = "/login";
        return;
    }
    loadUsers();
});

async function loadUsers() {
    const tbody = document.getElementById("userTableBody");
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(API_USERS, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (res.status === 401) {
            window.location.href = "/login";
            return;
        }

        const data = await res.json();
        allUsers = data.content || data;
        applyFilterAndSort();

    } catch (e) {
        console.error("Load users error:", e);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 50px; color: red; font-weight: 700;">LỖI KẾT NỐI API</td></tr>`;
    }
}

function applyFilterAndSort() {
    let list = [...allUsers]; 

    if (currentRole !== "ALL") {
        list = list.filter(u => u.role === currentRole);
    }
    if (currentKeyword) {
            list = list.filter(u =>
                (u.name && u.name.toLowerCase().includes(currentKeyword)) ||
                (u.email && u.email.toLowerCase().includes(currentKeyword))
            );
    }

    list.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return currentSort === "newest" ? dateB - dateA : dateA - dateB;
    });

    totalPages = Math.ceil(list.length / pageSize);
    if (currentPage >= totalPages) currentPage = 0;

    const start = currentPage * pageSize;
    renderUsers(list.slice(start, start + pageSize));
    renderPagination();
}

function renderPagination() {
    const container = document.getElementById("pagination");
    if (!container) return;
    let html = "";
    html += `<button ${currentPage === 0 ? "disabled" : ""} onclick="changePage(${currentPage - 1})">←</button>`;
    for (let i = 0; i < totalPages; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i + 1}</button>`;
    }
    html += `<button ${currentPage === totalPages - 1 ? "disabled" : ""} onclick="changePage(${currentPage + 1})">→</button>`;
    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    applyFilterAndSort();
}

function renderUsers(users) {
    const tbody = document.getElementById("userTableBody");
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 50px; color: #888;">Không tìm thấy người dùng</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(u => {
        const avatarPath = u.avatar ? `/uploads/${u.avatar}` : `https://ui-avatars.com/api/?name=${u.name || 'U'}&background=random`;

        return `
        <tr>
            <td>
                <div class="avatar-container">
                    <img src="${avatarPath}" class="avatar-img" onerror="this.src='https://ui-avatars.com/api/?name=User'">
                </div>
            </td>
            <td>
                <div class="user-info">
                    <span class="name">${u.name || 'N/A'}</span>
                    <span class="email">${u.email}</span>
                </div>
            </td>
            <td><span class="role-badge">${u.role}</span></td>
            <td style="color: #888; font-weight: 600;">
                ${u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '---'}
            </td>
            <td style="text-align: center;">
                <span class="status status-${(u.status || 'ACTIVE').toLowerCase()}">
                    ${u.status || 'ACTIVE'}
                </span>
            </td>
            <td style="text-align: right;">
                <button class="btn-action" onclick="openUserModal('${u.id}', '${u.name}', '${u.status}')">
                    <span class="material-symbols-outlined">
                        ${u.status === 'LOCKED' ? 'lock_open' : 'lock'}
                    </span>
                </button>
            </td>
        </tr>`;
    }).join("");
}

function filterByRole(role, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentRole = role;
    currentPage = 0;
    applyFilterAndSort();
}

function changeSort(sortValue) {
    currentSort = sortValue;
    currentPage = 0;
    applyFilterAndSort();
}

function searchUsers() {
    currentKeyword = document.getElementById("userSearch").value.toLowerCase();
    currentPage = 0;
    applyFilterAndSort();
}

function openUserModal(id, name, status) {
    const isLocked = (status === 'LOCKED');
    document.getElementById("modalTitle").innerText = isLocked ? "MỞ KHÓA TÀI KHOẢN" : "KHÓA TÀI KHOẢN";
    document.getElementById("modalUserName").innerText = `Người dùng: ${name}`;
    document.getElementById("confirmActionBtn").onclick = () => toggleUserStatus(id, isLocked ? 'ACTIVE' : 'LOCKED');
    document.getElementById("userModal").style.display = "flex";
}

function closeUserModal() { document.getElementById("userModal").style.display = "none"; }

async function toggleUserStatus(id, targetStatus) {
    // FIX QUAN TRỌNG: Đóng modal ngay lập tức để không che khuất thông báo lỗi phía sau
    closeUserModal();

    try {
        const token = localStorage.getItem("token");
        let url = (targetStatus === 'LOCKED') ? `${API_USERS}/${id}` : `${API_USERS}/${id}/unlock`;
        let method = (targetStatus === 'LOCKED') ? "DELETE" : "PUT";

        const res = await fetch(url, {
            method: method,
            headers: { "Authorization": "Bearer " + token }
        });

        if (!res.ok) {
            let errorMsg = "Có lỗi xảy ra";
            try {
                const data = await res.json();
                errorMsg = data.message || JSON.stringify(data);
            } catch {
                errorMsg = await res.text();
            }
// --- BẮT ĐẦU: LỌC BỎ CÁC ĐOẠN CHỮ THỪA TỪ BACKEND ---
            // 1. Xóa chữ "400 BAD_REQUEST"
            errorMsg = errorMsg.replace(/400 BAD_REQUEST/g, "");
            // 2. Xóa đoạn trạng thái "(PENDING / SHIPPING / PAID)"
            errorMsg = errorMsg.replace(/\(PENDING \/ SHIPPING \/ PAID\)/g, "");
            // 3. Xóa các dấu ngoặc kép thừa (nếu có)
            errorMsg = errorMsg.replace(/"/g, "");
            // 4. Xóa khoảng trắng thừa ở hai đầu
            errorMsg = errorMsg.trim();
            // --- KẾT THÚC ---
            // HIỂN THỊ THÔNG BÁO LỖI (Giờ đã nằm trên cùng vì modal đã đóng)
            Swal.fire({
                title: "ĐƠN HÀNG CHƯA HOÀN TẤT",
                text: errorMsg,
                icon: "error",
                confirmButtonText: "ĐÃ HIỂU",
                confirmButtonColor: "#000"
            });
            return;
        }

        // Thông báo thành công
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: targetStatus === 'LOCKED' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
            showConfirmButton: false,
            timer: 3000
        });

        loadUsers();

    } catch (e) {
        console.error(e);
        Swal.fire({
            title: "LỖI KẾT NỐI",
            text: "Không thể liên lạc với máy chủ.",
            icon: "error",
            confirmButtonColor: "#000"
        });
    }
}