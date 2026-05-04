// ===== GLOBAL =====
const OUTERWEAR_ID = "c3";

let currentPage = 0;
let totalPages = 0;

if (typeof window.BASE_URL === 'undefined') {
    window.BASE_URL = "http://localhost:8080";
}

document.addEventListener("DOMContentLoaded", () => {
    fetchOuterwear(true);
});

// ===== FETCH =====
async function fetchOuterwear(reset = false) {
    const grid = document.getElementById("outerwear-grid");

    if (!grid) return;

    if (reset) currentPage = 0;

    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;">ĐANG TẢI...</p>`;

    try {
        const sort = document.getElementById("sort-select")?.value;
        const price = document.getElementById("filter-price")?.value;
        const size = document.getElementById("filter-size")?.value;

        let params = new URLSearchParams();
        params.append("page", currentPage);
        params.append("size", 4);

        // ===== SORT =====
        if (sort) params.append("sort", sort);

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

        // ===== CATEGORY (QUAN TRỌNG NHẤT) =====
        params.append("categoryId", OUTERWEAR_ID);

        const url = `${window.BASE_URL}/api/products/filter?${params.toString()}`;

        console.log("CALL API:", url);

        const res = await fetch(url);
        if (!res.ok) throw new Error("API_ERROR");

        const data = await res.json();

        const products = data.content || [];

        // ===== PAGINATION =====
        totalPages = data.totalPages || 1;
        currentPage = data.number || 0;

        renderProducts(products);
        renderPagination();

    } catch (err) {
        console.error(err);
        grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:red;">LỖI LOAD DATA</p>`;
    }
}

// ===== RENDER =====
function renderProducts(products) {
    const grid = document.getElementById("outerwear-grid");
    grid.innerHTML = "";

    if (!products || products.length === 0) {
        grid.innerHTML = `
            <p style="grid-column:1/-1;text-align:center;padding:100px;color:#555;">
                KHÔNG CÓ SẢN PHẨM
            </p>`;
        return;
    }

    grid.innerHTML = products.map(p => {
        const img = (p.images && p.images.length > 0)
            ? p.images[0]
            : "/images/default.jpg";

        const finalImg = img.startsWith("http")
            ? img
            : `${window.BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;

        return `
            <a href="/products/${p.id}" class="product-card">
                <div class="img-box">
                    <img src="${finalImg}"
                         onerror="this.src='/images/default.jpg'">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p class="price">${formatMoney(p.price)}</p>
                </div>
            </a>
        `;
    }).join("");
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
    fetchOuterwear();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ===== FORMAT =====
function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount || 0);
}