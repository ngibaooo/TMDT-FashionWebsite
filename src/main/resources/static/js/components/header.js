/**
 * BIẾN TOÀN CỤC & CẤU HÌNH API
 */
const BASE_URL = "http://localhost:8080";
let ezSearchDebounce = null;

/**
 * HÀM HELPER: XỬ LÝ ĐƯỜNG DẪN ẢNH TỪ DATABASE
 */
function getEzImageUrl(path) {
    if (!path || path === "" || path === "null" || path === "undefined") {
        return "/images/default.jpg";
    }
    if (path.startsWith("http")) return path;
    let cleanPath = path.replace(/^\//, '');
    if (cleanPath.startsWith('uploads/')) {
        cleanPath = cleanPath.replace('uploads/', '');
    }
    const encodedPath = encodeURI(cleanPath);
    return `${BASE_URL}/uploads/${encodedPath}`;
}

/**
 * ĐỒNG BỘ GIỎ HÀNG
 * ROOT CAUSE FIX: Cập nhật đúng ID và logic hiển thị
 */
window.syncGlobalCartBadge = function() {
    const badge = document.getElementById("cart-badge");
    if (!badge) return;
    
    let count = parseInt(localStorage.getItem("cartCount") || "0");
    if (count < 0) count = 0; // Edge case: không để số âm
    
    badge.innerText = count;
    // Nếu bằng 0 thì hiện màu xám, có hàng thì hiện đỏ (hoặc cam theo style streetwear)
    badge.style.backgroundColor = (count > 0) ? "#ff0000" : "#808080";
};

/**
 * KHỞI TẠO KHI TẢI TRANG
 */
document.addEventListener("DOMContentLoaded", () => {
    window.syncGlobalCartBadge();
    loadHeaderAvatar();
    initEzSearchLogic();

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".ez-search-wrapper")) {
            const box = document.getElementById("ezSearchBox");
            if (box) box.classList.remove("active");
        }
        if (!e.target.closest(".account-wrapper")) {
            const drop = document.getElementById("headerDropdown");
            if (drop) drop.classList.remove("show");
        }
    });
});

/**
 * LOAD AVATAR
 */
async function loadHeaderAvatar() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const res = await fetch(`${BASE_URL}/api/users/me`, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (res.ok) {
            const user = await res.json();
            const avatarBox = document.getElementById("userAvatar");
            const loginBtn = document.getElementById("loginBtn");

            if (loginBtn) loginBtn.style.display = "none";
            if (avatarBox) {
                avatarBox.style.display = "flex";
                if (user.avatar) {
                    avatarBox.innerHTML = `<img src="${getEzImageUrl(user.avatar)}" onerror="this.src='/images/default-avatar.png'">`;
                } else {
                    const initial = (user.name || "U").charAt(0).toUpperCase();
                    avatarBox.innerHTML = `<span>${initial}</span>`;
                }

                avatarBox.onclick = (e) => {
                    e.stopPropagation();
                    const drop = document.getElementById("headerDropdown");
                    if (drop) drop.classList.toggle("show");
                };
            }
        }
    } catch (err) { console.error("Lỗi Avatar:", err); }
}

/**
 * LOGIC TÌM KIẾM
 */
function toggleEzSearch() {
    const box = document.getElementById("ezSearchBox");
    if (!box) return;
    box.classList.toggle("active");
    if (box.classList.contains("active")) {
        document.getElementById("ez-search-input").focus();
        updateEzSearchUI();
    }
}

function initEzSearchLogic() {
    const input = document.getElementById("ez-search-input");
    if (!input) return;

    input.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        clearTimeout(ezSearchDebounce);

        if (val === "") {
            updateEzSearchUI();
            return;
        }

        ezSearchDebounce = setTimeout(() => fetchEzSearchAPI(val), 400);
    });

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && input.value.trim()) {
            performFinalSearch(input.value.trim());
        }
    });
}

function updateEzSearchUI() {
    const val = document.getElementById("ez-search-input").value.trim();
    if (val === "") {
        document.getElementById("ezResultSection").style.display = "none";
        document.getElementById("ezDefaultSection").style.display = "block";
        renderEzHistory();
    }
}

async function fetchEzSearchAPI(keyword) {
    try {
        const res = await fetch(`${BASE_URL}/api/products/search?keyword=${encodeURIComponent(keyword)}`);
        const data = await res.json();
        const products = data.content || data || [];

        document.getElementById("ezDefaultSection").style.display = "none";
        document.getElementById("ezHistorySection").style.display = "none";
        const resSec = document.getElementById("ezResultSection");
        const resList = document.getElementById("ezResultList");

        resSec.style.display = "block";
        if (!Array.isArray(products) || products.length === 0) {
            resList.innerHTML = '<p style="color:#666; font-size:12px; padding:10px;">Không có kết quả...</p>';
            return;
        }

        resList.innerHTML = products.map(p => {
            const mainImg = (p.images && p.images.length > 0) ? p.images[0] : null;
            return `
                <a href="/products/${p.id}" class="ez-prod-res" onclick="performFinalSearch('${p.name}')">
                    <img src="${getEzImageUrl(mainImg)}" onerror="this.src='/images/default.jpg'">
                    <div>
                        <h4>${p.name}</h4>
                        <p>${new Intl.NumberFormat('vi-VN').format(p.price || 0)}đ</p>
                    </div>
                </a>
            `;
        }).join('');
    } catch (err) { console.error("Lỗi Fetch API:", err); }
}

function performFinalSearch(keyword) {
    let hist = JSON.parse(localStorage.getItem("ez_hist_final") || "[]");
    hist = hist.filter(i => i !== keyword);
    hist.unshift(keyword);
    localStorage.setItem("ez_hist_final", JSON.stringify(hist.slice(0, 6)));
    window.location.href = `/all-products?search=${encodeURIComponent(keyword)}`;
}

function renderEzHistory() {
    const list = JSON.parse(localStorage.getItem("ez_hist_final") || "[]");
    const histSec = document.getElementById("ezHistorySection");
    const histList = document.getElementById("ezHistoryList");

    if (!histSec || !histList) return;
    if (list.length === 0) { histSec.style.display = "none"; return; }

    histSec.style.display = "block";
    histList.innerHTML = list.map(item => `
        <div class="ez-history-item">
            <span onclick="performFinalSearch('${item}')">${item}</span>
            <i onclick="removeEzHistoryItem('${item}')">✕</i>
        </div>
    `).join('');
}

function removeEzHistoryItem(key) {
    let list = JSON.parse(localStorage.getItem("ez_hist_final") || "[]");
    list = list.filter(i => i !== key);
    localStorage.setItem("ez_hist_final", JSON.stringify(list));
    renderEzHistory();
}

function clearAllEzHistory() {
    localStorage.removeItem("ez_hist_final");
    renderEzHistory();
}

// LOGOUT
const logoutBtn = document.getElementById("headerLogout");
if (logoutBtn) {
    logoutBtn.onclick = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("cartCount");
        window.location.href = "/login";
    };
}