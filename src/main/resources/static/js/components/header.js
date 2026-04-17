document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    const loginBtn = document.getElementById("loginBtn");
    const avatar = document.getElementById("userAvatar");

    if (!loginBtn || !avatar) return;

    if (token) {
        loginBtn.style.display = "none";

        const name = localStorage.getItem("userName") || "U";
        avatar.innerText = name.charAt(0).toUpperCase();

        avatar.style.display = "flex";

        avatar.onclick = () => {
            window.location.href = "/user/profile";
        };
    } else {
        avatar.style.display = "none";
        loginBtn.style.display = "inline-block";
    }
});
function toggleSearch() {
    const overlay = document.getElementById("search-overlay");
    overlay.classList.toggle("active");

    if (overlay.classList.contains("active")) {
        document.getElementById("search-input").focus();
    }
}

// ENTER để search
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const overlay = document.getElementById("search-overlay");
        if (overlay.classList.contains("active")) {
            handleSearch();
        }
    }
});

async function handleSearch() {
    const keyword = document.getElementById("search-input").value.trim();
    const resultBox = document.getElementById("search-results");

    if (!keyword) return;

    resultBox.innerHTML = "<p>Đang tìm...</p>";

    try {
        const res = await fetch(`/api/products/search?keyword=${encodeURIComponent(keyword)}`);
        const data = await res.json();

        const products = data.content || data;

        if (products.length === 0) {
            resultBox.innerHTML = "<p>Không tìm thấy sản phẩm</p>";
            return;
        }

        resultBox.innerHTML = products.map(p => `
            <a href="/products/${p.id}" class="product-card">
                <div class="img-box">
                    <img src="${p.images && p.images.length ? p.images[0] : '/images/default.jpg'}">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p>${new Intl.NumberFormat('vi-VN').format(p.price)}đ</p>
                </div>
            </a>
        `).join("");

    } catch (err) {
        console.error(err);
        resultBox.innerHTML = "<p>Lỗi tìm kiếm</p>";
    }
}