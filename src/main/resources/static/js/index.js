document.addEventListener('DOMContentLoaded', () => {
    fetchNewArrivals();
});

// Hàm bật tắt Search Overlay
function toggleSearch() {
    const overlay = document.getElementById('search-overlay');
    const isOpening = !overlay.classList.contains('active');
    
    overlay.classList.toggle('active');
    
    // Khóa cuộn trang khi mở search
    document.body.style.overflow = isOpening ? 'hidden' : 'auto';
}

async function fetchNewArrivals() {
    const grid = document.getElementById('index-products-grid');
    try {
        const response = await fetch('/api/products/new?size=4');
        const data = await response.json();
        const products = data.content || [];

        if (products.length > 0) {
            grid.innerHTML = products.map(p => `
                <a href="/products/${p.id}" class="product-card" style="text-decoration:none; color:#fff;">
                    <div class="img-wrapper" style="background:#111; aspect-ratio:3/4; overflow:hidden; margin-bottom:15px; border:1px solid #1a1a1a;">
                        <img src="${p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/400x533?text=EAZY+VIBES'}" 
                             alt="${p.name}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div class="product-info">
                        <h3 style="font-size:14px; font-weight:700; text-transform:uppercase; margin-bottom:5px;">${p.name}</h3>
                        <p style="color:#888; font-size:13px;">${new Intl.NumberFormat('vi-VN').format(p.price)} VNĐ</p>
                    </div>
                </a>
            `).join('');
        }
    } catch (e) { console.error("Lỗi API:", e); }
}