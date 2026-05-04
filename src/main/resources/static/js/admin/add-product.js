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

//let variantCount = 0;
//function addVariant() {
//    const container = document.getElementById("variantContainer");
//    const div = document.createElement("div");
//    div.className = "variant";
//    div.id = `variant-${variantCount}`;
//
//    div.innerHTML = `
//        <div class="variant-row">
//            <input type="text" placeholder="Size (S/M/L)" class="var-size">
//            <input type="text" placeholder="Color" class="var-color">
//            <input type="number" placeholder="Quantity" class="var-qty">
//        </div>
//        <div class="variant-footer">
//            <button onclick="document.getElementById('variant-${variantCount}').remove()">Xóa</button>
//        </div>
//    `;
//
//    container.appendChild(div);
//    variantCount++;
//}
let variantCount = 0;
let variants = [];

function addVariant() {
    const id = Date.now();

    const container = document.getElementById("variantContainer");

    const html = `
        <div class="variant" id="variant-${id}">

            <div class="variant-row">
                <input type="text" placeholder="Size (S/M/L)"
                       onchange="updateVariant(${id}, 'size', this.value)">

                <input type="text" placeholder="Color"
                       onchange="updateVariant(${id}, 'color', this.value)">

                <input type="number" placeholder="Quantity"
                       onchange="updateVariant(${id}, 'quantity', this.value)">
            </div>

            <!-- upload ảnh variant -->
            <input type="file" multiple
                   onchange="handleVariantImages(${id}, this.files)">

            <!-- preview -->
            <div class="variant-preview" id="preview-${id}"></div>

            <div class="variant-footer">
                <button onclick="removeVariant(${id})">Xóa</button>
            </div>

        </div>
    `;

    container.insertAdjacentHTML("beforeend", html);

    variants.push({
        id,
        size: "",
        color: "",
        quantity: 0,
        images: []
    });
}
function updateVariant(id, field, value) {
    const v = variants.find(v => v.id === id);
    if (v) v[field] = value;
}

function removeVariant(id) {
    variants = variants.filter(v => v.id !== id);
    document.getElementById(`variant-${id}`)?.remove();
}

function handleVariantImages(id, files) {
    const v = variants.find(v => v.id === id);
    if (!v) return;

    v.images = Array.from(files);

    const preview = document.getElementById(`preview-${id}`);
    preview.innerHTML = "";

    v.images.forEach(file => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.classList.add("variant-img");
        preview.appendChild(img);
    });
}

//async function submitProduct() {
//    const name = document.getElementById("name").value.trim();
//    const description = document.getElementById("description").value.trim();
//    const price = document.getElementById("price").value;
//    const categoryId = document.getElementById("category").value;
//
//    // ROOT CAUSE FIX: Thay alert bằng notify
//    if (!name) {
//        notify.popup("Thiếu thông tin", "Tên sản phẩm không được để trống!", "warning");
//        return;
//    }
//    if (!price || price <= 0) {
//        notify.popup("Thiếu thông tin", "Giá sản phẩm phải lớn hơn 0!", "warning");
//        return;
//    }
//
//    const token = localStorage.getItem("token");
//    const formData = new FormData();
//
//    formData.append("name", name);
//    formData.append("description", description);
//    formData.append("price", price);
//    formData.append("categoryId", categoryId);
//
//    const files = document.getElementById("images").files;
//    for (let i = 0; i < files.length; i++) {
//        formData.append("images", files[i]);
//    }
//
//    // Hiển thị trạng thái đang tải
//    Swal.fire({
//        title: 'ĐANG LƯU SẢN PHẨM...',
//        allowOutsideClick: false,
//        didOpen: () => { Swal.showLoading(); },
//        customClass: { popup: 'ez-swal-popup', title: 'ez-swal-title' }
//    });
//
//    try {
//        const res = await fetch(API_PRODUCT, {
//            method: "POST",
//            headers: {
//                "Authorization": "Bearer " + token
//            },
//            body: formData
//        });
//
//        if (res.ok) {
//            await notify.popup("Thành công", "Đã thêm sản phẩm mới!", "success");
//            window.location.href = "/admin/products";
//        } else {
//            const err = await res.text();
//            notify.popup("Thất bại", err || "Không thể thêm sản phẩm", "error");
//        }
//    } catch (e) {
//        console.error("Submit error:", e);
//        notify.popup("Lỗi hệ thống", "Không thể kết nối đến máy chủ", "error");
//    }
//}
async function submitProduct() {
    const token = localStorage.getItem("token");

    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const price = parseFloat(document.getElementById("price").value);
    const categoryId = document.getElementById("category").value;

    if (!name) {
        notify.popup("Thiếu thông tin", "Tên sản phẩm không được để trống!");
        return;
    }

    if (!price || price <= 0) {
        notify.popup("Thiếu thông tin", "Giá sản phẩm phải lớn hơn 0!");
        return;
    }

    if (!categoryId) {
        notify.popup("Thiếu thông tin", "Vui lòng chọn danh mục!");
        return;
    }

    if (variants.length === 0) {
        notify.popup("Thiếu thông tin", "Phải có ít nhất 1 variant!");
        return;
    }

    const productData = {
        name,
        description,
        price,
        categoryId,
        variants: variants.map(v => ({
            size: v.size,
            color: v.color,
            quantity: parseInt(v.quantity)
        }))
    };

    const formData = new FormData();

    // JSON
    formData.append(
        "data",
        new Blob([JSON.stringify(productData)], {
            type: "application/json"
        })
    );

    // PRODUCT IMAGES
    const productFiles = document.getElementById("images").files;
    for (let file of productFiles) {
        formData.append("images", file);
    }

    // VARIANT IMAGES (QUAN TRỌNG)
    variants.forEach((v, index) => {
        if (v.images && v.images.length > 0) {
            v.images.forEach(file => {
                formData.append(`variantImages_${index}`, file);
            });
        }
    });

    Swal.fire({
        title: 'ĐANG LƯU SẢN PHẨM...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: {
            popup: 'ez-swal-popup',
            title: 'ez-swal-title'
        }
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
        console.error(e);
        notify.popup("Lỗi hệ thống", "Không thể kết nối server", "error");
    }
}