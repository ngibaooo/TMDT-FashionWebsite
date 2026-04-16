document.addEventListener('DOMContentLoaded', () => {
    updateHeaderAvatar();
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
function updateHeaderAvatar() {
    const userName = localStorage.getItem("userName");
    const loginLink = document.querySelector('.header-right a[href*="login"]') 
                   || document.getElementById('user-avatar-link');
    if (userName && loginLink) {
        const firstLetter = userName.charAt(0).toUpperCase();
        loginLink.innerHTML = `<div class="user-avatar" title="${userName}">${firstLetter}</div>`;
        loginLink.href = "/user/profile";
    }
}

/**
 * LOGIC 3: LẤY DANH SÁCH 8 SẢN PHẨM MỚI NHẤT
 * Gọi API từ Backend và render ra Grid trang chủ
 */
async function fetchFeaturedProducts() {
    const grid = document.getElementById('index-products-grid');
    
    try {
        const response = await fetch('/api/products/new?size=8');
        if (!response.ok) throw new Error("Không thể kết nối API");

        const data = await response.json();
        const products = data.content || [];

        if (products.length > 0) {
            grid.innerHTML = products.map(p => {
                // Xử lý lấy URL ảnh đầu tiên từ danh sách images (Object ProductImage)
                let displayImg = 'https://via.placeholder.com/400x533?text=EAZY+VIBES';
                if (p.images && p.images.length > 0) {
                    displayImg = p.images[0].url;
                }

                const formattedPrice = new Intl.NumberFormat('vi-VN').format(p.price) + 'đ';

                return `
                    <a href="/products/${p.id}" class="product-card">
                        <div class="img-box">
                            <img src="${displayImg}" 
                                 alt="${p.name}" 
                                 onerror="this.src='https://via.placeholder.com/400x533?text=EAZY+VIBES'">
                        </div>
                        <div class="product-info">
                            <h3>${p.name}</h3>
                            <div class="price">${formattedPrice}</div>
                        </div>
                    </a>
                `;
            }).join('');
        } else {
            grid.innerHTML = '<p class="empty-msg">HIỆN CHƯA CÓ SẢN PHẨM MỚI.</p>';
        }

    } catch (error) {
        console.error("Lỗi Fetch:", error);
        grid.innerHTML = '<p class="error-msg">LỖI TẢI DỮ LIỆU SẢN PHẨM.</p>';
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