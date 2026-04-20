/**
 * EAZY VIBES - OUTERWEAR LOGIC (FIXED)
 * Giải quyết lỗi hiện sai sản phẩm danh mục khác khi dùng bộ lọc.
 * ID DANH MỤC TRONG DB: c3 (Áo khoác)
 */
const OUTERWEAR_ID = "c3";

document.addEventListener('DOMContentLoaded', () => {
    fetchOuterwear();
});

async function fetchOuterwear() {
    const grid = document.getElementById('outerwear-grid');
    const sort = document.getElementById('sort-select').value;
    const priceRange = document.getElementById('filter-price').value;
    const size = document.getElementById('filter-size').value;

    if (!grid) return;

    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #444;">ĐANG TẢI DỮ LIỆU ÁO KHOÁC...</p>';

    // TRACE FLOW: Xác định trạng thái người dùng có đang lọc hay không
    let isFiltering = (priceRange || size);
    let url = `/api/products/category/${OUTERWEAR_ID}?page=0&size=12&sort=${sort}`;

    if (isFiltering) {
        // CẢNH BÁO: API filter này hiện trả về hỗn hợp tất cả danh mục
        url = `/api/products/filter?page=0&size=12&sort=${sort}`;
        
        if (size) url += `&productSize=${size.toUpperCase().trim()}`;
        if (priceRange) {
            const [min, max] = priceRange.split('-');
            url += `&minPrice=${min}`;
            // Ngưỡng lọc giá tối đa đồng bộ 2.000.000đ
            if (max !== '2000000' && max !== '5000000') url += `&maxPrice=${max}`;
        }
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API_ERROR");

        const data = await response.json();
        
        // Trích xuất mảng sản phẩm từ Page object
        let products = data.content || data || [];

        // DEBUG: Kiểm tra cấu trúc dữ liệu thực tế tại F12 Console
        console.log("Dữ liệu Áo khoác từ Server:", products);

        /**
         * GIẢI PHÁP ROOT CAUSE: Lọc lại tại Frontend
         * Mục đích: Chỉ giữ lại đúng sản phẩm thuộc c3
         */
        if (isFiltering) {
            products = products.filter(p => {
                const catIdFromObject = p.category ? p.category.id : null;
                const catIdDirect = p.categoryId;
                const catName = p.categoryName; 

                // Kiểm tra khớp mã c3 hoặc tên Áo khoác (đề phòng dữ liệu DB)
                return (catIdFromObject === OUTERWEAR_ID || catIdDirect === OUTERWEAR_ID || catName === "Áo khoác");
            });
        }

        if (products.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 100px; color: #555;">HIỆN KHÔNG CÓ MẪU ÁO KHOÁC NÀO KHỚP VỚI BỘ LỌC.</p>';
            return;
        }

        grid.innerHTML = products.map(p => {
            // Xử lý logic hiển thị ảnh: http://localhost:8080 + path
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
                             onerror="this.onerror=null; this.src='/images/default.jpg'">
                    </div>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <div class="price">${new Intl.NumberFormat('vi-VN').format(p.price)}đ</div>
                    </div>
                </a>
            `;
        }).join('');

    } catch (error) {
        console.error("Lỗi fetch OUTERWEAR:", error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff4d4d; padding: 50px;">KHÔNG THỂ TẢI DỮ LIỆU. VUI LÒNG THỬ LẠI.</p>';
    }
}