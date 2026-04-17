/**
 * LƯU Ý: Thay "bottoms" bằng ID thật trong DB của bạn.
 */
const BOTTOMS_ID = "bottoms"; 

document.addEventListener('DOMContentLoaded', () => {
    fetchBottoms();
});

async function fetchBottoms() {
    const grid = document.getElementById('bottoms-grid');
    const sort = document.getElementById('sort-select').value;
    const priceRange = document.getElementById('filter-price').value;
    const size = document.getElementById('filter-size').value;

    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #444;">ĐANG TẢI DỮ LIỆU...</p>';

    let url = `/api/products/category/${BOTTOMS_ID}?page=0&size=12&sort=${sort}`;
    
    if (priceRange || size) {
        url = `/api/products/filter?page=0&size=12&category=${BOTTOMS_ID}`;
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
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 100px; color: #555;">CHƯA CÓ MẪU QUẦN NÀO KHỚP VỚI BỘ LỌC.</p>';
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
        console.error("Lỗi fetch:", error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff4d4d; padding: 50px;">KHÔNG THỂ TẢI DỮ LIỆU.</p>';
    }
    /**
// * HÀM KIỂM TRA VÀ HIỂN THỊ AVATAR TRÊN HEADER
// */
//function updateHeaderAvatar() {
//    const userName = localStorage.getItem("userName");
//    // Tìm thẻ 'a' chứa icon person (thường là link dẫn đến trang login)
//    const loginLink = document.querySelector('a[href*="login"]');
//
//    if (userName && loginLink) {
//        // Lấy chữ cái đầu tiên và viết hoa
//        const firstLetter = userName.charAt(0).toUpperCase();
//
//        // Thay thế icon bằng vòng tròn Avatar
//        loginLink.innerHTML = `<div class="user-avatar"
//                                    style="width: 32px;
//                                           height: 32px;
//                                           background: #fff;
//                                           color: #000;
//                                           border-radius: 50%;
//                                           display: flex;
//                                           align-items: center;
//                                           justify-content: center;
//                                           font-weight: 900;
//                                           font-size: 14px;
//                                           text-transform: uppercase;
//                                           cursor: pointer;"
//                                    title="${userName}">${firstLetter}</div>`;
//
//        // Đổi link dẫn sang trang Profile thay vì trang Login
//        loginLink.href = "/user/profile";
//    }
//}

// Chạy hàm ngay khi trang web tải xong
document.addEventListener("DOMContentLoaded", updateHeaderAvatar);
}