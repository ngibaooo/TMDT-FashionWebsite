document.addEventListener('DOMContentLoaded', () => {
//    updateHeaderAvatar();
    // Luôn chạy hàm này khi load trang để khớp số lượng giỏ hàng
    syncGlobalCartBadge();

    const productGrid = document.getElementById('index-products-grid');
    if (productGrid) fetchFeaturedProducts();
});

// Hàm này là "Sợi dây liên kết" toàn dự án
function syncGlobalCartBadge() {
    const badge = document.getElementById('cart-count');
    if (badge) {
        const count = localStorage.getItem("cartCount") || "0";
        badge.innerText = count;
        badge.style.display = (parseInt(count) > 0) ? "flex" : "none";
    }
}
async function fetchFeaturedProducts() {
    const grid = document.getElementById('index-products-grid');
    
    try {
        const response = await fetch('/api/products/best-selling?size=4');
        if (!response.ok) throw new Error("Không thể kết nối API");

        const data = await response.json();
        const products = (data.content || []).slice(0, 4);

        grid.innerHTML = products.map(p => {
            let displayImg = '/images/default-product.png';

            if (p.images && p.images.length > 0) {
                displayImg = "http://localhost:8080" + p.images[0];
            }

            const price =
                new Intl.NumberFormat('vi-VN').format(p.price) + 'đ';

            return `
                <a href="/product/${p.id}" class="product-card">
                    <div class="img-box">
                        <img src="${displayImg}"
                             onerror="this.src='/images/default-product.png'">
                    </div>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <div class="price">${price}</div>
                    </div>
                </a>
            `;
        }).join('');

    } catch (error) {
        console.error("Lỗi Fetch:", error);
        grid.innerHTML = '<p>Lỗi tải sản phẩm</p>';
    }
}

/**
 * LOGIC 4: ĐIỀU KHIỂN SEARCH OVERLAY
 */
function toggleSearch() {
    const overlay = document.getElementById('search-overlay');
    if (overlay) {
        overlay.classList.toggle('active');
        document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : 'auto';
    }
}

/**
 * LOGIC 5: HÀM ĐĂNG XUẤT (LOGOUT)
 */
function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    // Giữ lại cartCount nếu bạn muốn khách vẫn thấy giỏ hàng khi đăng xuất
    // localStorage.removeItem("cartCount"); 
    window.location.href = "/";
}