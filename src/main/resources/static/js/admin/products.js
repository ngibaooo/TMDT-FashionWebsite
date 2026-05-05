const API_PRODUCTS = "http://localhost:8080/api/products/admin";
const API_DETAIL = "http://localhost:8080/api/products/";

let currentPage = 0;
let totalPages = 0;
let currentSort = "newest";
let currentPrice = "";
let currentKeyword = "";
let currentStatus = "";

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
    confirm: async (title, text) => {
        const result = await Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });
        return result.isConfirmed;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");

    if (!role || role.toUpperCase() !== "ADMIN") {
        window.location.href = "/login";
        return;
    }

    document.getElementById("sort").addEventListener("change", (e) => {
        currentSort = e.target.value;
        currentPage = 0;
        loadProducts();
    });

    document.getElementById("price").addEventListener("change", (e) => {
        currentPrice = e.target.value;
        currentPage = 0;
        loadProducts();
    });

    document.getElementById("search").addEventListener("input", (e) => {
        currentKeyword = e.target.value;
        currentPage = 0;
        loadProducts();
    });
    loadProducts();
});

let allProducts = [];

function buildUrl() {
    let params = new URLSearchParams();
    params.append("page", currentPage);
    params.append("size", 5);

    const hasFilter = currentKeyword || currentPrice || currentStatus;

    if (currentKeyword) params.append("keyword", currentKeyword);
    if (currentPrice) {
        const [min, max] = currentPrice.split("-");
        params.append("minPrice", min);
        params.append("maxPrice", max);
    }
    if (currentStatus) params.append("status", currentStatus);

    switch (currentSort) {
        case "price_asc": params.append("sort", "price,asc"); break;
        case "price_desc": params.append("sort", "price,desc"); break;
        case "oldest": params.append("sort", "createdAt,asc"); break;
        default: params.append("sort", "createdAt,desc");
    }

    return hasFilter ? `${API_PRODUCTS}/filter?${params.toString()}` : `${API_PRODUCTS}?${params.toString()}`;
}

function filterStatus(status, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentStatus = status;
    currentPage = 0;
    loadProducts();
}

async function loadProducts() {
    try {
        const url = buildUrl();
        const token = localStorage.getItem("token");
        const res = await fetch(url, {
            headers: { "Authorization": "Bearer " + token }
        });
        const data = await res.json();
        totalPages = data.totalPages || 0;
        let products = data.content || [];

        if (!res.ok) {
            console.error("API lỗi:", data);
            return;
        }

        if (!Array.isArray(products)) {
            console.error("Không phải array:", data);
            return;
        }

        const productsWithVariant = await Promise.all(
            products.map(async (p) => {
                try {
                    const res = await fetch(API_DETAIL + p.id, {
                        headers: { "Authorization": "Bearer " + token }
                    });
                    const detail = await res.json();
                    return {
                        ...p,
                        variantCount: detail.variants ? detail.variants.length : 0,
                        totalQuantity: detail.variants ? detail.variants.reduce((sum, v) => sum + v.quantity, 0) : 0
                    };
                } catch {
                    return { ...p, variantCount: 0, totalQuantity: 0 };
                }
            })
        );

        allProducts = productsWithVariant;
        renderProducts(allProducts);
        renderPagination();
    } catch (e) { console.error("Load product error:", e); }
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
    loadProducts();
}

function renderProducts(products) {
    const table = document.getElementById("productTable");
    table.innerHTML = products.map(p => {
        const status = (p.status || '').toUpperCase();
        let statusClass = (status === 'ACTIVE') ? 'active' : (status === 'OUT_OF_STOCK' ? 'out' : 'inactive');

        return `
        <tr>
            <td><img class="product-img" src="${p.images && p.images[0] ? p.images[0] : '/images/default.jpg'}"></td>
            <td>${p.name}</td>
            <td class="category">${p.categoryName || '-'}</td>
            <td>${formatMoney(p.price)}</td>
            <td>${p.totalQuantity || 0}</td>
            <td><span class="variant-badge">${p.variantCount || 0}</span></td>
            <td><span class="status ${statusClass}">${status || 'INACTIVE'}</span></td>
            <td>
                <div class="actions">
                    <button class="btn-edit" onclick="editProduct('${p.id}')">Sửa</button>
                    <button class="btn-delete" onclick="toggleStatus('${p.id}', '${status}')">
                        ${status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    </button>
                </div>
            </td>
        </tr>`;
    }).join("");
}

function goAddProduct() {
    window.location.href = "/admin/products/add-product";
}

async function deleteProduct(id) {
    const confirmed = await notify.confirm("Xác nhận", "Xóa sản phẩm này?");
    if (!confirmed) return;

    try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/products/" + id, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });

        if (res.ok) {
            notify.toast("Đã xóa sản phẩm thành công!");
            loadProducts();
        } else {
            Swal.fire("Lỗi", "Không thể xóa sản phẩm", "error");
        }
    } catch (e) { console.error("Delete error:", e); }
}

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function editProduct(id) {
    window.location.href = "/admin/products/edit-product/" + id;
}

async function toggleStatus(id, currentStatus) {
    const token = localStorage.getItem("token");
    const isActive = currentStatus === "ACTIVE";

    const confirmed = await notify.confirm("Xác nhận", "Bạn có chắc muốn đổi trạng thái sản phẩm?");
    if (!confirmed) return;

    try {
        let res;
        if (isActive) {
            res = await fetch(`http://localhost:8080/api/products/${id}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });
        } else {
            res = await fetch(`http://localhost:8080/api/products/${id}/restore`, {
                method: "PUT",
                headers: { "Authorization": "Bearer " + token }
            });
        }

        if (res.ok) {
            notify.toast("Cập nhật trạng thái thành công!");
            loadProducts();
        } else {
            const err = await res.text();
            Swal.fire("Lỗi", err, "error");
        }
    } catch (e) { console.error("Status error:", e); }
}