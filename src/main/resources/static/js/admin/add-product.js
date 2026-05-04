/**
 * EAZY VIBES - ADD PRODUCT ENGINE
 */
const API_PRODUCT = "http://localhost:8080/api/products";
const API_CATEGORIES = "http://localhost:8080/api/admin/categories";

// ===== HỆ THỐNG THÔNG BÁO ĐỒNG BỘ =====
const notify = {
    toast: (msg, icon = 'success') => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#000',
            color: '#fff'
        });
        Toast.fire({ icon: icon, title: msg });
    },
    popup: (title, msg, icon = 'warning') => {
        return Swal.fire({
            title: title.toUpperCase(),
            text: msg,
            icon: icon,
            customClass: {
                popup: 'ez-swal-popup',
                title: 'ez-swal-title',
                htmlContainer: 'ez-swal-content',
                confirmButton: 'ez-swal-confirm'
            },
            buttonsStyling: false
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    if (!role || role.toUpperCase() !== "ADMIN") {
        window.location.href = "/login";
        return;
    }

    loadCategories();
    
    // Gắn sự kiện preview ảnh
    document.getElementById("images").addEventListener("change", previewImages);
});

async function loadCategories() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(API_CATEGORIES, {
            headers: { "Authorization": "Bearer " + token }
        });
        const data = await res.json();
        const select = document.getElementById("category");
        const list = data.content || data;
        
        select.innerHTML = list.map(c => `
            <option value="${c.id}">${c.name}</option>
        `).join("");
    } catch (e) {
        console.error("Load category error:", e);
    }
}

function previewImages(event) {
    const container = document.getElementById("previewContainer");
    container.innerHTML = "";
    const files = event.target.files;

    for (let i = 0; i < files.length; i++) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(files[i]);
        img.className = "preview"; // Đã có trong CSS của bạn
        container.appendChild(img);
    }
}

let variantCount = 0;
function addVariant() {
    const container = document.getElementById("variantContainer");
    const div = document.createElement("div");
    div.className = "variant";
    div.id = `variant-${variantCount}`;
    
    div.innerHTML = `
        <div class="variant-row">
            <input type="text" placeholder="Size (S/M/L)" class="var-size">
            <input type="text" placeholder="Color" class="var-color">
            <input type="number" placeholder="Quantity" class="var-qty">
        </div>
        <div class="variant-footer">
            <button onclick="document.getElementById('variant-${variantCount}').remove()">Xóa</button>
        </div>
    `;
    
    container.appendChild(div);
    variantCount++;
}

async function submitProduct() {
    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const price = document.getElementById("price").value;
    const categoryId = document.getElementById("category").value;

    // ROOT CAUSE FIX: Thay alert bằng notify
    if (!name) {
        notify.popup("Thiếu thông tin", "Tên sản phẩm không được để trống!", "warning");
        return;
    }
    if (!price || price <= 0) {
        notify.popup("Thiếu thông tin", "Giá sản phẩm phải lớn hơn 0!", "warning");
        return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("categoryId", categoryId);

    const files = document.getElementById("images").files;
    for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
    }

    // Hiển thị trạng thái đang tải
    Swal.fire({
        title: 'ĐANG LƯU SẢN PHẨM...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); },
        customClass: { popup: 'ez-swal-popup', title: 'ez-swal-title' }
    });

    try {
        const res = await fetch(API_PRODUCT, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: formData
        });

        if (res.ok) {
            await notify.popup("Thành công", "Đã thêm sản phẩm mới!", "success");
            window.location.href = "/admin/products";
        } else {
            const err = await res.text();
            notify.popup("Thất bại", err || "Không thể thêm sản phẩm", "error");
        }
    } catch (e) {
        console.error("Submit error:", e);
        notify.popup("Lỗi hệ thống", "Không thể kết nối đến máy chủ", "error");
    }
}