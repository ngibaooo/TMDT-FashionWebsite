/**
 * TRANG CHỦ EAZY VIBES - PHIÊN BẢN HOÀN THIỆN
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra trạng thái đăng nhập để hiển thị Avatar
    updateHeaderAvatar();

    // 2. Tải danh sách sản phẩm nổi bật (8 sản phẩm)
    fetchFeaturedProducts();
});

/**
 * LOGIC 1: HIỂN THỊ AVATAR NGƯỜI DÙNG
 * Đọc tên từ localStorage và thay thế icon person trên Header
 */
function updateHeaderAvatar() {
    const userName = localStorage.getItem("userName");
    
    // Tìm thẻ <a> dẫn đến trang login trong cụm header-right
    const loginLink = document.querySelector('.header-right a[href*="login"]');

    if (userName && loginLink) {
        // Lấy chữ cái đầu tiên của tên (Ví dụ: "Hải" -> "H")
        const firstLetter = userName.charAt(0).toUpperCase();
        
        // Thay thế icon bằng thẻ div Avatar hình tròn
        // Style được giữ đồng bộ với file index.css đã gửi
        loginLink.innerHTML = `<div class="user-avatar" title="Xin chào, ${userName}">${firstLetter}</div>`;
        
        // Thay đổi đường dẫn: Thay vì vào Login thì vào trang cá nhân
        loginLink.href = "/user/profile";
    }
}

/**
 * LOGIC 2: ĐIỀU KHIỂN SEARCH OVERLAY
 */
function toggleSearch() {
    const overlay = document.getElementById('search-overlay');
    if (overlay) {
        overlay.classList.toggle('active');
        // Ngăn cuộn trang khi đang mở search
        document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : 'auto';
    }
}

/**
 * LOGIC 3: LẤY DANH SÁCH SẢN PHẨM NỔI BẬT
 * Fetch 8 sản phẩm mới nhất từ API
 */
async function fetchFeaturedProducts() {
    const grid = document.getElementById('index-products-grid');
    if (!grid) return;

    try {
        // Gọi API lấy 8 sản phẩm (2 hàng x 4 cột)
        const response = await fetch('/api/products/new?size=8');
        
        if (!response.ok) throw new Error("API Connection Error");

        const data = await response.json();
        const products = data.content || [];

        if (products.length > 0) {
            grid.innerHTML = products.map(p => {
                // Xử lý ảnh: Nếu không có ảnh thì dùng Placeholder
                const displayImg = (p.images && p.images.length > 0) 
                                   ? p.images[0] 
                                   : 'https://via.placeholder.com/400x533?text=EAZY+VIBES+STUDIO';

                const formattedPrice = new Intl.NumberFormat('vi-VN').format(p.price) + 'đ';

                return `
                    <a href="/products/${p.id}" class="product-card">
                        <div class="img-box">
                            <img src="${displayImg}" 
                                 alt="${p.name}" 
                                 onerror="this.src='https://via.placeholder.com/400x533?text=EAZY+VIBES+STUDIO'">
                        </div>
                        <div class="product-info">
                            <h3>${p.name}</h3>
                            <div class="price">${formattedPrice}</div>
                        </div>
                    </a>
                `;
            }).join('');
        } else {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #444; padding: 50px;">HIỆN CHƯA CÓ SẢN PHẨM MỚI.</p>';
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff4d4d; padding: 50px;">KHÔNG THỂ TẢI DỮ LIỆU SẢN PHẨM.</p>';
    }
}

/**
 * LOGIC 4: HÀM ĐĂNG XUẤT (TÙY CHỌN)
 * Bạn có thể gọi hàm này khi khách nhấn vào nút Logout
 */
function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "/";
}