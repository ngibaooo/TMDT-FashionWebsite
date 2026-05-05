const API_DETAIL = "http://localhost:8080/api/products/";
const API_UPDATE = "http://localhost:8080/api/products/";
const API_CATEGORIES = "http://localhost:8080/api/admin/categories";

let productId = null;

// ===== HELPER: THÔNG BÁO CHUYÊN NGHIỆP =====
const notify = {
    toast: (msg, icon = 'success') => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
        Toast.fire({ icon: icon, title: msg });
    },
    popup: (title, msg, icon = 'warning') => {
        return Swal.fire({
            title: title,
            text: msg,
            icon: icon,
            confirmButtonColor: '#000'
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("images").addEventListener("change", previewNewImage);
    const role = localStorage.getItem("role");
    if (!role || role.toUpperCase() !== "ADMIN") {
        window.location.href = "/login";
        return;
    }

    const pathParts = window.location.pathname.split("/");
    productId = pathParts[pathParts.length - 1];

    loadProduct();
});

async function loadProduct() {
    try {
        const res = await fetch(API_DETAIL + productId);
        const data = await res.json();

        document.getElementById("name").value = data.name;
        document.getElementById("description").value = data.description;
        document.getElementById("price").value = data.price;
        document.getElementById("oldPrice").value = data.oldPrice;

        await loadCategories(data.categoryId);

        if (data.images && data.images.length > 0) {
            document.getElementById("preview").src = data.images[0];
        }

    } catch (e) {
        console.error("Load detail error:", e);
        notify.popup("Lỗi", "Không thể tải chi tiết sản phẩm", "error");
    }
}

async function updateProduct() {
    const name = document.getElementById("name").value.trim();
    const price = document.getElementById("price").value;

    // Kiểm tra dữ liệu đầu vào trước khi gửi
    if (!name) {
        notify.popup("Thiếu thông tin", "Tên sản phẩm không được để trống!", "warning");
        return;
    }
    if (!price || price <= 0) {
        notify.popup("Thiếu thông tin", "Giá sản phẩm phải lớn hơn 0!", "warning");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        const formData = new FormData();

        formData.append("name", name);
        formData.append("description", document.getElementById("description").value);
        formData.append("price", parseFloat(price));
        formData.append("oldPrice", parseFloat(document.getElementById("oldPrice").value) || 0);
        formData.append("categoryId", document.getElementById("category").value);

        const files = document.getElementById("images").files;
        for (let i = 0; i < files.length; i++) {
            formData.append("images", files[i]);
        }

        // Hiện hiệu ứng chờ (Loading)
        Swal.fire({
            title: 'Đang cập nhật...',
            text: 'Vui lòng chờ trong giây lát',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const res = await fetch(API_UPDATE + productId, {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: formData
        });

        if (res.ok) {
            await notify.popup("Thành công", "Sản phẩm đã được cập nhật!", "success");
            window.location.href = "/admin/products";
        } else {
            const errData = await res.json();
            notify.popup("Thất bại", errData.message || "Cập nhật sản phẩm không thành công", "error");
        }

    } catch (e) {
        console.error("Update error:", e);
        notify.popup("Lỗi hệ thống", "Không thể kết nối đến máy chủ", "error");
    }
}

async function loadCategories(selectedId) {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(API_CATEGORIES, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        const data = await res.json();
        const select = document.getElementById("category");
        const list = data.content || data;

        select.innerHTML = list.map(c => `
            <option value="${c.id}" ${c.id === selectedId ? "selected" : ""}>
                ${c.name}
            </option>
        `).join("");
    } catch (e) {
        console.error("Load category error:", e);
    }
}

function previewNewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const preview = document.getElementById("preview");
    const imageUrl = URL.createObjectURL(file);
    preview.src = imageUrl;
}