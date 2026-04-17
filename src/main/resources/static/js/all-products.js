const API_PRODUCTS = "http://localhost:8080/api/products";

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

async function fetchProducts() {
    try {
        const sort = document.getElementById("sort-select")?.value;
        const price = document.getElementById("filter-price")?.value;

        let url;

        // ===== FILTER =====
        if (price) {
            const [min, max] = price.split("-");
            url = `http://localhost:8080/api/products/filter?minPrice=${min}&maxPrice=${max}`;
        } else {
            url = API_PRODUCTS;
        }

        console.log("CALL API:", url);

        const res = await fetch(url);

        if (!res.ok) {
            console.error("API lỗi:", res.status);
            return renderProducts([]); // tránh crash
        }

        const data = await res.json();
        let products = data.content || [];

        // ===== SORT CLIENT-SIDE =====
        if (sort) {
            if (sort === "price_asc") {
                products.sort((a, b) => a.price - b.price);
            } else if (sort === "price_desc") {
                products.sort((a, b) => b.price - a.price);
            } else if (sort === "newest") {
                products.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
            }
        }

        renderProducts(products);

    } catch (err) {
        console.error(err);
    }
}

//function renderProducts(products) {
//    const grid = document.getElementById("products-grid");
//    grid.innerHTML = "";
//
//    if (!Array.isArray(products) || products.length === 0) {
//        grid.innerHTML = "<p>Không có sản phẩm</p>";
//        return;
//    }
//
//    products.forEach(p => {
//        const img = (p.images && p.images.length > 0)
//            ? p.images[0]
//            : "/images/default-product.png";
//
//        grid.innerHTML += `
//            <a href="/product/${p.id}" class="product-card">
//                <div class="img-box">
//                    <img src="http://localhost:8080${img}" alt="${p.name}">
//                </div>
//
//                <div class="product-info">
//                    <h3>${p.name}</h3>
//                    <p class="price">${formatMoney(p.price)}</p>
//                </div>
//            </a>
//        `;
//    });
//}
function renderProducts(products) {
    const grid = document.getElementById("products-grid");
    grid.innerHTML = "";

    if (!Array.isArray(products)) {
        grid.innerHTML = "<p>Lỗi dữ liệu</p>";
        return;
    }

    const size = document.getElementById("filter-size")?.value;

    if (size) {
        products = products.filter(p =>
            p.variants?.some(v => v.size === size)
        );
    }

    if (products.length === 0) {
        grid.innerHTML = "<p>Không có sản phẩm</p>";
        return;
    }

    products.forEach(p => {
        const img = (p.images && p.images.length > 0)
            ? p.images[0]
            : "/images/default-product.png";

        grid.innerHTML += `
            <a href="/product/${p.id}" class="product-card">
                <div class="img-box">
                    <img src="http://localhost:8080${img}">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p class="price">${formatMoney(p.price)}</p>
                </div>
            </a>
        `;
    });
}
function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
}