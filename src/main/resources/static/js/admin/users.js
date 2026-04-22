/**
 * EAZY VIBES - USERS CORE
 * Sửa lỗi: Thực hiện sắp xếp tại chỗ (Local Sort) để không phụ thuộc Backend
 */

const API_USERS = "http://localhost:8080/api/users";
let allUsers = []; // Biến lưu trữ dữ liệu gốc từ Server
let currentRole = "ALL";
let currentSort = "neweast";

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token || !role || role.toUpperCase() !== "ADMIN") {
        window.location.href = "/login";
        return;
    }
    loadUsers();
});

// 1. TẢI DỮ LIỆU GỐC
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
        // Lưu dữ liệu thô vào biến toàn cục
        allUsers = data.content || data;
        
        // Tiến hành lọc và sắp xếp trước khi hiển thị
        applyFilterAndSort();

    } catch (e) {
        console.error("Load users error:", e);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 50px; color: red; font-weight: 700;">LỖI KẾT NỐI API</td></tr>`;
    }
}

// 2. HÀM TỔNG HỢP: LỌC ROLE + SẮP XẾP (LOCAL)
function applyFilterAndSort() {
    let list = [...allUsers]; // Tạo bản sao để không làm hỏng mảng gốc

    // Bước A: Lọc theo Vai trò
    if (currentRole !== "ALL") {
        list = list.filter(u => u.role === currentRole);
    }

    // Bước B: Sắp xếp theo ngày (Local Sorting)
    list.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);

        if (currentSort === "neweast") {
            return dateB - dateA; // Mới nhất lên đầu
        } else {
            return dateA - dateB; // Cũ nhất lên đầu
        }
    });

    renderUsers(list);
}

// 3. HIỂN THỊ DỮ LIỆU
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
        </tr>
    `}).join("");
}

// 4. SỰ KIỆN LỌC ROLE
function filterByRole(role, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    currentRole = role;
    applyFilterAndSort(); // Lọc lại mảng hiện có
}

// 5. SỰ KIỆN SORT (LOCAL)
function changeSort(sortValue) {
    currentSort = sortValue;
    applyFilterAndSort(); // Sắp xếp lại mảng hiện có
}

// 6. TÌM KIẾM NHANH (LOCAL)
function searchUsers() {
    const keyword = document.getElementById("userSearch").value.toLowerCase();
    const filtered = allUsers.filter(u => 
        (u.name && u.name.toLowerCase().includes(keyword)) || 
        u.email.toLowerCase().includes(keyword)
    );
    renderUsers(filtered);
}

// 7. MODAL & KHÓA TÀI KHOẢN
function openUserModal(id, name, status) {
    const isLocked = (status === 'LOCKED');
    document.getElementById("modalTitle").innerText = isLocked ? "MỞ KHÓA TÀI KHOẢN" : "KHÓA TÀI KHOẢN";
    document.getElementById("modalUserName").innerText = `Người dùng: ${name}`;
    document.getElementById("confirmActionBtn").onclick = () => toggleUserStatus(id, isLocked ? 'ACTIVE' : 'LOCKED');
    document.getElementById("userModal").style.display = "flex";
}

function closeUserModal() { document.getElementById("userModal").style.display = "none"; }

async function toggleUserStatus(id, targetStatus) {
    try {
        const token = localStorage.getItem("token");
        let url = (targetStatus === 'LOCKED') ? `${API_USERS}/${id}` : `${API_USERS}/${id}/unlock`;
        let method = (targetStatus === 'LOCKED') ? "DELETE" : "PUT";
        const res = await fetch(url, { method: method, headers: { "Authorization": "Bearer " + token } });
        if (res.ok) { closeUserModal(); loadUsers(); }
    } catch (e) { console.error(e); }
}