/**
 * EAZY VIBES - VARIANTS CORE ENGINE
 * FIX: Bổ sung thông báo thành công và trạng thái "Đang lưu" cho Form
 */

const API_VARIANTS = "/api/variants";
const API_PRODUCTS_ADMIN = "/api/products/admin";
const PLACE_IMG = "https://placehold.co/100x100?text=NO+IMAGE";

let currentP = 0;
let statusF = "ALL";
let sizeF = "";
let keywordF = "";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    initPage();
});

async function initPage() {
    await loadVariants();
    await loadProductsForSelect();
}

function fixImageUrl(url) {
    if (!url || url === "null") return PLACE_IMG;
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('/uploads/') && !cleanUrl.startsWith('http')) cleanUrl = '/uploads/' + cleanUrl;
    cleanUrl = cleanUrl.replace(/\/uploads\/\/uploads\//g, '/uploads/');
    try { return encodeURI(decodeURI(cleanUrl)); } catch (e) { return cleanUrl; }
}

async function loadVariants(page = 0) {
    currentP = page;
    const tbody = document.getElementById("variantTableBody");
    const token = localStorage.getItem("token");
    try {
        const query = new URLSearchParams();
        query.append("page", page);
        query.append("size", 10);
        if (statusF !== "ALL") query.append("status", statusF);
        if (sizeF !== "") query.append("productSize", sizeF);
        if (keywordF.trim() !== "") query.append("productId", keywordF.trim());

        const res = await fetch(`${API_VARIANTS}?${query.toString()}`, {
            headers: { "Authorization": `Bearer ${token.trim()}` }
        });
        const data = await res.json();
        renderTable(data.content || []);
        renderPagination(data);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:50px; color:red; font-weight:900;">LỖI TẢI DỮ LIỆU</td></tr>`;
    }
}

function renderTable(list) {
    const tbody = document.getElementById("variantTableBody");
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:50px; color:#aaa;">KHÔNG CÓ DỮ LIỆU</td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(v => `
        <tr>
            <td><img src="${fixImageUrl(v.image)}" class="prod-img" onerror="this.src='${PLACE_IMG}';"></td>
            <td>
                <div style="font-weight:900; color:#000; text-transform:uppercase; font-size:13px;">${v.productName || 'N/A'}</div>
                <div style="font-size:11px; color:#999; font-weight:600;">PID: ${v.productId || 'N/A'}</div>
            </td>
            <td>
                <div style="font-size:13px; font-weight:800; color:#000;">SIZE: ${v.size}</div>
                <div style="font-size:11px; font-weight:600; color:#666;">MÀU: ${v.color}</div>
            </td>
            <td style="font-weight:900;">${v.quantity}</td>
            <td style="text-align:center;">
                <span class="status status-${(v.status || 'ACTIVE').toLowerCase()}">${v.status}</span>
            </td>
            <td style="text-align:right;">
                ${v.status === 'ACTIVE' ? 
                    `<button onclick="toggleStatus('${v.id}', 'disable')" class="btn-action-del"><span class="material-symbols-outlined" style="color:#FF4D4F;">block</span></button>` : 
                    `<button onclick="toggleStatus('${v.id}', 'enable')" class="btn-action-del"><span class="material-symbols-outlined" style="color:#00A86B;">refresh</span></button>`
                }
            </td>
        </tr>
    `).join("");
}

/**
 * FIX: Logic thông báo khi tạo mới
 */
const addForm = document.getElementById("addVariantForm");
const btnSubmit = document.getElementById("btnSubmitForm");

if (addForm) {
    addForm.onsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const formData = new FormData(e.target);

        // 1. Chuyển trạng thái nút bấm
        btnSubmit.disabled = true;
        btnSubmit.innerText = "ĐANG XỬ LÝ...";

        try {
            const res = await fetch(API_VARIANTS, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token.trim()}` },
                body: formData
            });

            if (res.ok) {
                // 2. Thông báo thành công
                alert("CHÚC MỪNG! Biến thể mới đã được tạo thành công.");
                
                // 3. Dọn dẹp form và UI
                addForm.reset();
                closeModal('addModal');
                loadVariants(0); 
            } else {
                const errMsg = await res.text();
                alert("LỖI: " + errMsg);
            }
        } catch (err) {
            alert("LỖI KẾT NỐI: Không thể liên lạc với máy chủ.");
        } finally {
            // 4. Khôi phục nút bấm
            btnSubmit.disabled = false;
            btnSubmit.innerText = "XÁC NHẬN LƯU";
        }
    };
}

async function toggleStatus(id, action) {
    const isEnable = action === 'enable';
    if (!confirm(isEnable ? "Khôi phục biến thể này?" : "Khóa biến thể này?")) return;
    const token = localStorage.getItem("token");
    const url = isEnable ? `${API_VARIANTS}/${id}/restore` : `${API_VARIANTS}/${id}`;
    const res = await fetch(url, {
        method: isEnable ? "PUT" : "DELETE",
        headers: { "Authorization": `Bearer ${token.trim()}` }
    });
    if (res.ok) {
        alert(isEnable ? "Đã mở khóa biến thể!" : "Đã khóa biến thể!");
        loadVariants(currentP);
    }
}

function handleSearch(event) {
    keywordF = event.target.value;
    clearTimeout(window.sTimer);
    window.sTimer = setTimeout(() => loadVariants(0), 500);
}

function updateStatus(status, btn) {
    statusF = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadVariants(0);
}

function updateSize(size) { sizeF = size; loadVariants(0); }
function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

function renderPagination(data) {
    const container = document.getElementById("pagination");
    if (!container) return;
    let html = "";
    for (let i = 0; i < data.totalPages; i++) {
        html += `<button class="page-btn ${i === currentP ? 'active' : ''}" onclick="loadVariants(${i})">${i + 1}</button>`;
    }
    container.innerHTML = html;
}

async function loadProductsForSelect() {
    const select = document.getElementById("product-select");
    const token = localStorage.getItem("token");
    if (!select) return;
    try {
        const res = await fetch(API_PRODUCTS_ADMIN, { headers: { "Authorization": `Bearer ${token.trim()}` } });
        const list = await res.json();
        const items = list.content || list;
        select.innerHTML = '<option value="">-- CHỌN SẢN PHẨM GỐC --</option>' + 
            items.map(p => `<option value="${p.id}">${p.name.toUpperCase()}</option>`).join("");
    } catch (e) {}
}