/**
 * EAZY VIBES - PRODUCT DETAIL ENGINE
 */

if (typeof window.BASE_URL === 'undefined') {
    window.BASE_URL = "http://localhost:8080";
}

let productVariants = [];
let selectedColor = null;
let selectedSize = null;
let selectedVariantId = null;
let defaultVariant = null;

const notify = {
    toast: (msg, icon = 'success') => {
        if (typeof Swal === 'undefined') { alert(msg); return; }
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#111',
            color: '#fff'
        });
        Toast.fire({ icon: icon, title: msg });
    },
    popup: (title, msg, icon = 'warning') => {
        if (typeof Swal === 'undefined') { alert(title + ": " + msg); return; }
        Swal.fire({
            title: title.toUpperCase(),
            text: msg,
            icon: icon,
            background: '#000',
            color: '#fff',
            confirmButtonColor: '#fff',
            confirmButtonText: '<span style="color:#000; font-weight:900;">ĐÃ HIỂU</span>'
        });
    }
};

function getEzImageUrl(path) {
    if (!path || path === "" || path === "null") return "/images/default.jpg";
    if (path.startsWith("http")) return path;
    let cleanPath = path.replace(/^\//, '').replace('uploads/', '');
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
        const data = await res.json();
        productVariants = data.variants || [];

        document.getElementById('product-name').innerText = data.name;
        document.getElementById('product-price').innerText = new Intl.NumberFormat('vi-VN').format(data.price) + 'đ';
        document.getElementById('product-desc').innerText = data.description || "Không có mô tả sản phẩm";

        defaultVariant = productVariants.find(v => v.images?.length > 0) || productVariants[0];

        if (defaultVariant) {
            selectedVariantId = defaultVariant.id;
            const stockEl = document.getElementById("stock-info");
            if (stockEl) {
                stockEl.innerText = defaultVariant.quantity > 0 ? `Còn ${defaultVariant.quantity} sản phẩm` : "Hết hàng";
            }
        }

        renderThumbnail();
        updateMainImage(defaultVariant);
        renderVariantSelection();
        restoreSelection();
    } catch (e) { console.error(e); }
}

function renderThumbnail() {
    const thumbList = document.getElementById('thumbnail-list');
    const images = getAllVariantImages();
    thumbList.innerHTML = images.map((img, idx) => {
        const url = getEzImageUrl(img);
        return `<img src="${url}" class="${idx === 0 ? 'active' : ''}" onclick="changeSlide('${url}', this)">`;
    }).join('');
}

function updateMainImage(variant) {
    if (!variant || !variant.images?.length) return;
    const mainImg = document.getElementById('main-product-img');
    const newUrl = getEzImageUrl(variant.images[0]);
    mainImg.src = newUrl;
    syncThumbnailActive(mainImg.src);
}

function findMatchingVariant() {
    if (selectedColor && selectedSize) {
        return productVariants.find(v => v.color === selectedColor && v.size === selectedSize);
    }
    return defaultVariant;
}

function renderVariantSelection() {
    const colors = [...new Set(productVariants.map(v => v.color))];
    const sizes = [...new Set(productVariants.map(v => v.size))];
    const colorContainer = document.getElementById('color-options');
    const sizeContainer = document.getElementById('size-options');

    colorContainer.innerHTML = colors.map(c => {
        const valid = productVariants.some(v => v.color === c && (!selectedSize || v.size === selectedSize) && v.quantity > 0);
        return `<div class="option-chip ${!valid ? 'disabled' : ''}" data-val="${c}" ${valid ? `onclick="selectChip(this, 'color')"` : ''}>${c}</div>`;
    }).join('');

    sizeContainer.innerHTML = sizes.map(s => {
        const valid = productVariants.some(v => v.size === s && (!selectedColor || v.color === selectedColor) && v.quantity > 0);
        return `<div class="option-chip ${!valid ? 'disabled' : ''}" data-val="${s}" ${valid ? `onclick="selectChip(this, 'size')"` : ''}>${s}</div>`;
    }).join('');
}

async function handleAddToCart() {
    if (!selectedColor || !selectedSize) {
        notify.popup("Thông báo", "Vui lòng chọn đầy đủ Màu sắc và Kích thước trước khi thêm vào giỏ hàng!", "warning");
        return;
    }

    const selectedVariant = productVariants.find(v => v.id === selectedVariantId);
    if (!selectedVariant || selectedVariant.quantity <= 0) {
        notify.popup("Hết hàng", "Thật xin lỗi, phiên bản này vừa hết hàng!", "error");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        notify.popup("Yêu cầu đăng nhập", "Vui lòng đăng nhập để thực hiện mua sắm!", "info");
        setTimeout(() => { window.location.href = "/login"; }, 2000);
        return;
    }

    const qtyInput = document.getElementById('buy-quantity');
    let qty = parseInt(qtyInput.value) || 1;

    // Kiểm tra lần cuối trước khi gửi API
    if (qty <= 0) {
        qty = 1;
        qtyInput.value = 1;
    }

    if (qty > selectedVariant.quantity) {
        notify.toast(`Chỉ còn ${selectedVariant.quantity} sản phẩm khả dụng`, "warning");
        qtyInput.value = selectedVariant.quantity;
        return;
    }

    try {
        const res = await fetch(`${window.BASE_URL}/api/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ variantId: selectedVariantId, quantity: qty })
        });
        if (res.ok) notify.toast("Đã thêm vào giỏ hàng thành công!");
        else notify.popup("Lỗi", "Không thể thêm sản phẩm. Vui lòng thử lại sau!", "error");
    } catch (e) {
        notify.toast("Lỗi kết nối server", "error");
    }
}

function selectChip(el, type) {
    const value = el.getAttribute('data-val');
    if (el.classList.contains('active')) {
        el.classList.remove('active');
        if (type === 'color') selectedColor = null;
        if (type === 'size') selectedSize = null;
    } else {
        el.parentElement.querySelectorAll('.option-chip').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
        if (type === 'color') selectedColor = value;
        if (type === 'size') selectedSize = value;
    }
    renderVariantSelection();
    restoreSelection();
    const match = findMatchingVariant();
    selectedVariantId = match?.id;
    const stockEl = document.getElementById("stock-info");
    if (stockEl) stockEl.innerText = (match && match.quantity > 0) ? `Còn ${match.quantity} sản phẩm` : "Hết hàng";
    
    // Khi đổi biến thể, kiểm tra lại số lượng đang nhập có vượt tồn kho mới không
    validateQty(document.getElementById('buy-quantity'));
    
    updateMainImage(match);
}

function restoreSelection() {
    if (selectedColor) {
        const el = document.querySelector(`#color-options .option-chip[data-val="${selectedColor}"]`);
        if (el) el.classList.add("active");
    }
    if (selectedSize) {
        const el = document.querySelector(`#size-options .option-chip[data-val="${selectedSize}"]`);
        if (el) el.classList.add("active");
    }
}

function changeSlide(url, el) {
    const main = document.getElementById('main-product-img');
    main.src = url;
    document.querySelectorAll('#thumbnail-list img').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
}

/**
 * FIX: CẬP NHẬT HÀM THAY ĐỔI SỐ LƯỢNG
 */
function changeQty(amt) {
    const input = document.getElementById('buy-quantity');
    let val = (parseInt(input.value) || 0) + amt;
    if (val < 1) val = 1;
    
    input.value = val;
    validateQty(input); // Kiểm tra giới hạn ngay sau khi bấm nút
}

/**
 * MỚI: HÀM KIỂM TRA SỐ LƯỢNG KHI NHẬP TAY
 */
function validateQty(input) {
    let val = parseInt(input.value);
    
    // Nếu biến thể đã được chọn, kiểm tra tồn kho
    const selectedVariant = productVariants.find(v => v.id === selectedVariantId);
    const maxStock = selectedVariant ? selectedVariant.quantity : 999;

    if (isNaN(val) || val < 1) {
        input.value = ""; // Để trống tạm thời nếu khách đang xóa để gõ lại
    } else if (val > maxStock) {
        notify.toast(`Số lượng tối đa hiện có là ${maxStock}`, "warning");
        input.value = maxStock;
    }
    
    // Khi khách rời ô input mà vẫn trống (blur), set về 1 (xử lý thêm ở sự kiện blur nếu cần)
}

function getAllVariantImages() {
    const allImages = [];
    productVariants.forEach(v => {
        if (v.images?.length > 0) v.images.forEach(img => allImages.push(img));
    });
    return [...new Set(allImages)];
}

function syncThumbnailActive(imageUrl) {
    const thumbs = document.querySelectorAll('#thumbnail-list img');
    thumbs.forEach(img => {
        img.classList.remove('active');
        if (img.src === imageUrl) img.classList.add('active');
    });
}