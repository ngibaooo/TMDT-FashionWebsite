//const API_CART = "http://localhost:8080/api/cart";
//const API_UPDATE = "http://localhost:8080/api/cart/update-quantity";
//const API_DELETE = "http://localhost:8080/api/cart/delete";
//document.addEventListener("DOMContentLoaded", async () => {
//    const token = localStorage.getItem("token");
//
//    if (!token) {
//        alert("Vui lòng đăng nhập");
//        window.location.href = "/login";
//        return;
//    }
//
//    try {
//        const res = await fetch("http://localhost:8080/api/users/me", {
//            headers: { Authorization: "Bearer " + token }
//        });
//
//        const user = await res.json();
//
//        if (user.status === "LOCKED") {
//            alert("Tài khoản của bạn đã bị khóa");
//            window.location.href = "/"; // ❗ CHẶN NGAY
//            return;
//        }
//
//        // ✅ chỉ khi hợp lệ mới load cart
//        loadCart();
//
//    } catch (err) {
//        console.error(err);
//        window.location.href = "/login";
//    }
//});
//////async function loadCart() {
//////    const token = localStorage.getItem("token");
//////
//////    try {
//////        const res = await fetch(API_CART, {
//////            headers: {
//////                Authorization: "Bearer " + token
//////            }
//////        });
//////
//////        const data = await res.json();
//////
//////        console.log("Cart API:", data);
//////
//////        renderCart(data.items, data.totalPrice);
//////
//////    } catch (err) {
//////        console.error(err);
//////    }
//////}
////async function loadCart() {
////    const token = localStorage.getItem("token");
////
////    if (!token) {
////        alert("Bạn chưa đăng nhập");
////        return window.location.href = "/login";
////    }
////
////    try {
////        // CHECK USER STATUS TRƯỚC
////        const userRes = await fetch("http://localhost:8080/api/users/me", {
////            headers: { Authorization: "Bearer " + token }
////        });
////
////        const user = await userRes.json();
////
////        if (user.status === "LOCKED") {
////            handleLockedUI();
////            return;
////        }
////
////        // LOAD CART BÌNH THƯỜNG
////        const res = await fetch(API_CART, {
////            headers: {
////                Authorization: "Bearer " + token
////            }
////        });
////
////        const data = await res.json();
////        renderCart(data.items, data.totalPrice);
////
////    } catch (err) {
////        console.error(err);
////    }
////}
//async function loadCart() {
//    const token = localStorage.getItem("token");
//
//    if (!token) {
//        alert("Vui lòng đăng nhập hoặc đăng kí tài khoản để sử dụng giỏ hàng");
//        return window.location.href = "/login";
//    }
//
//    try {
//        const userRes = await fetch("http://localhost:8080/api/users/me", {
//            headers: { Authorization: "Bearer " + token }
//        });
//
//        const user = await userRes.json();
//
//        // CHẶN TRUY CẬP NGAY TẠI ĐÂY
//        if (user.status === "LOCKED") {
//            alert("Tài khoản của bạn đã bị khóa");
//            window.location.href = "/"; // hoặc /login
//            return;
//        }
//
//        // CHỈ LOAD CART KHI HỢP LỆ
//        const res = await fetch(API_CART, {
//            headers: {
//                Authorization: "Bearer " + token
//            }
//        });
//
//        const data = await res.json();
//        renderCart(data.items, data.totalPrice);
//
//    } catch (err) {
//        console.error(err);
//    }
//}
//function renderCart(items, totalPriceFromAPI) {
//    const container = document.getElementById("cartItems");
//    container.innerHTML = "";
//
//    if (!Array.isArray(items) || items.length === 0) {
//        container.innerHTML = "<p>Giỏ hàng trống</p>";
//        localStorage.setItem("cartCount", "0"); // DÒNG 1: Reset về 0 nếu trống
//        if (window.syncGlobalCartBadge) window.syncGlobalCartBadge(); // DÒNG 2: Cập nhật Badge
//        updateSummary(0, 0);
//        return;
//    }
//
//    let totalItems = 0;
//    items.forEach(item => {
//        totalItems += Number(item.quantity || 0);
//        container.innerHTML += `
//            <div class="cart-item">
//                <div class="left">
//                    <img src="http://localhost:8080${item.image}" />
//                    <div class="cart-info">
//                        <h3>${item.productName}</h3>
//                        <p>${formatMoney(item.price)}</p>
//                        <p>Size: ${item.size} | Color: ${item.color}</p>
//                    </div>
//                </div>
//                <div class="right">
//                    <div class="quantity">
//                        <button onclick="changeQty('${item.cartItemId}', 'DECREASE')" ${item.quantity <= 1 ? "disabled" : ""}>−</button>
//                        <span>${item.quantity}</span>
//                        <button onclick="changeQty('${item.cartItemId}', 'INCREASE')">+</button>
//                    </div>
//                    <button class="btn-remove" onclick="removeItem('${item.cartItemId}')">Xóa</button>
//                </div>
//            </div>`;
//    });
//
//    // CẬP NHẬT SỐ LƯỢNG THẬT VÀO LOCALSTORAGE
//    localStorage.setItem("cartCount", totalItems);
//    if (window.syncGlobalCartBadge) window.syncGlobalCartBadge();
//
//    updateSummary(totalItems, totalPriceFromAPI);
//}
//
//// UPDATE QUANTITY
//async function changeQty(cartItemId, action) {
//    const token = localStorage.getItem("token");
//
//    try {
//        await fetch(API_UPDATE, {
//            method: "PUT",
//            headers: {
//                "Content-Type": "application/json",
//                Authorization: "Bearer " + token
//            },
//            body: JSON.stringify({
//                cartItemId: cartItemId,
//                action: action
//            })
//        });
//
//        loadCart();
//
//    } catch (err) {
//        console.error(err);
//    }
//}
//
//// DELETE
//let deleteId = null;
//
//function removeItem(cartItemId) {
//    deleteId = cartItemId;
//    document.getElementById("confirmModal").classList.add("show");
//}
////
////// click YES
////document.getElementById("confirmYes").onclick = async () => {
////    const token = localStorage.getItem("token");
////
////    await fetch(`${API_DELETE}/${deleteId}`, {
////        method: "DELETE",
////        headers: {
////            Authorization: "Bearer " + token
////        }
////    });
////
////    document.getElementById("confirmModal").classList.remove("show");
////    loadCart();
////};
//document.getElementById("confirmYes").onclick = async () => {
//    const token = localStorage.getItem("token");
//
//    const userRes = await fetch("http://localhost:8080/api/users/me", {
//        headers: { Authorization: "Bearer " + token }
//    });
//
//    const user = await userRes.json();
//
//    if (user.status === "LOCKED") {
//        alert("Tài khoản đã bị khóa");
//        return;
//    }
//
//    await fetch(`${API_DELETE}/${deleteId}`, {
//        method: "DELETE",
//        headers: {
//            Authorization: "Bearer " + token
//        }
//    });
//
//    document.getElementById("confirmModal").classList.remove("show");
//    loadCart();
//};
//
//// click NO
//document.getElementById("confirmNo").onclick = () => {
//    document.getElementById("confirmModal").classList.remove("show");
//};
//
//// SUMMARY
//function updateSummary(items, total) {
//    document.getElementById("totalItems").innerText = items;
//    document.getElementById("totalPrice").innerText = formatMoney(total);
//}
//
//// FORMAT
//function formatMoney(amount) {
//    return new Intl.NumberFormat("vi-VN", {
//        style: "currency",
//        currency: "VND"
//    }).format(amount);
//}
//
//// NAV
//function goProfile() {
//    window.location.href = "/user/profile";
//}
////function goCheckout() {
////    window.location.href = "/user/payment";
////}
//async function goCheckout() {
//    const token = localStorage.getItem("token");
//
//    const res = await fetch("http://localhost:8080/api/users/me", {
//        headers: { Authorization: "Bearer " + token }
//    });
//
//    const user = await res.json();
//
//    if (user.status === "LOCKED") {
//        alert("Tài khoản đã bị khóa, không thể thanh toán");
//        return;
//    }
//
//    window.location.href = "/user/payment";
//}
//function handleLockedUI() {
//    const container = document.getElementById("cartItems");
//
//    container.innerHTML = `
//        <div style="text-align:center; padding:40px;">
//            <h2 style="color:red;">Tài khoản đã bị khóa</h2>
//            <p>Bạn không thể sử dụng giỏ hàng</p>
//        </div>
//    `;
//
//    // disable checkout
//    const checkoutBtn = document.querySelector(".btn-checkout");
//    if (checkoutBtn) {
//        checkoutBtn.disabled = true;
//        checkoutBtn.style.opacity = "0.5";
//        checkoutBtn.style.cursor = "not-allowed";
//    }
//
//    // reset summary
//    updateSummary(0, 0);
//}
//
//// INIT
////loadCart();

const API_CART = "http://localhost:8080/api/cart";
const API_UPDATE = "http://localhost:8080/api/cart/update-quantity";
const API_DELETE = "http://localhost:8080/api/cart/delete";

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Vui lòng đăng nhập");
        return window.location.href = "/login";
    }

    try {
        const res = await fetch("/api/users/me", {
            headers: { Authorization: "Bearer " + token }
        });

        const user = await res.json();

        // CHẶN NGAY TỪ ĐẦU
        if (user.status === "LOCKED") {
            alert("Tài khoản của bạn đã bị khóa");
            return window.location.href = "/";
        }

        // hợp lệ mới load cart
        loadCart();

    } catch (err) {
        console.error(err);
        window.location.href = "/login";
    }
});

// ===== LOAD CART =====
async function loadCart() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(API_CART, {
            headers: { Authorization: "Bearer " + token }
        });

        const data = await res.json();
        renderCart(data.items, data.totalPrice);

    } catch (err) {
        console.error(err);
    }
}

// ===== RENDER =====
function renderCart(items, totalPrice) {
    const container = document.getElementById("cartItems");
    container.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML = "<p>Giỏ hàng trống</p>";
        updateSummary(0, 0);
        return;
    }

    let totalItems = 0;

    items.forEach(item => {
        totalItems += Number(item.quantity || 0);

        container.innerHTML += `
            <div class="cart-item">
                <div class="left">
                    <img src="http://localhost:8080${item.image}" />
                    <div class="cart-info">
                        <h3>${item.productName}</h3>
                        <p>${formatMoney(item.price)}</p>
                        <p>Size: ${item.size} | Color: ${item.color}</p>
                    </div>
                </div>

                <div class="right">
                    <div class="quantity">
                        <button onclick="changeQty('${item.cartItemId}', 'DECREASE')"
                            ${item.quantity <= 1 ? "disabled" : ""}>−</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQty('${item.cartItemId}', 'INCREASE')">+</button>
                    </div>

                    <button class="btn-remove" onclick="removeItem('${item.cartItemId}')">
                        Xóa
                    </button>
                </div>
            </div>
        `;
    });

    updateSummary(totalItems, totalPrice);
}

// ===== UPDATE QTY =====
async function changeQty(cartItemId, action) {
    const token = localStorage.getItem("token");

    try {
        await fetch(API_UPDATE, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ cartItemId, action })
        });

        loadCart();

    } catch (err) {
        console.error(err);
    }
}

// ===== DELETE =====
let deleteId = null;

function removeItem(cartItemId) {
    deleteId = cartItemId;
    document.getElementById("confirmModal").classList.add("show");
}

document.getElementById("confirmYes").onclick = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${API_DELETE}/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
    });

    document.getElementById("confirmModal").classList.remove("show");
    loadCart();
};

document.getElementById("confirmNo").onclick = () => {
    document.getElementById("confirmModal").classList.remove("show");
};

// ===== SUMMARY =====
function updateSummary(items, total) {
    document.getElementById("totalItems").innerText = items;
    document.getElementById("totalPrice").innerText = formatMoney(total);
}

// ===== FORMAT =====
function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
}

// ===== NAV =====
function goProfile() {
    window.location.href = "/user/profile";
}

function goCheckout() {
    window.location.href = "/user/payment";
}