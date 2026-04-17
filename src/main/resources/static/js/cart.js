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