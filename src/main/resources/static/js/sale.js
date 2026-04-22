
document.addEventListener('DOMContentLoaded', () => {
    fetchSaleProducts();
});

async function fetchSaleProducts() {
    const grid = document.getElementById('sale-grid');
    if (!grid) return;

    // Trạng thái đang tải
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #444;">ĐANG TÌM KIẾM CÁC DEAL HỜI...</p>';

    try {
        const response = await fetch('/api/products/filter?page=0&size=12&maxPrice=1000000');
        if (!response.ok) throw new Error("API_ERROR");

        const data = await response.json();
        const products = data.content || data || [];

        if (products.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 100px; color: #555;">HIỆN CHƯA CÓ CHƯƠNG TRÌNH KHUYẾN MÃI NÀO.</p>';
            return;
        }


        grid.innerHTML = products.map(p => {
            // Đồng bộ xử lý ảnh với các trang tops/bottoms
            let displayImg = '/images/default.jpg';
            if (p.images && p.images.length > 0) {
                const imgPath = p.images[0];
                displayImg = imgPath.startsWith('http') ? imgPath : `http://localhost:8080${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
            }

            return `
                <a href="/products/${p.id}" class="product-card">
                    <div class="img-box">
                        <img src="${displayImg}" 
                             alt="${p.name}"
                             onerror="this.onerror=null; this.src='/images/default.jpg'"/>
                    </div>
                    <div class="product-info">
                        <h3 style="font-size:13px; font-weight:700; text-transform:uppercase; margin-bottom:5px;">${p.name}</h3>
                        <div class="price-container">
                            <p style="color:#ff4d4d; font-weight:700; margin:0;">${new Intl.NumberFormat('vi-VN').format(p.price)}đ</p>
                            <span style="font-size:10px; color:#555; text-decoration:line-through;">${new Intl.NumberFormat('vi-VN').format(p.price * 1.2)}đ</span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');

    } catch (e) { 
        console.error("Lỗi fetch SALE:", e);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff4d4d; padding: 50px;">KHÔNG THỂ TẢI DỮ LIỆU SALE. VUI LÒNG THỬ LẠI.</p>';
    }
}