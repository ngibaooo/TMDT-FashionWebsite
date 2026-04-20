// FIX ROOT CAUSE: Đảm bảo không khai báo lại BASE_URL
if (typeof window.BASE_URL === 'undefined') {
    window.BASE_URL = "http://localhost:8080";
}

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

async function fetchProducts() {
    const grid = document.getElementById("products-grid");
    if (!grid) return;
    
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">ĐANG TẢI DỮ LIỆU...</p>';

    try {
        const sort = document.getElementById("sort-select")?.value;
        const price = document.getElementById("filter-price")?.value;
        const size = document.getElementById("filter-size")?.value;

        /**
         * TRACE DATA FLOW:
         * Xây dựng tham số để gửi lên Backend. 
         * Chúng ta sẽ gửi cả Price và Size lên API /filter.
         */
        let params = new URLSearchParams();
        params.append("page", 0);
        params.append("size", 20);

        // 1. Gửi lọc Giá lên Server
        if (price) {
            const [min, max] = price.split("-");
            params.append("minPrice", min);
            if (max && max !== '2000000' && max !== '5000000') {
                params.append("maxPrice", max);
            }
        }

        // 2. Gửi lọc Size lên Server (Thay vì lọc tại JS)
        if (size) {
            params.append("productSize", size.toUpperCase().trim());
        }

        // 3. Quyết định Endpoint
        let url = (price || size) 
            ? `${window.BASE_URL}/api/products/filter?${params.toString()}`
            : `${window.BASE_URL}/api/products?${params.toString()}`;

        console.log("ĐANG GỌI API VỚI SIZE:", url);

        const res = await fetch(url);
        if (!res.ok) throw new Error("API_ERROR");

        const data = await res.json();
        let products = data.content || data || [];

        // 4. Sắp xếp tại Client (Giữ nguyên logic bạn muốn)
        if (sort && Array.isArray(products)) {
            if (sort === "price_asc") products.sort((a, b) => a.price - b.price);
            else if (sort === "price_desc") products.sort((a, b) => b.price - a.price);
            else if (sort === "newest") products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        renderProducts(products);

    } catch (err) {
        console.error("Lỗi fetch products:", err);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">KHÔNG THỂ TẢI DỮ LIỆU TỪ SERVER.</p>';
    }
}

/**
 * RENDER PRODUCTS
 * Bây giờ hàm này cực kỳ đơn giản: Chỉ việc hiển thị những gì Server đã lọc.
 */
function renderProducts(products) {
    const grid = document.getElementById("products-grid");
    grid.innerHTML = "";

    if (!Array.isArray(products) || products.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 100px; color: #555;">KHÔNG CÓ SẢN PHẨM NÀO KHỚP VỚI BỘ LỌC.</p>';
        return;
    }

    products.forEach(p => {
        // Xử lý ảnh đồng bộ với localhost:8080
        const img = (p.images && p.images.length > 0) ? p.images[0] : "/images/default-product.png";
        const finalImgUrl = img.startsWith('http') ? img : `${window.BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`;

        grid.innerHTML += `
            <a href="/products/${p.id}" class="product-card">
                <div class="img-box">
                    <img src="${finalImgUrl}" alt="${p.name}" onerror="this.src='/images/default-product.png'">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p class="price">${formatMoney(p.price)}</p>
                </div>
            </a>
        `;
    });
}

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount || 0);
}