/**
 * EAZY VIBES - PRODUCT DETAIL LOGIC
 * Tích hợp: Slider, Chọn Variant, Gọi API Giỏ hàng & Animation
 */

let productVariants = []; 
let selectedColor = null;
let selectedSize = null;
let selectedVariantId = null;

document.addEventListener("DOMContentLoaded", () => {
    // Cách lấy ID an toàn hơn, không sợ dấu / ở cuối URL
    const pathSegments = window.location.pathname.split('/').filter(segment => segment !== "");
    const productId = pathSegments[pathSegments.length - 1];

    console.log("Đang xem sản phẩm ID:", productId);
    if (productId) fetchProductDetail(productId);
});

async function fetchProductDetail(id) {
    try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Không lấy được dữ liệu sản phẩm");
        
        const data = await res.json();
        productVariants = data.variants || [];

        // Đổ dữ liệu ra HTML
        document.getElementById('product-name').innerText = data.name;
        document.getElementById('product-price').innerText = new Intl.NumberFormat('vi-VN').format(data.price) + 'đ';
        document.getElementById('product-desc').innerText = data.description || "Sản phẩm streetwear cao cấp từ EAZY VIBES.";
        document.getElementById('breadcrumb-cat').innerText = data.category?.name || "Bộ sưu tập";

        // Render Slider
        if (data.images && data.images.length > 0) {
            document.getElementById('main-product-img').src = data.images[0].url;
            document.getElementById('thumbnail-list').innerHTML = data.images.map((img, idx) => 
                `<img src="${img.url}" class="${idx === 0 ? 'active' : ''}" onclick="changeSlide('${img.url}', this)">`
            ).join('');
        }

        // Render Color/Size Chips
        const colors = [...new Set(productVariants.map(v => v.color))].filter(c => c);
        const sizes = [...new Set(productVariants.map(v => v.size))].filter(s => s);

        document.getElementById('color-options').innerHTML = colors.map(c => 
            `<div class="option-chip" data-val="${c}" onclick="selectChip(this, 'color')">${c}</div>`
        ).join('');

        document.getElementById('size-options').innerHTML = sizes.map(s => 
            `<div class="option-chip" data-val="${s}" onclick="selectChip(this, 'size')">${s}</div>`
        ).join('');

        // Tự động chọn nếu chỉ có 1 lựa chọn
        if (colors.length === 1) document.querySelector('#color-options .option-chip').click();
        if (sizes.length === 1) document.querySelector('#size-options .option-chip').click();

    } catch (err) {
        console.error("Lỗi Fetch Detail:", err);
    }
}

function selectChip(el, type) {
    el.parentElement.querySelectorAll('.option-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');

    const val = el.getAttribute('data-val');
    if (type === 'color') selectedColor = val;
    if (type === 'size') selectedSize = val;

    checkAndFindVariant();
}

function checkAndFindVariant() {
    if (selectedColor && selectedSize) {
        const match = productVariants.find(v => v.color === selectedColor && v.size === selectedSize);
        if (match) {
            selectedVariantId = match.id;
            console.log("Đã khớp Variant ID:", selectedVariantId);
        } else {
            selectedVariantId = null;
            console.warn("Tổ hợp Color/Size này không tồn tại!");
        }
    }
}

/**
 * HÀM QUAN TRỌNG: THÊM VÀO GIỎ HÀNG THẬT
 */
async function handleAddToCart() {
    if (!selectedVariantId) {
        alert("Vui lòng chọn đầy đủ Màu sắc và Kích thước!");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Vui lòng đăng nhập để tiếp tục mua hàng!");
        window.location.href = "/login";
        return;
    }

    const qtyInput = document.getElementById('buy-quantity');
    const qty = qtyInput ? parseInt(qtyInput.value) : 1;

    // Chuẩn bị dữ liệu gửi đi (Đúng JSON bạn yêu cầu)
    const cartRequest = {
        variantId: selectedVariantId,
        quantity: qty
    };

    console.log("Gửi yêu cầu tới API:", cartRequest);

    try {
        const response = await fetch('http://localhost:8080/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(cartRequest)
        });

        if (response.ok) {
            console.log("API: Thêm vào giỏ hàng thành công!");
            
            // Chạy hiệu ứng bay
            runFlyAnimation();

            // Cập nhật số lượng ảo để Badge nhảy ngay lập tức
            let current = parseInt(localStorage.getItem('cartCount') || '0');
            localStorage.setItem('cartCount', current + qty);

            // Cập nhật Badge sau khi bay xong
            setTimeout(() => {
                if (window.syncGlobalCartBadge) {
                    window.syncGlobalCartBadge();
                } else {
                    console.warn("Không tìm thấy hàm syncGlobalCartBadge trong index.js");
                }
            }, 800);

        } else {
            const errorText = await response.text();
            console.error("API Error Response:", errorText);
            alert("Không thể thêm vào giỏ hàng. Vui lòng kiểm tra lại!");
        }
    } catch (err) {
        console.error("Network Error:", err);
        alert("Lỗi kết nối tới máy chủ!");
    }
}

function runFlyAnimation() {
    const startImg = document.getElementById('main-product-img');
    // Tìm mục tiêu bay tới: Thử ID target, nếu không có thì tìm icon giỏ hàng chung
    const cartIcon = document.getElementById('cart-icon-target') || document.querySelector('.material-symbols-outlined[onclick*="cart"]');
    
    if (!startImg || !cartIcon) {
        console.warn("Không tìm thấy điểm đầu hoặc điểm cuối để chạy animation!");
        return;
    }

    const flyer = startImg.cloneNode();
    const startRect = startImg.getBoundingClientRect();
    const targetRect = cartIcon.getBoundingClientRect();

    Object.assign(flyer.style, {
        position: 'fixed', zIndex: '10000',
        top: `${startRect.top}px`, left: `${startRect.left}px`,
        width: `${startRect.width}px`, height: `${startRect.height}px`,
        transition: 'all 0.8s cubic-bezier(0.42, 0, 0.58, 1)',
        objectFit: 'cover', borderRadius: '5px', pointerEvents: 'none'
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

// Slider & Quantity Utilities
function changeSlide(url, el) {
    const main = document.getElementById('main-product-img');
    if (main) main.src = url;
    document.querySelectorAll('.thumbnail-list img').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
}

function changeQty(amt) {
    const input = document.getElementById('buy-quantity');
    if (!input) return;
    let val = parseInt(input.value) + amt;
    if (val < 1) val = 1;
    input.value = val;
}