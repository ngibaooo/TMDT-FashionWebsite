if (typeof window.BASE_URL === 'undefined') {
    window.BASE_URL = "http://localhost:8080";
}

let productVariants = [];
let selectedColor = null;
let selectedSize = null;
let selectedVariantId = null;
let defaultVariant = null;

// ===== IMAGE URL =====
function getEzImageUrl(path) {
    if (!path || path === "" || path === "null") return "/images/default.jpg";
    if (path.startsWith("http")) return path;

    let cleanPath = path.replace(/^\//, '');
    if (cleanPath.startsWith('uploads/')) {
        cleanPath = cleanPath.replace('uploads/', '');
    }

    return `${window.BASE_URL}/uploads/${encodeURI(cleanPath)}`;
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
    const pathSegments = window.location.pathname.split('/').filter(s => s !== "");
    const productId = pathSegments[pathSegments.length - 1];
    if (productId) fetchProductDetail(productId);
});

// ===== FETCH =====
async function fetchProductDetail(id) {
    try {
        const res = await fetch(`${window.BASE_URL}/api/products/${id}`);
        const data = await res.json();

        productVariants = data.variants || [];

        // INFO
        document.getElementById('product-name').innerText = data.name;
        document.getElementById('product-price').innerText =
            new Intl.NumberFormat('vi-VN').format(data.price) + 'đ';
        document.getElementById('product-desc').innerText =
        data.description || "Không có mô tả sản phẩm";

        // ===== DEFAULT VARIANT =====
        defaultVariant =
            productVariants.find(v => v.images?.length > 0) ||
            productVariants[0];

        if (defaultVariant) {
//            selectedColor = defaultVariant.color;
//            selectedSize = defaultVariant.size;
            selectedVariantId = defaultVariant.id;
            const stockEl = document.getElementById("stock-info");
            if (stockEl) {
                stockEl.innerText = defaultVariant.quantity > 0
                    ? `Còn ${defaultVariant.quantity} sản phẩm`
                    : "Hết hàng";
            }
        }

        // ===== RENDER THUMB (CHỈ 1 LẦN) =====
        renderThumbnail(defaultVariant);

        // ===== MAIN IMAGE =====
        updateMainImage(defaultVariant);

        renderVariantSelection();
        restoreSelection();

    } catch (e) {
        console.error(e);
    }
}

function renderThumbnail() {

    const thumbList = document.getElementById('thumbnail-list');
    const images = getAllVariantImages();

    thumbList.innerHTML = images.map((img, idx) => {
        const url = getEzImageUrl(img);
        return `
            <img src="${url}"
                 class="${idx === 0 ? 'active' : ''}"
                 onclick="changeSlide('${url}', this)">
        `;
    }).join('');
}

function updateMainImage(variant) {
    if (!variant || !variant.images?.length) return;

    const mainImg = document.getElementById('main-product-img');
    const newUrl = getEzImageUrl(variant.images[0]);

    mainImg.src = newUrl;

    syncThumbnailActive(mainImg.src);
}

// ===== FIND VARIANT =====
function findMatchingVariant() {

    if (selectedColor && selectedSize) {
        return productVariants.find(v =>
            v.color === selectedColor &&
            v.size === selectedSize
        );
    }

    if (selectedColor) {
        return productVariants.find(v =>
            v.color === selectedColor &&
            v.images?.length > 0
        );
    }

    if (selectedSize) {
        return productVariants.find(v =>
            v.size === selectedSize &&
            v.images?.length > 0
        );
    }

    return defaultVariant;
}

// ===== RENDER CHIP (CÓ DISABLE) =====
function renderVariantSelection() {

    const colors = [...new Set(productVariants.map(v => v.color))];
    const sizes = [...new Set(productVariants.map(v => v.size))];

    const colorContainer = document.getElementById('color-options');
    const sizeContainer = document.getElementById('size-options');

    // COLOR
    colorContainer.innerHTML = colors.map(c => {

        const valid = productVariants.some(v =>
            v.color === c &&
            (!selectedSize || v.size === selectedSize) &&
            v.quantity > 0
        );

        return `
            <div class="option-chip ${!valid ? 'disabled' : ''}"
                 data-val="${c}"
                 ${valid ? `onclick="selectChip(this, 'color')"` : ''}>
                ${c}
            </div>
        `;
    }).join('');

    // SIZE
    sizeContainer.innerHTML = sizes.map(s => {

        const valid = productVariants.some(v =>
            v.size === s &&
            (!selectedColor || v.color === selectedColor) &&
            v.quantity > 0
        );

        return `
            <div class="option-chip ${!valid ? 'disabled' : ''}"
                 data-val="${s}"
                 ${valid ? `onclick="selectChip(this, 'size')"` : ''}>
                ${s}
            </div>
        `;
    }).join('');
}
async function handleAddToCart() {


    if (!selectedColor || !selectedSize) {
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

    const qty = parseInt(document.getElementById('buy-quantity').value) || 1;

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
            body: JSON.stringify({
                variantId: selectedVariantId,
                quantity: qty
            })
        });

        if (res.ok) {
            alert("Đã thêm vào giỏ hàng!");
        } else {
            alert("Lỗi khi thêm vào giỏ!");
        }

    } catch (e) {
        console.error(e);
    }
}
function selectChip(el, type) {

    const value = el.getAttribute('data-val');

    if (el.classList.contains('active')) {

        el.classList.remove('active');

        if (type === 'color') selectedColor = null;
        if (type === 'size') selectedSize = null;

    } else {

        el.parentElement.querySelectorAll('.option-chip')
            .forEach(c => c.classList.remove('active'));

        el.classList.add('active');

        if (type === 'color') selectedColor = value;
        if (type === 'size') selectedSize = value;
    }

    renderVariantSelection();
    restoreSelection();

    const match = findMatchingVariant();
    selectedVariantId = match?.id;

    // stock
    const stockEl = document.getElementById("stock-info");
    if (stockEl) {
        if (match && match.quantity > 0) {
            stockEl.innerText = `Còn ${match.quantity} sản phẩm`;
        } else {
            stockEl.innerText = "Hết hàng";
        }
    }

    updateMainImage(match);
}

// ===== RESTORE =====
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

    document.querySelectorAll('#thumbnail-list img')
        .forEach(i => i.classList.remove('active'));

    el.classList.add('active');

    syncThumbnailActive(main.src);
}
// ===== QTY =====
function changeQty(amt) {
    const input = document.getElementById('buy-quantity');
    let val = parseInt(input.value) + amt;
    if (val < 1) val = 1;
    input.value = val;
}
function getAllVariantImages() {
    const allImages = [];

    productVariants.forEach(v => {
        if (v.images && v.images.length > 0) {
            v.images.forEach(img => {
                allImages.push(img);
            });
        }
    });

    // remove duplicate
    return [...new Set(allImages)];
}
function syncThumbnailActive(imageUrl) {

    const thumbs = document.querySelectorAll('#thumbnail-list img');

    thumbs.forEach(img => {
        img.classList.remove('active');

        // so sánh URL
        if (img.src === imageUrl) {
            img.classList.add('active');
        }
    });
}