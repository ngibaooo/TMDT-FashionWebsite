const API_BASE = '/api/products';
let currentPage = 0;
const pageSize = 8;

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();

    // Sự kiện thay đổi Sort
    document.getElementById('sortSelect').addEventListener('change', () => {
        currentPage = 0; // Reset về trang đầu khi đổi sort
        fetchProducts();
    });

    // Sự kiện tìm kiếm (Debounce để tránh gọi API liên tục)
    let timeout = null;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const keyword = e.target.value;
            if (keyword) {
                searchProducts(keyword);
            } else {
                fetchProducts();
            }
        }, 500);
    });
});

// Hàm lấy danh sách sản phẩm (Theo phân trang và sort)
async function fetchProducts() {
    const sort = document.getElementById('sortSelect').value;
    const url = `${API_BASE}?page=${currentPage}&size=${pageSize}${sort ? '&sort=' + sort : ''}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        renderProducts(data.content);
        renderPagination(data.totalPages);
    } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
        document.getElementById('productGrid').innerHTML = '<p>Không thể tải dữ liệu. Vui lòng thử lại.</p>';
    }
}

// Hàm tìm kiếm
async function searchProducts(keyword) {
    const url = `${API_BASE}/search?keyword=${encodeURIComponent(keyword)}&page=0&size=${pageSize}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        renderProducts(data.content);
        renderPagination(data.totalPages);
    } catch (error) {
        console.error('Lỗi tìm kiếm:', error);
    }
}

// Render HTML cho danh sách sản phẩm
function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    if (!products || products.length === 0) {
        grid.innerHTML = '<p>Không tìm thấy sản phẩm nào.</p>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <a href="/product/${product.id}" class="product-card">
            <img src="${product.images && product.images[0] ? product.images[0] : '/images/default.jpg'}" 
                 class="product-image" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="price-group">
                    <span class="current-price">${new Intl.NumberFormat('vi-VN').format(product.price)}đ</span>
                    ${product.oldPrice ? `<span class="old-price">${new Intl.NumberFormat('vi-VN').format(product.oldPrice)}đ</span>` : ''}
                </div>
            </div>
        </a>
    `).join('');
}

// Render các nút phân trang
function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    let html = '';
    
    for (let i = 0; i < totalPages; i++) {
        html += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">${i + 1}</button>
        `;
    }
    container.innerHTML = html;
}

// Chuyển trang
function changePage(page) {
    currentPage = page;
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}