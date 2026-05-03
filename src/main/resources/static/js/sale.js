
// document.addEventListener('DOMContentLoaded', () => {
//     fetchSaleProducts();
// });

// async function fetchSaleProducts() {
//     const grid = document.getElementById('sale-grid');
//     if (!grid) return;

//     // Trạng thái đang tải
//     grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #444;">ĐANG TÌM KIẾM CÁC DEAL HỜI...</p>';

//     try {
//         const response = await fetch('/api/products/filter?page=0&size=12&maxPrice=1000000');
//         if (!response.ok) throw new Error("API_ERROR");

//         const data = await response.json();
//         const products = data.content || data || [];

//         if (products.length === 0) {
//             grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 100px; color: #555;">HIỆN CHƯA CÓ CHƯƠNG TRÌNH KHUYẾN MÃI NÀO.</p>';
//             return;
//         }


//         grid.innerHTML = products.map(p => {
//             // Đồng bộ xử lý ảnh với các trang tops/bottoms
//             let displayImg = '/images/default.jpg';
//             if (p.images && p.images.length > 0) {
//                 const imgPath = p.images[0];
//                 displayImg = imgPath.startsWith('http') ? imgPath : `http://localhost:8080${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
//             }

//             return `
//                 <a href="/products/${p.id}" class="product-card">
//                     <div class="img-box">
//                         <img src="${displayImg}" 
//                              alt="${p.name}"
//                              onerror="this.onerror=null; this.src='/images/default.jpg'"/>
//                     </div>
//                     <div class="product-info">
//                         <h3 style="font-size:13px; font-weight:700; text-transform:uppercase; margin-bottom:5px;">${p.name}</h3>
//                         <div class="price-container">
//                             <p style="color:#ff4d4d; font-weight:700; margin:0;">${new Intl.NumberFormat('vi-VN').format(p.price)}đ</p>
//                             <span style="font-size:10px; color:#555; text-decoration:line-through;">${new Intl.NumberFormat('vi-VN').format(p.price * 1.2)}đ</span>
//                         </div>
//                     </div>
//                 </a>
//             `;
//         }).join('');

//     } catch (e) { 
//         console.error("Lỗi fetch SALE:", e);
//         grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff4d4d; padding: 50px;">KHÔNG THỂ TẢI DỮ LIỆU SALE. VUI LÒNG THỬ LẠI.</p>';
//     }
// }
/**
 * EAZY VIBES - SALE PAGE ENGINE
 * FIX: Bypass lỗi 400 của API /filter bằng cách sử dụng API danh sách chuẩn
 */

document.addEventListener('DOMContentLoaded', () => {
    fetchSaleProducts();
});

async function fetchSaleProducts() {
    const grid = document.getElementById('sale-grid');
    if (!grid) return;

    // Trạng thái đang tải
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #444; font-weight: 700;">ĐANG SĂN TÌM CÁC DEAL HỜI...</p>';

    try {
        /**
         * THAY ĐỔI CHIẾN THUẬT:
         * API /filter bị lỗi 400 do logic 'fetch' ở Backend. 
         * Chúng ta sẽ dùng API /api/products (Public) và lấy số lượng lớn hơn để lọc tại Client.
         */
        const response = await fetch('http://localhost:8080/api/products?page=0&size=50&sort=price,asc');
        
        if (!response.ok) {
            throw new Error("API_ERROR");
        }

        const data = await response.json();
        // Lấy content từ Page object
        let products = data.content || [];

        // Lọc sản phẩm có giá dưới 1.000.000đ tại Frontend để đảm bảo trang không bị trống
        const saleProducts = products.filter(p => p.price <= 1000000);

        if (saleProducts.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 100px; color: #555; font-weight: 700;">HIỆN CHƯA CÓ CHƯƠNG TRÌNH KHUYẾN MÃI PHÙ HỢP.</p>';
            return;
        }

        grid.innerHTML = saleProducts.map(p => {
            // Đồng bộ xử lý ảnh với các trang admin/variants
            let displayImg = '/images/default.jpg';
            if (p.images && p.images.length > 0) {
                const imgPath = p.images[0];
                // Kiểm tra xem đường dẫn có cần prefix localhost không
                displayImg = imgPath.startsWith('http') ? imgPath : `http://localhost:8080${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
            }

            // Tính giá cũ giả lập (Sale 20%) nếu Backend không trả về oldPrice
            const oldPrice = p.oldPrice || (p.price * 1.25);

            return `
                <a href="/products/${p.id}" class="product-card" style="text-decoration: none; color: inherit;">
                    <div class="img-box" style="position: relative; overflow: hidden; background: #f9f9f9;">
                        <div class="sale-badge" style="position: absolute; top: 10px; left: 10px; background: #ff4d4d; color: #fff; padding: 4px 8px; font-size: 10px; font-weight: 900; z-index: 2;">SALE</div>
                        <img src="${displayImg}" 
                             alt="${p.name}"
                             style="width: 100%; aspect-ratio: 3/4; object-fit: cover; transition: 0.3s;"
                             onerror="this.onerror=null; this.src='/images/default.jpg'"/>
                    </div>
                    <div class="product-info" style="padding: 15px 5px;">
                        <h3 style="font-size:12px; font-weight:900; text-transform:uppercase; margin: 0 0 8px 0; letter-spacing: -0.5px;">${p.name}</h3>
                        <div class="price-container" style="display: flex; align-items: center; gap: 10px;">
                            <p style="color:#ff4d4d; font-weight:900; margin:0; font-size: 14px;">${new Intl.NumberFormat('vi-VN').format(p.price)}đ</p>
                            <span style="font-size:11px; color:#aaa; text-decoration:line-through; font-weight: 600;">${new Intl.NumberFormat('vi-VN').format(oldPrice)}đ</span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');

    } catch (e) { 
        console.error("Lỗi fetch SALE:", e);
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <p style="color: #ff4d4d; font-weight: 900; font-size: 18px;">HỆ THỐNG ĐANG BẢO TRÌ BỘ LỌC</p>
                <p style="color: #666; font-size: 13px;">Chúng tôi sẽ sớm quay lại với các ưu đãi mới nhất.</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #000; color: #fff; border: none; font-weight: 800; cursor: pointer;">THỬ LẠI</button>
            </div>
        `;
    }
}