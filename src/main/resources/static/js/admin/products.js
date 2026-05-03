const API_PRODUCTS = "http://localhost:8080/api/products/admin";
const API_DETAIL = "http://localhost:8080/api/products/";

let currentPage = 0;
let totalPages = 0;
let currentSort = "newest";
let currentPrice = "";
let currentKeyword = "";
let currentStatus = "";
document.addEventListener("DOMContentLoaded", () => {

    const role = localStorage.getItem("role");

    if (!role || role.toUpperCase() !== "ADMIN") {
        window.location.href = "/login";
        return;
    }

    // BẮT EVENT CHANGE (KHÔNG CẦN NÚT)
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

//    document.getElementById("search").addEventListener("input", filterProducts);
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

    // SEARCH
    if (currentKeyword) {
        params.append("keyword", currentKeyword);
    }

    // PRICE
    if (currentPrice) {
        const [min, max] = currentPrice.split("-");
        params.append("minPrice", min);
        params.append("maxPrice", max);
    }

    // STATUS
    if (currentStatus) {
        params.append("status", currentStatus);
    }

    // SORT
    switch (currentSort) {
        case "price_asc":
            params.append("sort", "price,asc");
            break;
        case "price_desc":
            params.append("sort", "price,desc");
            break;
        case "oldest":
            params.append("sort", "createdAt,asc");
            break;
        default:
            params.append("sort", "createdAt,desc");
    }

    // chọn endpoint
    if (hasFilter) {
        return API_PRODUCTS + "/filter?" + params.toString();
    } else {
        return API_PRODUCTS + "?" + params.toString();
    }
}
function filterStatus(status, btn) {

    // UI active
    document.querySelectorAll('.filter-btn')
        .forEach(b => b.classList.remove('active'));

    btn.classList.add('active');

    // logic
    currentStatus = status;
    currentPage = 0;

    loadProducts();
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
//function applyFilter() {
//    loadProducts();
//}
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
//function filterProducts() {
//    const keyword = document.getElementById("search").value.toLowerCase();
//
//    const filtered = allProducts.filter(p =>
//        p.name.toLowerCase().includes(keyword)
//    );
//
//    renderProducts(filtered);
//}

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