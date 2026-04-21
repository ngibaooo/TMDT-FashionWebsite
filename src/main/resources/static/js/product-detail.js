if (typeof window.BASE_URL === 'undefined') {
    window.BASE_URL = "http://localhost:8080";
}

let productVariants = [];
let selectedColor = null;
let selectedSize = null;
let selectedVariantId = null;

// Hàm xử lý ảnh (Đồng bộ với Header - Xử lý khoảng trắng)
function getEzImageUrl(path) {
    if (!path || path === "" || path === "null") return "/images/default.jpg";
    if (path.startsWith("http")) return path;
    let cleanPath = path.replace(/^\//, '');
    if (cleanPath.startsWith('uploads/')) cleanPath = cleanPath.replace('uploads/', '');
    return `${window.BASE_URL}/uploads/${encodeURI(cleanPath)}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const pathSegments = window.location.pathname.split('/').filter(s => s !== "");
    const productId = pathSegments[pathSegments.length - 1];
    if (productId) fetchProductDetail(productId);
});

async function fetchProductDetail(id) {
    try {
        const res = await fetch(`${window.BASE_URL}/api/products/${id}`);
        if (!res.ok) throw new Error("API_ERROR");

        const data = await res.json();
        productVariants = data.variants || [];

        // 1. Thông tin cơ bản
        document.getElementById('product-name').innerText = data.name;
        document.getElementById('product-price').innerText = new Intl.NumberFormat('vi-VN').format(data.price) + 'đ';
        document.getElementById('product-desc').innerText = data.description || "Mô tả sản phẩm.";
        document.getElementById('breadcrumb-cat').innerText = data.categoryName || "Cửa hàng";

        // 2. Hình ảnh
        const mainImg = document.getElementById('main-product-img');
        const thumbList = document.getElementById('thumbnail-list');

        if (data.images && data.images.length > 0) {
            mainImg.src = getEzImageUrl(data.images[0]);
            thumbList.innerHTML = data.images.map((name, idx) => {
                const url = getEzImageUrl(name);
                return `<img src="${url}" class="${idx === 0 ? 'active' : ''}" onclick="changeSlide('${url}', this)">`;
            }).join('');
        }

        // 3. Hiển thị Chips Màu/Size
        renderVariantSelection();

    } catch (err) {
        console.error("Lỗi:", err);
        document.getElementById('product-name').innerText = "KHÔNG TÌM THẤY SẢN PHẨM";
    }
}

function renderVariantSelection() {
    const colors = [...new Set(productVariants.map(v => v.color))].filter(Boolean);
    const sizes = [...new Set(productVariants.map(v => v.size))].filter(Boolean);

    const colorContainer = document.getElementById('color-options');
    const sizeContainer = document.getElementById('size-options');

    // COLOR
    colorContainer.innerHTML = colors.map(c => {
        const hasStock = productVariants.some(v => v.color === c && v.quantity > 0);

        return `
            <div class="option-chip ${!hasStock ? 'disabled' : ''}"
                 data-val="${c}"
                 ${hasStock ? `onclick="selectChip(this, 'color')"` : ''}>
                ${c}
            </div>
        `;
    }).join('');

    // SIZE
    sizeContainer.innerHTML = sizes.map(s => {
        const hasStock = productVariants.some(v => v.size === s && v.quantity > 0);

        return `
            <div class="option-chip ${!hasStock ? 'disabled' : ''}"
                 data-val="${s}"
                 ${hasStock ? `onclick="selectChip(this, 'size')"` : ''}>
                ${s}
            </div>
        `;
    }).join('');

    // auto select nếu chỉ có 1 option và còn hàng
    if (colors.length === 1) {
        const el = colorContainer.querySelector('.option-chip:not(.disabled)');
        if (el) el.click();
    }

    if (sizes.length === 1) {
        const el = sizeContainer.querySelector('.option-chip:not(.disabled)');
        if (el) el.click();
    }
}
function selectChip(el, type) {
    el.parentElement.querySelectorAll('.option-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');

    if (type === 'color') selectedColor = el.getAttribute('data-val');
    if (type === 'size') selectedSize = el.getAttribute('data-val');

    const match = productVariants.find(v => v.color === selectedColor && v.size === selectedSize);

    selectedVariantId = match ? match.id : null;

    //  HIỂN THỊ TỒN KHO
    const stockEl = document.getElementById("stock-info");
    if (stockEl && match) {
        stockEl.innerText = match.quantity > 0
            ? `Còn ${match.quantity} sản phẩm`
            : "Hết hàng";
    }
}
async function handleAddToCart() {

    if (!selectedVariantId) {
        alert("Vui lòng chọn Màu sắc và Kích thước!");
        return;
    }

    const selectedVariant = productVariants.find(v => v.id === selectedVariantId);

    if (!selectedVariant || selectedVariant.quantity <= 0) {
        alert("Sản phẩm đã hết hàng!");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "/login";

    const qtyInput = document.getElementById('buy-quantity');
    const qty = qtyInput ? parseInt(qtyInput.value) : 1;

    if (qty > selectedVariant.quantity) {
        alert(`Chỉ còn ${selectedVariant.quantity} sản phẩm`);
        return;
    }

    try {
        const res = await fetch(`${window.BASE_URL}/api/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ variantId: selectedVariantId, quantity: qty })
        });

        if (res.ok) {
            runFlyAnimation();

            let current = parseInt(localStorage.getItem('cartCount') || '0');
            localStorage.setItem('cartCount', (current + qty).toString());

            setTimeout(() => {
                if (window.syncGlobalCartBadge) window.syncGlobalCartBadge();
            }, 800);
        } else {
            alert("Lỗi khi thêm vào giỏ hàng!");
        }
    } catch (err) {
        console.error("Network Error:", err);
    }
}

function runFlyAnimation() {
    const startImg = document.getElementById('main-product-img');
    const badge = document.getElementById('cart-badge') || document.getElementById('cart-icon-target');
    if (!startImg || !badge) return;

    const flyer = startImg.cloneNode();
    const startRect = startImg.getBoundingClientRect();
    const targetRect = badge.getBoundingClientRect();

    Object.assign(flyer.style, {
        position: 'fixed', zIndex: '10000',
        top: `${startRect.top}px`, left: `${startRect.left}px`,
        width: `${startRect.width}px`, height: `${startRect.height}px`,
        transition: 'all 0.8s ease-in-out', objectFit: 'cover',
        borderRadius: '5px', pointerEvents: 'none', opacity: '0.7'
    });
    document.body.appendChild(flyer);

    setTimeout(() => {
        Object.assign(flyer.style, {
            top: `${targetRect.top}px`, left: `${targetRect.left}px`,
            width: '20px', height: '20px', opacity: '0'
        });
    }, 50);
    setTimeout(() => flyer.remove(), 800);
}

function changeSlide(url, el) {
    const main = document.getElementById('main-product-img');
    if (main) main.src = url;
    document.querySelectorAll('.thumb-list img').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
}

function changeQty(amt) {
    const input = document.getElementById('buy-quantity');
    if (!input) return;
    let val = parseInt(input.value) + amt;
    if (val < 1) val = 1;
    input.value = val;
}