// ===== GLOBAL =====
let currentPage = 0;
let totalPages = 0;

if (typeof window.BASE_URL === 'undefined') {
    window.BASE_URL = "http://localhost:8080";
}

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts(true);
});

// ===== FETCH PRODUCTS =====
async function fetchProducts(reset = false) {
    const grid = document.getElementById("products-grid");
    if (!grid) return;

    // reset page khi filter/sort
    if (reset) currentPage = 0;

    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;">ĐANG TẢI DỮ LIỆU...</p>`;

    try {
        const sort = document.getElementById("sort-select")?.value;
        const price = document.getElementById("filter-price")?.value;
        const size = document.getElementById("filter-size")?.value;

        let params = new URLSearchParams();
        params.append("page", currentPage);
        params.append("size", 4);

        // ===== FILTER PRICE =====
        if (price) {
            const [min, max] = price.split("-");
            params.append("minPrice", min);
            if (max) params.append("maxPrice", max);
        }

        // ===== FILTER SIZE =====
        if (size) {
            params.append("productSize", size.toUpperCase().trim());
        }

        // ===== SORT (QUAN TRỌNG) =====
//        if (sort) {
//            params.append("sort", sort);
//        }
if (sort === "price_asc") {
    params.append("sort", "price,asc");
} else if (sort === "price_desc") {
    params.append("sort", "price,desc");
} else if (sort === "newest") {
    params.append("sort", "createdAt,desc");
}

        // ===== API =====
        let url = (price || size)
            ? `${window.BASE_URL}/api/products/filter?${params.toString()}`
            : `${window.BASE_URL}/api/products?${params.toString()}`;

        console.log("CALL API:", url);

        const res = await fetch(url);
        if (!res.ok) throw new Error("API_ERROR");

        const data = await res.json();

        const products = data.content || [];

        // ===== PAGINATION DATA =====
        totalPages = data.totalPages || 1;
        currentPage = data.number || 0;

        // ===== RENDER =====
        renderProducts(products);
        renderPagination();

    } catch (err) {
        console.error(err);
        grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:red;">LỖI LOAD DATA</p>`;
    }
}

// ===== RENDER PRODUCTS =====
function renderProducts(products) {
    const grid = document.getElementById("products-grid");
    grid.innerHTML = "";

    if (!products || products.length === 0) {
        grid.innerHTML = `
            <p style="grid-column:1/-1;text-align:center;padding:100px;color:#555;">
                KHÔNG CÓ SẢN PHẨM
            </p>`;
        return;
    }

    products.forEach(p => {
        const img = (p.images && p.images.length > 0)
            ? p.images[0]
            : "/images/default-product.png";

        const finalImgUrl = img.startsWith('http')
            ? img
            : `${window.BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`;

        grid.innerHTML += `
            <a href="/products/${p.id}" class="product-card">
                <div class="img-box">
                    <img src="${finalImgUrl}"
                         onerror="this.src='/images/default-product.png'">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p class="price">${formatMoney(p.price)}</p>
                </div>
            </a>
        `;
    });
}

// ===== PAGINATION =====
function renderPagination() {
    const container = document.getElementById("pagination");
    if (!container) return;

    container.innerHTML = "";

    if (totalPages <= 1) return;

    // PREV
    container.innerHTML += `
        <button ${currentPage === 0 ? "disabled" : ""}
            onclick="changePage(${currentPage - 1})">
            ←
        </button>
    `;

    // PAGE NUMBERS (giới hạn hiển thị cho đẹp)
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 3);

    for (let i = start; i < end; i++) {
        container.innerHTML += `
            <button class="${i === currentPage ? "active" : ""}"
                onclick="changePage(${i})">
                ${i + 1}
            </button>
        `;
    }

    // NEXT
    container.innerHTML += `
        <button ${currentPage === totalPages - 1 ? "disabled" : ""}
            onclick="changePage(${currentPage + 1})">
            →
        </button>
    `;
}

// ===== CHANGE PAGE =====
function changePage(page) {
    if (page < 0 || page >= totalPages) return;
    currentPage = page;
    fetchProducts();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ===== FORMAT MONEY =====
function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount || 0);
}