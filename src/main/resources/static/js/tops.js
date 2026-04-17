const TOPS_ID = "tops";

document.addEventListener('DOMContentLoaded', () => {
    fetchTops();
});

async function fetchTops() {
    const grid = document.getElementById('tops-grid');
    const sort = document.getElementById('sort-select').value;
    const priceRange = document.getElementById('filter-price').value;
    const size = document.getElementById('filter-size').value;

    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #444;">ĐANG TẢI DỮ LIỆU...</p>';

    let url = `/api/products/category/${TOPS_ID}?page=0&size=12&sort=${sort}`;

    if (priceRange || size) {
        url = `/api/products/filter?page=0&size=12&category=${TOPS_ID}`;
        if (size) url += `&size=${size}`;

        if (priceRange) {
            const [min, max] = priceRange.split('-');
            url += `&minPrice=${min}`;
            if (max !== '5000000') url += `&maxPrice=${max}`;
        }
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API_ERROR");

        const data = await response.json();
        const products = data.content || [];

        if (products.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 100px; color: #555;">CHƯA CÓ SẢN PHẨM NÀO.</p>';
            return;
        }

        grid.innerHTML = products.map(p => `
            <a href="/products/${p.id}" class="product-card">
                <div class="img-box">
                    <img src="${p.images && p.images.length > 0 ? p.images[0] : '/images/default.jpg'}"
                         alt="${p.name}"
                         onerror="this.src='https://via.placeholder.com/400x533?text=EAZY+VIBES'">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <div class="price">${new Intl.NumberFormat('vi-VN').format(p.price)}đ</div>
                </div>
            </a>
        `).join('');

    } catch (error) {
        console.error(error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">LỖI TẢI DỮ LIỆU</p>';
    }
}