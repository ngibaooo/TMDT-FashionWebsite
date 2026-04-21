document.addEventListener('DOMContentLoaded', () => {
    fetchBestSelling();
});

async function fetchBestSelling() {
    const grid = document.getElementById('best-grid');
    const countEl = document.getElementById('product-count');
    
    try {
        const response = await fetch('/api/products/best-selling?page=0&size=12');
        const data = await response.json();
        const products = data.content || [];
        
        countEl.innerText = `${data.totalElements} SẢN PHẨM ĐANG HOT`;

//        grid.innerHTML = products.map(p => `
//            <a href="/products/${p.id}" class="product-card">
//                <div class="img-box">
//                    <img src="${p.images && p.images.length > 0 ? p.images[0] : '/images/default.jpg'}"
//                         onerror="this.src='https://via.placeholder.com/400x533?text=BEST+SELLER'">
//                </div>
//                <div class="product-info">
//                    <h3 style="font-size:13px; font-weight:700; text-transform:uppercase; margin-bottom:5px;">${p.name}</h3>
//                    <p style="color:#888; font-size:13px;">${new Intl.NumberFormat('vi-VN').format(p.price)}đ</p>
//                </div>
//            </a>
//        `).join('');
        grid.innerHTML = products.map(p => {

            const isOut = p.status === "OUT_OF_STOCK";

            return `
                <a href="${isOut ? '#' : `/products/${p.id}`}"
                   class="product-card ${isOut ? 'out-of-stock' : ''}"
                   ${isOut ? 'onclick="return false;"' : ''}>

                    <div class="img-box">
                        <img src="${p.images && p.images.length > 0 ? p.images[0] : '/images/default.jpg'}"
                             onerror="this.src='https://via.placeholder.com/400x533?text=BEST+SELLER'">

                        ${isOut ? `<div class="sold-out-overlay">HẾT HÀNG</div>` : ''}
                    </div>

                    <div class="product-info">
                        <h3 style="font-size:13px; font-weight:700; text-transform:uppercase; margin-bottom:5px;">
                            ${p.name}
                        </h3>
                        <p style="color:#888; font-size:13px;">
                            ${new Intl.NumberFormat('vi-VN').format(p.price)}đ
                        </p>
                    </div>
                </a>
            `;
        }).join('');
    } catch (e)
    {
    console.error(e);
    }
}