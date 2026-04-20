const API_CREATE = "http://localhost:8080/api/products";
const API_CATEGORIES = "http://localhost:8080/api/admin/categories";

let variants = [];

document.addEventListener("DOMContentLoaded", () => {

    const role = localStorage.getItem("role");
    if (!role || role.toUpperCase() !== "ADMIN") {
        window.location.href = "/login";
        return;
    }

    loadCategories();

    document.getElementById("images").addEventListener("change", previewImage);
});


// ===== LOAD CATEGORY =====
async function loadCategories() {
    const token = localStorage.getItem("token");

    const res = await fetch(API_CATEGORIES, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const data = await res.json();
    const list = data.content || data;

    const select = document.getElementById("category");

    select.innerHTML = `
        <option value="">-- Chọn danh mục --</option>
        ${list.map(c => `
            <option value="${c.id}">${c.name}</option>
        `).join("")}
    `;
}
function previewImage(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById("previewContainer");

    previewContainer.innerHTML = "";

    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.classList.add("preview");

        previewContainer.appendChild(img);
    });
}


// ===== VARIANT =====
//function addVariant() {
//    const id = Date.now();
//
//    const html = `
//        <div class="variant" id="variant-${id}">
//            <input placeholder="Size (S/M/L)"
//                   onchange="updateVariant(${id}, 'size', this.value)">
//
//            <input placeholder="Color"
//                   onchange="updateVariant(${id}, 'color', this.value)">
//
//            <input type="number" placeholder="Quantity"
//                   onchange="updateVariant(${id}, 'quantity', this.value)">
//
//            <button onclick="removeVariant(${id})">X</button>
//        </div>
//    `;
//
//    document.getElementById("variantContainer").insertAdjacentHTML("beforeend", html);
//
//    variants.push({
//        id,
//        size: "",
//        color: "",
//        quantity: 0
//    });
//}
//function addVariant() {
//    const id = Date.now();
//
//    const html = `
//        <div class="variant" id="variant-${id}">
//
//            <input placeholder="Size (S/M/L)"
//                   onchange="updateVariant(${id}, 'size', this.value)">
//
//            <input placeholder="Color"
//                   onchange="updateVariant(${id}, 'color', this.value)">
//
//            <input type="number" placeholder="Quantity"
//                   onchange="updateVariant(${id}, 'quantity', this.value)">
//
//            <!-- upload ảnh -->
//            <input type="file" multiple
//                   onchange="handleVariantImages(${id}, this.files)">
//
//            <!-- preview -->
//            <div class="variant-preview" id="preview-${id}"></div>
//
//            <button onclick="removeVariant(${id})">X</button>
//        </div>
//    `;
//
//    document.getElementById("variantContainer")
//        .insertAdjacentHTML("beforeend", html);
//
//    variants.push({
//        id,
//        size: "",
//        color: "",
//        quantity: 0,
//        images: []
//    });
//}
function addVariant() {
    const id = Date.now();

    const html = `
        <div class="variant" id="variant-${id}">

            <div class="variant-row">
                <input placeholder="Size (S/M/L)"
                       onchange="updateVariant(${id}, 'size', this.value)">

                <input placeholder="Color"
                       onchange="updateVariant(${id}, 'color', this.value)">

                <input type="number" placeholder="Quantity"
                       onchange="updateVariant(${id}, 'quantity', this.value)">
            </div>

            <input type="file" multiple
                   onchange="handleVariantImages(${id}, this.files)">

            <div class="variant-preview" id="preview-${id}"></div>

            <div class="variant-footer">
                <button onclick="removeVariant(${id})">Xóa</button>
            </div>

        </div>
    `;

    document.getElementById("variantContainer")
        .insertAdjacentHTML("beforeend", html);

    variants.push({
        id,
        size: "",
        color: "",
        quantity: 0,
        images: []
    });
}

// lưu file
function handleVariantImages(id, files) {
    const v = variants.find(v => v.id === id);
    if (!v) return;

    v.images = Array.from(files);

    // preview
    const preview = document.getElementById(`preview-${id}`);
    preview.innerHTML = "";

    v.images.forEach(file => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.classList.add("variant-img");

        preview.appendChild(img);
    });
}

function updateVariant(id, field, value) {
    const v = variants.find(v => v.id === id);
    if (v) {
        v[field] = value;
    }
}

function removeVariant(id) {
    variants = variants.filter(v => v.id !== id);
    document.getElementById("variant-" + id).remove();
}


// ===== VALIDATE =====
function validateForm(productData) {

    if (!productData.name) {
        alert("Tên sản phẩm không được để trống");
        return false;
    }

    if (!productData.price || productData.price <= 0) {
        alert("Giá phải lớn hơn 0");
        return false;
    }

    if (!productData.categoryId) {
        alert("Vui lòng chọn category");
        return false;
    }

    if (productData.variants.length === 0) {
        alert("Phải có ít nhất 1 variant");
        return false;
    }

    for (let v of productData.variants) {
        if (!v.size || !v.color || v.quantity < 0) {
            alert("Variant không hợp lệ");
            return false;
        }
    }

    return true;
}


// ===== SUBMIT =====
//async function submitProduct() {
//    const token = localStorage.getItem("token");
//
////    DATA JSON
//    const productData = {
//        name: document.getElementById("name").value,
//        description: document.getElementById("description").value,
//        price: parseFloat(document.getElementById("price").value),
//        categoryId: document.getElementById("category").value,
//
//        variants: variants.map(v => ({
//            size: v.size,
//            color: v.color,
//            quantity: parseInt(v.quantity)
//        }))
//    };
//
//    // VALIDATE
//    if (!validateForm(productData)) return;
//
//    const formData = new FormData();
//
//    formData.append(
//        "data",
//        new Blob([JSON.stringify(productData)], {
//            type: "application/json"
//        })
//    );
//
//    // IMAGE FILES
//    const files = document.getElementById("images").files;
//    for (let i = 0; i < files.length; i++) {
//        formData.append("images", files[i]);
//    }
//
//    try {
//        const res = await fetch(API_CREATE, {
//            method: "POST",
//            headers: {
//                "Authorization": "Bearer " + token
//            },
//            body: formData
//        });
//
//        if (res.ok) {
//            alert("Tạo sản phẩm thành công");
//            window.location.href = "/admin/products";
//        } else {
//            const err = await res.text();
//            alert("Lỗi: " + err);
//        }
//
//    } catch (e) {
//        console.error("Create product error:", e);
//    }
//}
async function submitProduct() {
    const token = localStorage.getItem("token");

    const productData = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        price: parseFloat(document.getElementById("price").value),
        categoryId: document.getElementById("category").value,

        variants: variants.map(v => ({
            size: v.size,
            color: v.color,
            quantity: parseInt(v.quantity)
        }))
    };

    if (!validateForm(productData)) return;

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

    // 🔥 VARIANT IMAGES
    variants.forEach((v, index) => {
        if (v.images && v.images.length > 0) {
            v.images.forEach(file => {
                formData.append(`variantImages_${index}`, file);
            });
        }
    });

    try {
        const res = await fetch(API_CREATE, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: formData
        });

        if (res.ok) {
            alert("Tạo sản phẩm thành công");
            window.location.href = "/admin/products";
        } else {
            const err = await res.text();
            alert("Lỗi: " + err);
        }

    } catch (e) {
        console.error("Create product error:", e);
    }
}