let currentPage = 0;
let totalPages = 0;

if (typeof window.BASE_URL === 'undefined') {
    window.BASE_URL = "http://localhost:8080";
}

document.addEventListener("DOMContentLoaded", () => {
    fetchSaleProducts();
});

async function fetchSaleProducts() {
    const grid = document.getElementById("sale-grid");
    if (!grid) return;

    grid.innerHTML = `
        <p style="grid-column: 1/-1; text-align: center; color: #444; font-weight: 700;">
            ĐANG SĂN TÌM CÁC DEAL HỜI...
        </p>
    `;

    try {
        const response = await fetch(
            `${BASE_URL}/api/products/filter?isSale=true&page=${currentPage}&size=4`
        );

        if (!response.ok) {
            throw new Error("API_ERROR");
        }

        const data = await response.json();

        const products = data.content || [];
        totalPages = data.totalPages || 1;
        currentPage = data.number || 0;

        if (products.length === 0) {
            grid.innerHTML = `
                <p style="grid-column: 1/-1; text-align: center; padding: 100px; color: #555; font-weight: 700;">
                    HIỆN CHƯA CÓ CHƯƠNG TRÌNH KHUYẾN MÃI PHÙ HỢP.
                </p>
            `;
        } else {
            grid.innerHTML = products.map(p => {
                let displayImg = "/images/default.jpg";

                if (p.images && p.images.length > 0) {
                    const imgPath = p.images[0];
                    displayImg = imgPath.startsWith("http")
                        ? imgPath
                        : `${BASE_URL}${imgPath.startsWith("/") ? "" : "/"}${imgPath}`;
                }

                const oldPrice = p.oldPrice || p.price;

                return `
                    <a href="/products/${p.id}" class="product-card" style="text-decoration: none; color: inherit;">
                        <div class="img-box" style="position: relative; overflow: hidden; background: #111;">
                            <div class="sale-badge" style="
                                position: absolute;
                                top: 10px;
                                left: 10px;
                                background: #ff4d4d;
                                color: #fff;
                                padding: 4px 8px;
                                font-size: 10px;
                                font-weight: 900;
                                z-index: 2;">
                                SALE
                            </div>

                            <img src="${displayImg}"
                                 alt="${p.name}"
                                 style="width: 100%; aspect-ratio: 3/4; object-fit: cover;"
                                 onerror="this.onerror=null; this.src='/images/default.jpg'"/>
                        </div>

                        <div class="product-info" style="padding: 15px 5px;">
                            <h3 style="
                                font-size: 12px;
                                font-weight: 900;
                                text-transform: uppercase;
                                margin: 0 0 8px 0;
                                letter-spacing: -0.5px;">
                                ${p.name}
                            </h3>

                            <div class="price-container" style="
                                display: flex;
                                align-items: center;
                                gap: 10px;">
                                <p style="
                                    color: #ff4d4d;
                                    font-weight: 900;
                                    margin: 0;
                                    font-size: 14px;">
                                    ${new Intl.NumberFormat("vi-VN").format(p.price)}đ
                                </p>

                                <span style="
                                    font-size: 11px;
                                    color: #aaa;
                                    text-decoration: line-through;
                                    font-weight: 600;">
                                    ${new Intl.NumberFormat("vi-VN").format(oldPrice)}đ
                                </span>
                            </div>
                        </div>
                    </a>
                `;
            }).join("");
        }

    } catch (e) {
        console.error("Lỗi fetch SALE:", e);

        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <p style="color: #ff4d4d; font-weight: 900; font-size: 18px;">
                    HỆ THỐNG ĐANG BẢO TRÌ BỘ LỌC
                </p>
                <p style="color: #666; font-size: 13px;">
                    Chúng tôi sẽ sớm quay lại với các ưu đãi mới nhất.
                </p>
                <button onclick="location.reload()" style="
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: #000;
                    color: #fff;
                    border: none;
                    font-weight: 800;
                    cursor: pointer;">
                    THỬ LẠI
                </button>
            </div>
        `;
    }

    renderSalePagination();
}

// ===== PAGINATION =====
function renderSalePagination() {
    const container = document.getElementById("sale-pagination");
    if (!container) return;

    container.innerHTML = "";

    if (totalPages <= 1) return;

    container.innerHTML += `
        <button ${currentPage === 0 ? "disabled" : ""}
            onclick="changeSalePage(${currentPage - 1})">
            ←
        </button>
    `;

    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 3);

    for (let i = start; i < end; i++) {
        container.innerHTML += `
            <button class="${i === currentPage ? "active" : ""}"
                onclick="changeSalePage(${i})">
                ${i + 1}
            </button>
        `;
    }

    container.innerHTML += `
        <button ${currentPage === totalPages - 1 ? "disabled" : ""}
            onclick="changeSalePage(${currentPage + 1})">
            →
        </button>
    `;
}

// ===== CHANGE PAGE =====
function changeSalePage(page) {
    if (page < 0 || page >= totalPages) return;

    currentPage = page;
    fetchSaleProducts();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}