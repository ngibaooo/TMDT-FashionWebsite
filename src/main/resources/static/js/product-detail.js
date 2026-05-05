
if (typeof window.BASE_URL === 'undefined') { window.BASE_URL = "http://localhost:8080"; }

let productVariants = [];
let selectedColor = null;
let selectedSize = null;
let selectedVariantId = null;
let defaultVariant = null;

const notify = {
    toast: (msg, icon = 'success') => {
        if (typeof Swal === 'undefined') { alert(msg); return; }
        Swal.mixin({ toast: true, position: 'bottom-end', showConfirmButton: false, timer: 3000, timerProgressBar: true, background: '#111', color: '#fff' }).fire({ icon: icon, title: msg });
    },
    popup: (title, msg, icon = 'warning') => {
        if (typeof Swal === 'undefined') { alert(title + ": " + msg); return; }
        Swal.fire({ title: title.toUpperCase(), text: msg, icon: icon, background: '#000', color: '#fff', confirmButtonColor: '#fff', confirmButtonText: '<span style="color:#000; font-weight:900;">ĐÃ HIỂU</span>' });
    }
};

function getEzImageUrl(path) {
    if (!path || path === "" || path === "null") return "/images/default.jpg";
    if (path.startsWith("http")) return path;
    return `${window.BASE_URL}/uploads/${encodeURI(path.replace(/^\//, '').replace('uploads/', ''))}`;
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
            if (stockEl) stockEl.innerText = defaultVariant.quantity > 0 ? `Còn ${defaultVariant.quantity} sản phẩm` : "Hết hàng";
        }
        renderThumbnail();
        updateMainImage(defaultVariant);
        renderVariantSelection();
        restoreSelection();
    } catch (e) { console.error(e); }
}

function renderThumbnail() {
    const thumbList = document.getElementById('thumbnail-list');
    thumbList.innerHTML = getAllVariantImages().map((img, idx) => `<img src="${getEzImageUrl(img)}" class="${idx === 0 ? 'active' : ''}" onclick="changeSlide('${getEzImageUrl(img)}', this)">`).join('');
}

function updateMainImage(variant) {
    if (!variant || !variant.images?.length) return;
    document.getElementById('main-product-img').src = getEzImageUrl(variant.images[0]);
}

function findMatchingVariant() {
    if (selectedColor && selectedSize) return productVariants.find(v => v.color === selectedColor && v.size === selectedSize);
    return defaultVariant;
}

//function renderVariantSelection() {
//    const colors = [...new Set(productVariants.map(v => v.color))];
//    const sizes = [...new Set(productVariants.map(v => v.size))];
//    document.getElementById('color-options').innerHTML = colors.map(c => `<div class="option-chip ${!productVariants.some(v => v.color === c && (!selectedSize || v.size === selectedSize) && v.quantity > 0) ? 'disabled' : ''}" data-val="${c}" onclick="selectChip(this, 'color')">${c}</div>`).join('');
//    document.getElementById('size-options').innerHTML = sizes.map(s => `<div class="option-chip ${!productVariants.some(v => v.size === s && (!selectedColor || v.color === selectedColor) && v.quantity > 0) ? 'disabled' : ''}" data-val="${s}" onclick="selectChip(this, 'size')">${s}</div>`).join('');
//}
function renderVariantSelection() {
    const colors = [...new Set(productVariants.map(v => v.color))];
    const sizes = [...new Set(productVariants.map(v => v.size))];

    document.getElementById('color-options').innerHTML = colors.map(c => `
        <div class="option-chip ${
            !productVariants.some(v =>
                v.color === c &&
                (!selectedSize || v.size === selectedSize) &&
                v.quantity > 0 &&
                v.status === "ACTIVE"
            ) ? 'disabled' : ''
        }"
        data-val="${c}"
        onclick="selectChip(this, 'color')">
            ${c}
        </div>
    `).join('');

    document.getElementById('size-options').innerHTML = sizes.map(s => `
        <div class="option-chip ${
            !productVariants.some(v =>
                v.size === s &&
                (!selectedColor || v.color === selectedColor) &&
                v.quantity > 0 &&
                v.status === "ACTIVE"
            ) ? 'disabled' : ''
        }"
        data-val="${s}"
        onclick="selectChip(this, 'size')">
            ${s}
        </div>
    `).join('');
}

async function handleAddToCart() {
    const status = localStorage.getItem("userStatus");
    const token = localStorage.getItem("token");

    // 1. Kiểm tra đăng nhập
    if (!token) {
        notify.popup("Yêu cầu đăng nhập", "Vui lòng đăng nhập để thực hiện mua sắm!", "info");
        setTimeout(() => { window.location.href = "/login"; }, 2000);
        return;
    }

    // 2. Kiểm tra tài khoản bị khóa (FIX MỚI)
    if (status === "LOCKED") {
        notify.popup("TÀI KHOẢN BỊ KHÓA", "Tài khoản của bạn hiện đang bị khóa. Bạn chỉ có thể xem sản phẩm và không thể thực hiện mua hàng!", "error");
        return;
    }

    // 3. Kiểm tra chọn biến thể
    if (!selectedColor || !selectedSize) {
        notify.popup("Thông báo", "Vui lòng chọn đầy đủ Màu sắc và Kích thước!", "warning");
        return;
    }

    const selectedVariant = productVariants.find(v => v.id === selectedVariantId);
    if (!selectedVariant || selectedVariant.quantity <= 0) {
        notify.popup("Hết hàng", "Thật xin lỗi, phiên bản này vừa hết hàng!", "error");
        return;
    }

    const qtyInput = document.getElementById('buy-quantity');
    let qty = parseInt(qtyInput.value) || 1;

    if (qty > selectedVariant.quantity) {
        notify.toast(`Số lượng tối đa hiện có là ${selectedVariant.quantity}`, "warning");
        qtyInput.value = selectedVariant.quantity;
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
            notify.toast("Đã thêm vào giỏ hàng thành công!");
            window.dispatchEvent(new Event("cartUpdated"));
        } else {
            const errData = await res.json();
            notify.popup("Lỗi", errData.message || "Không thể thêm sản phẩm!", "error");
        }
    } catch (e) {
        notify.toast("Lỗi kết nối server", "error");
    }
}

function selectChip(el, type) {
    if (el.classList.contains('disabled')) return;
    const value = el.getAttribute('data-val');
    if (el.classList.contains('active')) {
        el.classList.remove('active');
        if (type === 'color') selectedColor = null; else selectedSize = null;
    } else {
        el.parentElement.querySelectorAll('.option-chip').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
        if (type === 'color') selectedColor = value; else selectedSize = value;
    }
    renderVariantSelection();
    restoreSelection();
    const match = findMatchingVariant();
    selectedVariantId = match?.id;
    const stockEl = document.getElementById("stock-info");
    if (stockEl) stockEl.innerText = (match && match.quantity > 0) ? `Còn ${match.quantity} sản phẩm` : "Hết hàng";
    updateMainImage(match);
}

function restoreSelection() {
    if (selectedColor) { const el = document.querySelector(`#color-options .option-chip[data-val="${selectedColor}"]`); if (el) el.classList.add("active"); }
    if (selectedSize) { const el = document.querySelector(`#size-options .option-chip[data-val="${selectedSize}"]`); if (el) el.classList.add("active"); }
}

function changeSlide(url, el) { document.getElementById('main-product-img').src = url; document.querySelectorAll('#thumbnail-list img').forEach(i => i.classList.remove('active')); el.classList.add('active'); }
function changeQty(amt) { const input = document.getElementById('buy-quantity'); let val = (parseInt(input.value) || 0) + amt; input.value = val < 1 ? 1 : val; validateQty(input); }
function validateQty(input) { let val = parseInt(input.value); const selectedVariant = productVariants.find(v => v.id === selectedVariantId); const maxStock = selectedVariant ? selectedVariant.quantity : 999; if (isNaN(val) || val < 1) input.value = ""; else if (val > maxStock) { notify.toast(`Chỉ còn ${maxStock} sản phẩm`, "warning"); input.value = maxStock; } }
function getAllVariantImages() { const allImages = []; productVariants.forEach(v => { if (v.images?.length > 0) v.images.forEach(img => allImages.push(img)); }); return [...new Set(allImages)]; }