/**
 * EAZY VIBES - TOPS LOGIC (FIXED)
 * Giải quyết lỗi mất sản phẩm khi dùng bộ lọc.
 */
const TOPS_ID = "c1";

document.addEventListener('DOMContentLoaded', () => {
    fetchTops();
});

async function fetchTops() {
    const grid = document.getElementById('tops-grid');
    const sort = document.getElementById('sort-select').value;
    const priceRange = document.getElementById('filter-price').value;
    const size = document.getElementById('filter-size').value;

    if (!grid) return;

    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #444;">ĐANG TẢI DỮ LIỆU ÁO...</p>';

    // TRACE FLOW: Xác định Endpoint
    let isFiltering = (priceRange || size);
    let url = `/api/products/category/${TOPS_ID}?page=0&size=12&sort=${sort}`;

    if (isFiltering) {
        url = `/api/products/filter?page=0&size=12&sort=${sort}`;
        if (size) url += `&productSize=${size.toUpperCase().trim()}`;
        if (priceRange) {
            const [min, max] = priceRange.split('-');
            url += `&minPrice=${min}`;
            if (max !== '2000000' && max !== '5000000') url += `&maxPrice=${max}`;
        }
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API_ERROR");

        const data = await response.json();
        
        // Lấy mảng gốc từ API
        let products = data.content || data || [];

        /**
         * DEBUG: Hãy nhấn F12, chọn tab Console để xem dòng này.
         * Nó sẽ hiện ra danh sách sản phẩm Server gửi về để bạn kiểm tra tên trường.
         */
        console.log("Dữ liệu từ Server:", products);

        /**
         * GIẢI PHÁP ROOT CAUSE: Lọc tại Frontend với logic an toàn hơn
         */
        if (isFiltering) {
            products = products.filter(p => {
                // Kiểm tra tất cả các trường hợp có thể chứa ID danh mục từ DTO của bạn
                const catIdFromObject = p.category ? p.category.id : null;
                const catIdDirect = p.categoryId;
                const catName = p.categoryName; // Đề phòng trường hợp Backend trả về tên

                // Nếu khớp c1 hoặc tên là Áo (đề phòng DB dùng tiếng Việt)
                return (catIdFromObject === TOPS_ID || catIdDirect === TOPS_ID || catName === "Áo");
            });
        }

        if (products.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 100px; color: #555;">CHƯA CÓ MẪU ÁO NÀO KHỚP VỚI BỘ LỌC.</p>';
            return;
        }

        grid.innerHTML = products.map(p => {
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
        console.error("Lỗi fetch TOPS:", error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff4d4d; padding: 50px;">LỖI TẢI DỮ LIỆU. VUI LÒNG THỬ LẠI.</p>';
    }
}