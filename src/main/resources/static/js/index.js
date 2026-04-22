document.addEventListener('DOMContentLoaded', () => {
    if (window.syncGlobalCartBadge) {
        window.syncGlobalCartBadge();
    }

    const productGrid = document.getElementById('index-products-grid');
    if (productGrid) fetchFeaturedProducts();
});

async function fetchFeaturedProducts() {
    const grid = document.getElementById('index-products-grid');

    try {
        const response = await fetch('/api/products/best-selling?size=4');
        if (!response.ok) throw new Error("Không thể kết nối API");

        const data = await response.json();
        const products = (data.content || []).slice(0, 4);

//        grid.innerHTML = products.map(p => {
//            let displayImg = '/images/default-product.png';
//
//            if (p.images && p.images.length > 0) {
//                // Sử dụng đường dẫn tuyệt đối từ server
//                displayImg = "http://localhost:8080" + (p.images[0].startsWith('/') ? '' : '/') + p.images[0];
//            }
//
//            const price = new Intl.NumberFormat('vi-VN').format(p.price) + 'đ';
//
//            return `
//                <a href="/products/${p.id}" class="product-card">
//                    <div class="img-box">
//                        <img src="${displayImg}"
//                             onerror="this.src='/images/default-product.png'">
//                    </div>
//                    <div class="product-info">
//                        <h3>${p.name}</h3>
//                        <div class="price">${price}</div>
//                    </div>
//                </a>
//            `;
//        }).join('');
        grid.innerHTML = products.map(p => {

            const isOut = p.status === "OUT_OF_STOCK";

            let displayImg = '/images/default-product.png';

            if (p.images && p.images.length > 0) {
                displayImg = "http://localhost:8080" + (p.images[0].startsWith('/') ? '' : '/') + p.images[0];
            }

            const price = new Intl.NumberFormat('vi-VN').format(p.price) + 'đ';

            return `
                <a href="${isOut ? '#' : `/products/${p.id}`}"
                   class="product-card ${isOut ? 'out-of-stock' : ''}"
                   ${isOut ? 'onclick="return false;"' : ''}>

                    <div class="img-box">
                        <img src="${displayImg}"
                             onerror="this.src='/images/default-product.png'">

                        ${isOut ? `<div class="sold-out-overlay">HẾT HÀNG</div>` : ''}
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
        if (grid) grid.innerHTML = '<p>Lỗi tải sản phẩm</p>';
    }
}

// ĐIỀU KHIỂN SEARCH OVERLAY
function toggleSearch() {
    const overlay = document.getElementById('search-overlay');
    if (overlay) {
        overlay.classList.toggle('active');
        document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : 'auto';
    }
}

function showSearchDropdown() {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) dropdown.classList.add('active');
}

document.addEventListener('click', (e) => {
    const wrap = document.getElementById('search-bar-wrap');
    const dropdown = document.getElementById('search-dropdown');
    if (wrap && !wrap.contains(e.target)) {
        if (dropdown) dropdown.classList.remove('active');
    }
});

// HÀM ĐĂNG XUẤT (LOGOUT) - Đã có trong header.js nhưng giữ ở đây nếu bạn có nút logout riêng ở trang chủ
function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("cartCount"); 
    window.location.href = "/";
}