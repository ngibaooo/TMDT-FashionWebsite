const API_DETAIL = "http://localhost:8080/api/products/";
const API_UPDATE = "http://localhost:8080/api/products/";
const API_CATEGORIES = "http://localhost:8080/api/admin/categories";

let productId = null;

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
    }
}

async function updateProduct() {
    try {
        const token = localStorage.getItem("token");

        const formData = new FormData();

        formData.append("name", document.getElementById("name").value);
        formData.append("description", document.getElementById("description").value);
        formData.append("price", parseFloat(document.getElementById("price").value));
        formData.append("oldPrice", parseFloat(document.getElementById("oldPrice").value));
        formData.append("categoryId", document.getElementById("category").value);

        // ảnh
        const files = document.getElementById("images").files;
        for (let i = 0; i < files.length; i++) {
            formData.append("images", files[i]);
        }

        const res = await fetch(API_UPDATE + productId, {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer " + token
                // kh set Content-Type
            },
            body: formData
        });

        if (res.ok) {
            alert("Cập nhật thành công!");
            window.location.href = "/admin/products";
        } else {
            alert("Cập nhật thất bại!");
        }

    } catch (e) {
        console.error("Update error:", e);
    }
}
async function loadCategories(selectedId) {
    const token = localStorage.getItem("token");

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
}
function previewNewImage(event) {
    const file = event.target.files[0];

    if (!file) return;

    const preview = document.getElementById("preview");

    // tạo url tạm
    const imageUrl = URL.createObjectURL(file);

    preview.src = imageUrl;
}