const API_PRODUCTS = "http://localhost:8080/api/products/admin";
const API_DETAIL = "http://localhost:8080/api/products/";

let currentPage = 0;
let totalPages = 0;
document.addEventListener("DOMContentLoaded", () => {

    const role = localStorage.getItem("role");

    if (!role || role.toUpperCase() !== "ADMIN") {
        window.location.href = "/login";
        return;
    }

    loadProducts();

    document.getElementById("search").addEventListener("input", filterProducts);
});

let allProducts = [];

function buildUrl() {
    const sort = document.getElementById("sort").value;
    const price = document.getElementById("price").value;

    let params = new URLSearchParams();
    params.append("page", currentPage);
    params.append("size", 5);

    if (price) {
        const [min, max] = price.split("-");
        params.append("minPrice", min);
        params.append("maxPrice", max);
    }

    // FIX SORT
    if (sort === "newest") {
        params.append("sort", "createdAt,desc");
    } else if (sort === "oldest") {
        params.append("sort", "createdAt,asc");
    } else if (sort === "price_desc") {
        params.append("sort", "price,desc");
    } else if (sort === "price_asc") {
        params.append("sort", "price,asc");
    }

    let url = price
        ? API_PRODUCTS + "/filter?" + params.toString()
        : API_PRODUCTS + "?" + params.toString();

    return url;
}
async function loadProducts() {
    try {
        const url = buildUrl();

      const token = localStorage.getItem("token");

        const res = await fetch(url, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        const data = await res.json();

        totalPages = data.totalPages || 0;

        let products = data.content || [];
        if (!res.ok) {
            console.error("API lỗi:", data);
            return;
        }

//        let products = data.content || data;

        if (!Array.isArray(products)) {
            console.error("Không phải array:", data);
            return;
        }

        const productsWithVariant = await Promise.all(
            products.map(async (p) => {
                try {
                    const res = await fetch(API_DETAIL + p.id, {
                        headers: {
                            "Authorization": "Bearer " + token
                        }
                    });
                    const detail = await res.json();


                    return {
                        ...p,
                        variantCount: detail.variants ? detail.variants.length : 0,
                        totalQuantity: detail.variants
                            ? detail.variants.reduce((sum, v) => sum + v.quantity, 0)
                            : 0
                    };
                } catch {
                    return { ...p, variantCount: 0, totalQuantity: 0 };
                }
            })
        );

        allProducts = productsWithVariant;

        renderProducts(allProducts);
        renderPagination();

    } catch (e) {
        console.error("Load product error:", e);
    }
}
function renderPagination() {
    const container = document.getElementById("pagination");

    if (!container) return;

    let html = "";

    // PREV
    html += `
        <button ${currentPage === 0 ? "disabled" : ""}
            onclick="changePage(${currentPage - 1})">
            ←
        </button>
    `;

    // PAGE NUMBER
    for (let i = 0; i < totalPages; i++) {
        html += `
            <button class="${i === currentPage ? 'active' : ''}"
                onclick="changePage(${i})">
                ${i + 1}
            </button>
        `;
    }

    // NEXT
    html += `
        <button ${currentPage === totalPages - 1 ? "disabled" : ""}
            onclick="changePage(${currentPage + 1})">
            →
        </button>
    `;

    container.innerHTML = html;
}
function changePage(page) {
    currentPage = page;
    loadProducts();
}
function applyFilter() {
    loadProducts();
}
function renderProducts(products) {
    const table = document.getElementById("productTable");

    table.innerHTML = products.map(p => {

        const status = (p.status || '').toUpperCase();

        let statusClass = '';
        if (status === 'ACTIVE') {
            statusClass = 'active';
        } else if (status === 'OUT_OF_STOCK') {
            statusClass = 'out';
        } else {
            statusClass = 'inactive';
        }

        return `
        <tr>
            <td>
                <img class="product-img"
                     src="${p.images && p.images[0] ? p.images[0] : '/images/default.jpg'}">
            </td>
            <td>${p.name}</td>
            <td class="category">${p.categoryName || '-'}</td>
            <td>${formatMoney(p.price)}</td>
            <td>${p.totalQuantity || 0}</td>
            <td>
                <span class="variant-badge">
                    ${p.variantCount || 0}
                </span>
            </td>
            <td>
                <span class="status ${statusClass}">
                    ${status || 'INACTIVE'}
                </span>
            </td>
            <td>
                <div class="actions">
                    <button class="btn-edit" onclick="editProduct('${p.id}')">
                        Sửa
                    </button>
                    <button class="btn-delete" onclick="toggleStatus('${p.id}', '${status}')">
                        ${status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join("");
}
// ===== SEARCH =====
function filterProducts() {
    const keyword = document.getElementById("search").value.toLowerCase();

    const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(keyword)
    );

    renderProducts(filtered);
}

// ===== ACTION =====
function goAddProduct() {
    window.location.href = "/admin/products/add-product";
}

async function deleteProduct(id) {
    if (!confirm("Xóa sản phẩm này?")) return;

    try {
        const token = localStorage.getItem("token");

        await fetch("http://localhost:8080/api/products/" + id,{
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        loadProducts();

    } catch (e) {
        console.error("Delete error:", e);
    }
}

// ===== FORMAT =====
function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
}

function editProduct(id) {
    window.location.href = "/admin/products/edit-product/" + id;
}
async function toggleStatus(id, currentStatus) {
    const token = localStorage.getItem("token");

    const isActive = currentStatus === "ACTIVE";

    if (!confirm("Bạn có chắc muốn đổi trạng thái sản phẩm?")) return;

    try {
        let res;

        if (isActive) {
            res = await fetch(`http://localhost:8080/api/products/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });
        } else {
            res = await fetch(`http://localhost:8080/api/products/${id}/restore`, {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });
        }

        if (res.ok) {
            loadProducts();
        } else {
            const err = await res.text();
            alert("Lỗi: " + err);
        }

    } catch (e) {
        console.error("Status error:", e);
    }
}