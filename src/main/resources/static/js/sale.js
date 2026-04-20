document.addEventListener('DOMContentLoaded', () => {
    fetchSaleProducts();
});

async function fetchSaleProducts() {
    const grid = document.getElementById('sale-grid');
    try {
        // Sử dụng filter API để lấy các sản phẩm có giá thấp hoặc theo logic sale của bạn
        const response = await fetch('/api/products/filter?page=0&size=12&maxPrice=1000000');
        const data = await response.json();
        const products = data.content || [];

        grid.innerHTML = products.map(p =>
            <a href="/products/${p.id}" class="product-card">
                <div class="img-box">
                    <img src="${p.images && p.images.length > 0 ? p.images[0] : '/images/default.jpg'}"
                         onerror="this.src='https://via.placeholder.com/400x533?text=SALE+OFF'">
                </div>
                <div class="product-info">
                    <h3 style="font-size:13px; font-weight:700; text-transform:uppercase; margin-bottom:5px;">${p.name}</h3>
                    <p style="color:#ff4d4d; font-weight:700;">${new Intl.NumberFormat('vi-VN').format(p.price)} VNĐ</p>
                </div>
            </a>
        ).join('');
    } catch (e) { console.error(e); }
}