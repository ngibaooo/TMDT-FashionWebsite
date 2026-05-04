/**
 * EAZY VIBES - HEADER ENGINE (UI SYNC VERSION)
 */
const BASE_URL = "http://localhost:8080";
let ezSearchDebounce = null;

function getEzImageUrl(path) {
    if (!path || path === "" || path === "null" || path === "undefined") return "/images/default.jpg";
    if (path.startsWith("http")) return path;
    let cleanPath = path.replace(/^\//, '').replace('uploads/', '');
    return `${BASE_URL}/uploads/${encodeURI(cleanPath)}`;
}

/**
 * ĐỒNG BỘ THÔNG BÁO CHO TÀI KHOẢN BỊ KHÓA
 */
window.handleCartClick = function(event) {
    const status = localStorage.getItem("userStatus");
    const token = localStorage.getItem("token");

    if (!token || token === "null") return true; 

    if (status === "LOCKED") {
        event.preventDefault(); 
        
        // Sử dụng SweetAlert2 với style đồng bộ product-detail
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: "TÀI KHOẢN BỊ KHÓA",
                text: "Tài khoản của bạn hiện đang bị khóa chức năng mua hàng. Vui lòng liên hệ Admin để được hỗ trợ!",
                icon: "error",
                background: "#000",
                color: "#fff",
                confirmButtonColor: "#fff",
                confirmButtonText: "<span style='color:#000; font-weight:900;'>ĐÃ HIỂU</span>",
                customClass: {
                    popup: 'ez-swal-popup',
                    title: 'ez-swal-title'
                }
            });
        } else {
            // Trường hợp hy hữu thư viện chưa kịp load
            alert("Tài khoản của bạn đang bị khóa!");
        }
        return false;
    }
    return true;
};

window.syncGlobalCartBadge = async function() {
    const badge = document.getElementById("cart-badge");
    if (!badge) return;
    const token = localStorage.getItem("token");
    const status = localStorage.getItem("userStatus");
    if (!token || token === "null" || status === "LOCKED") {
        badge.innerText = "0";
        badge.style.backgroundColor = "#808080";
        return;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/cart`, { headers: { "Authorization": "Bearer " + token } });
        if (res.ok) {
            const data = await res.json();
            const activeItems = (data.items || []).filter(i => i.variantStatus === "ACTIVE");
            const totalCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);
            badge.innerText = totalCount;
            badge.style.backgroundColor = (totalCount > 0) ? "#ff0000" : "#808080";
        }
    } catch (err) { console.warn("Sync cart failed"); }
};

window.addEventListener("cartUpdated", () => window.syncGlobalCartBadge());

document.addEventListener("DOMContentLoaded", () => {
    window.syncGlobalCartBadge();
    loadHeaderAvatar();
    if (typeof initEzSearchLogic === 'function') initEzSearchLogic();

    const cartLink = document.getElementById("cart-link");
    if (cartLink) {
        cartLink.onclick = window.handleCartClick;
    }

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

async function loadHeaderAvatar() {
    const token = localStorage.getItem("token");
    if (!token || token === "null") return;
    try {
        const res = await fetch(`${BASE_URL}/api/users/me`, { headers: { "Authorization": "Bearer " + token } });
        if (res.ok) {
            const user = await res.json();
            localStorage.setItem("userStatus", user.status);
            const avatarBox = document.getElementById("userAvatar");
            const loginBtn = document.getElementById("loginBtn");
            if (loginBtn) loginBtn.style.display = "none";
            if (avatarBox) {
                avatarBox.style.display = "flex";
                avatarBox.innerHTML = user.avatar ? `<img src="${getEzImageUrl(user.avatar)}" onerror="this.src='/images/default-avatar.png'">` : `<span>${(user.name || "U").charAt(0).toUpperCase()}</span>`;
                avatarBox.onclick = (e) => {
                    e.stopPropagation();
                    const drop = document.getElementById("headerDropdown");
                    if (drop) drop.classList.toggle("show");
                };
            }
        }
    } catch (err) { console.warn("Load avatar failed"); }
}

/**
 * LOGIC TÌM KIẾM
 */
function toggleEzSearch() {
    const box = document.getElementById("ezSearchBox");
    if (box) {
        box.classList.toggle("active");
        if (box.classList.contains("active")) {
            const input = document.getElementById("ez-search-input");
            if (input) input.focus();
            updateEzSearchUI();
        }
    }
}

function initEzSearchLogic() {
    const input = document.getElementById("ez-search-input");
    if (!input) return;
    input.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        clearTimeout(ezSearchDebounce);
        if (val === "") { updateEzSearchUI(); return; }
        ezSearchDebounce = setTimeout(() => fetchEzSearchAPI(val), 400);
    });
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && input.value.trim()) performFinalSearch(input.value.trim());
    });
}

function updateEzSearchUI() {
    const input = document.getElementById("ez-search-input");
    if (!input) return;
    const val = input.value.trim();
    if (val === "") {
        const resSec = document.getElementById("ezResultSection");
        const defSec = document.getElementById("ezDefaultSection");
        if (resSec) resSec.style.display = "none";
        if (defSec) defSec.style.display = "block";
        renderEzHistory();
    }
}

async function fetchEzSearchAPI(keyword) {
    try {
        const res = await fetch(`${BASE_URL}/api/products/search?keyword=${encodeURIComponent(keyword)}`);
        const data = await res.json();
        const products = data.content || data || [];
        const resSec = document.getElementById("ezResultSection");
        const resList = document.getElementById("ezResultList");

        if (resSec) resSec.style.display = "block";
        if (resList) {
            if (!Array.isArray(products) || products.length === 0) {
                resList.innerHTML = '<p style="color:#666; font-size:12px; padding:10px;">Không có kết quả...</p>';
                return;
            }
            resList.innerHTML = products.map(p => `
                <a href="/products/${p.id}" class="ez-prod-res" onclick="performFinalSearch('${p.name}')">
                    <img src="${getEzImageUrl(p.images ? p.images[0] : null)}" onerror="this.src='/images/default.jpg'">
                    <div><h4>${p.name}</h4><p>${new Intl.NumberFormat('vi-VN').format(p.price || 0)}đ</p></div>
                </a>`).join('');
        }
    } catch (err) { console.warn("Lỗi tìm kiếm"); }
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
    histList.innerHTML = list.map(item => `<div class="ez-history-item"><span onclick="performFinalSearch('${item}')">${item}</span><i onclick="removeEzHistoryItem('${item}')">✕</i></div>`).join('');
}

function removeEzHistoryItem(key) {
    let list = JSON.parse(localStorage.getItem("ez_hist_final") || "[]");
    localStorage.setItem("ez_hist_final", JSON.stringify(list.filter(i => i !== key)));
    renderEzHistory();
}

function clearAllEzHistory() {
    localStorage.removeItem("ez_hist_final");
    renderEzHistory();
}

const logoutBtn = document.getElementById("headerLogout");
if (logoutBtn) {
    logoutBtn.onclick = () => {
        localStorage.clear();
        window.location.href = "/login";
    };
}