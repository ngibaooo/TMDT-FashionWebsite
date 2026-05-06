/**
 * EAZY VIBES - VARIANTS CORE ENGINE
 * Dịch JSON lỗi từ Backend thành câu văn thân thiện.
 */

const API_VARIANTS = "/api/variants";
const API_PRODUCTS_ADMIN = "/api/products/admin";
const PLACE_IMG = "https://placehold.co/100x100?text=NO+IMAGE";

let currentP = 0;
let statusF = "ALL";
let sizeF = "";
let keywordF = "";
let currentVariantsList = [];

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
            html: msg,
            icon: icon,
            confirmButtonColor: '#000'
        });
    }
};
notify.confirm = async (title, text) => {
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
};

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
    let cleanUrl = String(url).trim();
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
        query.append("size", 5);
        if (statusF !== "ALL") query.append("status", statusF);
        if (sizeF !== "") query.append("productSize", sizeF);
        if (keywordF.trim() !== "") query.append("productId", keywordF.trim());

        const res = await fetch(`${API_VARIANTS}?${query.toString()}`, {
            headers: { "Authorization": `Bearer ${token.trim()}` }
        });
        const data = await res.json();
        
        currentVariantsList = data.content || [];
        renderTable(currentVariantsList);
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
                <div style="display:flex; justify-content:flex-end; gap:8px;">
                    <button onclick="openEditModal('${v.id}')" class="btn-action-del" title="Sửa"><span class="material-symbols-outlined" style="color:#111;">edit_square</span></button>
                    ${v.status === 'ACTIVE' ? 
                        `<button onclick="toggleStatus('${v.id}', 'disable')" class="btn-action-del"><span class="material-symbols-outlined" style="color:#FF4D4F;">block</span></button>` : 
                        `<button onclick="toggleStatus('${v.id}', 'enable')" class="btn-action-del"><span class="material-symbols-outlined" style="color:#00A86B;">refresh</span></button>`
                    }
                </div>
            </td>
        </tr>
    `).join("");
}

const addForm = document.getElementById("addVariantForm");
const btnSubmit = document.getElementById("btnSubmitForm");

if (addForm) {
    addForm.onsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const formData = new FormData(e.target);

        btnSubmit.disabled = true;
        btnSubmit.innerText = "ĐANG XỬ LÝ...";

        try {
            const res = await fetch(API_VARIANTS, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token.trim()}` },
                body: formData
            });

            if (res.ok) {
                notify.toast("Tạo biến thể thành công!");
                addForm.reset();
                closeModal('addModal');
                loadVariants(0); 
            } else {
                notify.popup("Thất bại", "Tạo biến thể thất bại", "error");
            }
        } catch (err) {
            notify.popup("Lỗi kết nối", "Không thể liên lạc với máy chủ.", "error");
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerText = "XÁC NHẬN LƯU";
        }
    };
}

async function toggleStatus(id, action) {
    const isEnable = action === 'enable';
    const confirmed = await notify.confirm("Xác nhận", isEnable ? "Khôi phục biến thể này?" : "Khóa biến thể này?");
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    const url = isEnable ? `${API_VARIANTS}/${id}/restore` : `${API_VARIANTS}/${id}`;
    
    try {
        const res = await fetch(url, {
            method: isEnable ? "PUT" : "DELETE",
            headers: { "Authorization": `Bearer ${token.trim()}` }
        });
        if (res.ok) {
            notify.toast(isEnable ? "Đã khôi phục biến thể!" : "Đã khóa biến thể!");
            loadVariants(currentP);
        } else {
            notify.popup("Lỗi", "Không thể thực hiện thay đổi.", "error");
        }
    } catch (e) {
        notify.popup("Lỗi hệ thống", "Đã xảy ra lỗi khi gọi API.", "error");
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
    html += `<button ${currentP === 0 ? "disabled" : ""} onclick="loadVariants(${currentP - 1})">←</button>`;
    for (let i = 0; i < data.totalPages; i++) {
        html += `<button class="${i === currentP ? 'active' : ''}" onclick="loadVariants(${i})">${i + 1}</button>`;
    }
    html += `<button ${currentP === data.totalPages - 1 ? "disabled" : ""} onclick="loadVariants(${currentP + 1})">→</button>`;
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

function openEditModal(id) {
    const variant = currentVariantsList.find(v => v.id == id);
    if (!variant) return;
    
    // Gỡ chặn: Cho phép mở form dù INACTIVE để test hiển thị thông báo lỗi
    document.getElementById("edit-id").value = variant.id;
    document.getElementById("edit-product-name").value = variant.productName || variant.productId;
    document.getElementById("edit-size").value = variant.size;
    document.getElementById("edit-color").value = variant.color;
    document.getElementById("edit-quantity").value = variant.quantity;
    document.getElementById("edit-current-image").src = fixImageUrl(variant.image);
    
    openModal('editModal');
}

const editForm = document.getElementById("editVariantForm");
const btnSubmitEdit = document.getElementById("btnSubmitEditForm");

if (editForm) {
    editForm.onsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const id = document.getElementById("edit-id").value;
        
        const payloadJSON = {
            size: String(document.getElementById("edit-size").value).trim().toUpperCase(),
            color: String(document.getElementById("edit-color").value).trim(),
            quantity: parseInt(document.getElementById("edit-quantity").value, 10) || 0
        };

        btnSubmitEdit.disabled = true;
        btnSubmitEdit.innerText = "ĐANG LƯU DỮ LIỆU...";

        try {
            const resPut = await fetch(`${API_VARIANTS}/${id}`, {
                method: "PUT",
                headers: { 
                    "Authorization": `Bearer ${token.trim()}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payloadJSON) 
            });

            if (!resPut.ok) {
                // ==========================================
                // FIX: Dịch JSON lỗi thành thông báo thân thiện
                // ==========================================
                const errorText = await resPut.text(); 
                let errorMessage = "Đã xảy ra lỗi không xác định."; // Giá trị mặc định
                
                try {
                    // Cố gắng phân tách JSON nếu nó là cấu trúc {"message": "..."}
                    const errObj = JSON.parse(errorText);
                    if (errObj.message) {
                        errorMessage = errObj.message; // Sẽ lấy được chữ "Variant đã bị vô hiệu hóa"
                    }
                } catch(e) {
                    // Nếu Backend trả về đoạn mã thô (không phải json), thì hiện thô
                    errorMessage = errorText; 
                }
                
                notify.popup("Cập nhập thất bại", `Lý do: <b>${errorMessage}</b>`, "error");
                return;
            }

            // Nhịp 2: Cập nhật Ảnh
            const imgInput = editForm.querySelector('input[type="file"]');
            if (imgInput && imgInput.files.length > 0) {
                btnSubmitEdit.innerText = "ĐANG TẢI ẢNH LÊN...";
                const imgData = new FormData();
                for (let i = 0; i < imgInput.files.length; i++) {
                    imgData.append("files", imgInput.files[i]); 
                }

                const resPostImg = await fetch(`${API_VARIANTS}/${id}/images`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token.trim()}` },
                    body: imgData
                });

                if (!resPostImg.ok) {
                    notify.popup("Cảnh báo", `Lưu chữ thành công nhưng lỗi tải ảnh.`, "warning");
                    loadVariants(currentP);
                    return;
                }
            }

            notify.toast("Cập nhập biến thể thành công");
            editForm.reset();
            closeModal('editModal');
            loadVariants(currentP); 

        } catch (err) {
            notify.popup("Lỗi hệ thống", "Không thể liên lạc với máy chủ.", "error");
        } finally {
            btnSubmitEdit.disabled = false;
            btnSubmitEdit.innerText = "CẬP NHẬT BIẾN THỂ";
        }
    };
}