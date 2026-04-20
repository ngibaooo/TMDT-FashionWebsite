const TOPS_ID = "c1"; // ID danh mục Áo

document.addEventListener('DOMContentLoaded', () => {
    fetchTops();
});

async function fetchTops() {
    const grid = document.getElementById('tops-grid');
    const sort = document.getElementById('sort-select').value;
    const priceRange = document.getElementById('filter-price').value;
    const size = document.getElementById('filter-size').value;

    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #444;">ĐANG TẢI DỮ LIỆU...</p>';

    // GIẢI PHÁP KIẾN TRÚC MỚI: Luôn sử dụng 1 API duy nhất (Filter) để tránh lỗi rẽ nhánh
    let params = new URLSearchParams();

    // 1. Tham số mặc định bắt buộc phải có
    params.append("category", TOPS_ID);
    params.append("page", 0);
    params.append("size", 12); // Tham số phân trang của Spring Boot

    // 2. Nối tham số Sắp xếp (Sort)
    if (sort) {
        params.append("sort", sort); // Spring Boot sẽ tự hiểu "price,asc" v.v.
    }

    // 3. Nối tham số Kích thước
    if (size) {
        params.append("productSize", size.toUpperCase().trim());
    }

    // 4. Nối tham số Giá
    if (priceRange) {
        const [min, max] = priceRange.split('-');
        params.append("minPrice", min);
        // Bỏ qua maxPrice nếu là mức tối đa vô cực (Trên 1,000,000đ / 1,500,000đ tùy trang)
        if (max !== '2000000' && max !== '5000000') {
            params.append("maxPrice", max);
        }
    }

    // URL cuối cùng được build hoàn hảo
    const url = `/api/products/filter?${params.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API_ERROR");

        const data = await response.json();

        // Xử lý dữ liệu trả về
        const products = Array.isArray(data) ? data : (data.content || []);

        if (products.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 100px; color: #555;">CHƯA CÓ SẢN PHẨM NÀO KHỚP VỚI BỘ LỌC.</p>';
            return;
        }

        grid.innerHTML = products.map(p => `
            <a href="/products/${p.id}" class="product-card">
                <div class="img-box">
                    <img src="${p.images && p.images.length > 0 ? p.images[0] : '/images/default.jpg'}"
                         alt="${p.name}"
                         onerror="this.onerror=null; this.src='/images/default.jpg'">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <div class="price">${new Intl.NumberFormat('vi-VN').format(p.price)}đ</div>
                </div>
            </a>
        `).join('');

    } catch (error) {
        console.error("Lỗi fetch:", error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff4d4d; padding: 50px;">LỖI TẢI DỮ LIỆU. VUI LÒNG THỬ LẠI.</p>';
    }
}