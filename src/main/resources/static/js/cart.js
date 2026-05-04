/**
 * EAZY VIBES - CART PAGE ENGINE
 */
const API_CART = "http://localhost:8080/api/cart";
const API_UPDATE = "http://localhost:8080/api/cart/update-quantity";
const API_DELETE = "http://localhost:8080/api/cart/delete";

// ===== HELPER: THÔNG BÁO =====
const notify = {
    toast: (msg, icon = 'success') => {
        if (typeof Swal === 'undefined') { alert(msg); return; }
        Swal.mixin({ toast: true, position: 'bottom-end', showConfirmButton: false, timer: 3000, timerProgressBar: true, background: '#000', color: '#fff' }).fire({ icon: icon, title: msg });
    },
    popup: (title, msg, icon = 'warning') => {
        if (typeof Swal === 'undefined') { alert(title + ": " + msg); return; }
        return Swal.fire({ title: title.toUpperCase(), text: msg, icon: icon, background: '#fff', color: '#000', confirmButtonColor: '#000', confirmButtonText: '<span style="font-weight:900;">ĐÃ HIỂU</span>', customClass: { popup: 'ez-swal-popup' } });
    }
};

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login";
        return;
    }

    try {
        const res = await fetch("/api/users/me", { headers: { Authorization: "Bearer " + token } });
        const user = await res.json();
        if (user.status === "LOCKED") {
            await notify.popup("TÀI KHOẢN BỊ KHÓA", "Tài khoản của bạn đã bị khóa chức năng này!", "error");
            window.location.href = "/";
            return;
        }
        loadCart();
    } catch (err) { window.location.href = "/login"; }
});

async function loadCart() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(API_CART, { headers: { Authorization: "Bearer " + token } });
        const data = await res.json();
        renderCart(data.items, data.totalPrice);
    } catch (err) { console.error(err); }
}

function renderCart(items, totalPrice) {
    const container = document.getElementById("cartItems");
    container.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML = "<p style='color:#999; padding: 40px 0;'>Giỏ hàng hiện chưa có sản phẩm nào.</p>";
        updateSummary(0, 0);
        localStorage.setItem("cartCount", "0");
        window.dispatchEvent(new Event("cartUpdated"));
        return;
    }

    let totalItemsCount = 0;
    let totalPriceActive = 0;

    items.forEach(item => {
        const isInactive = item.variantStatus === "INACTIVE";
        if (!isInactive) {
            totalItemsCount += Number(item.quantity || 0);
            totalPriceActive += Number(item.total || 0);
        }
        
        container.innerHTML += `
            <div class="cart-item ${isInactive ? 'inactive' : ''}" style="border-bottom: 1px solid #f0f0f0; padding: 30px 0; display: flex; justify-content: space-between; align-items: center;">
                <div class="left" style="display: flex; gap: 25px; align-items: center;">
                    <img src="http://localhost:8080${item.image}" style="width: 100px; aspect-ratio: 3/4; object-fit: cover; background: #f9f9f9;" />
                    <div class="cart-info">
                        <h3 style="font-size: 15px; font-weight: 900; text-transform: uppercase; color: #000; margin: 0 0 5px 0;">${item.productName}</h3>
                        <p style="margin: 0 0 8px 0; font-weight: 700; color: #333;">${formatMoney(item.price)}</p>
                        <p style="font-size: 12px; color: #888; margin: 0;">SIZE: ${item.size} | MÀU: ${item.color}</p>
                        ${isInactive ? `<p style="color:red; font-size:11px; margin-top:5px; font-weight:700;">HẾT HÀNG</p>` : ''}
                    </div>
                </div>

                <div class="right" style="display: flex; align-items: center; gap: 40px;">
                    <div class="quantity" style="display: flex; align-items: center; border: 1px solid #000; background: #fff;">
                        <button onclick="changeQty('${item.cartItemId}', 'DECREASE')" style="width: 35px; height: 35px; background: none; border: none; cursor: pointer; font-weight: 900;" ${item.quantity <= 1 || isInactive ? "disabled" : ""}>−</button>
                        <span style="width: 40px; text-align: center; font-weight: 900; font-size: 14px;">${item.quantity}</span>
                        <button onclick="changeQty('${item.cartItemId}', 'INCREASE')" style="width: 35px; height: 35px; background: none; border: none; cursor: pointer; font-weight: 900;" ${isInactive ? "disabled" : ""}>+</button>
                    </div>
                    <button onclick="removeItem('${item.cartItemId}')" style="background: none; border: none; color: #ff0000; font-weight: 900; cursor: pointer; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Xóa</button>
                </div>
            </div>
        `;
    });

    updateSummary(totalItemsCount, totalPriceActive);
    localStorage.setItem("cartCount", totalItemsCount.toString());
    window.dispatchEvent(new Event("cartUpdated"));
}

async function changeQty(cartItemId, action) {
    const token = localStorage.getItem("token");
    try {
        await fetch(API_UPDATE, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ cartItemId, action }) });
        loadCart();
    } catch (err) { console.error(err); }
}

let deleteId = null;
function removeItem(cartItemId) {
    deleteId = cartItemId;
    document.getElementById("confirmModal").style.display = "flex";
}

document.getElementById("confirmYes").onclick = async () => {
    const token = localStorage.getItem("token");
    try {
        await fetch(`${API_DELETE}/${deleteId}`, { method: "DELETE", headers: { Authorization: "Bearer " + token } });
        document.getElementById("confirmModal").style.display = "none";
        notify.toast("Đã xóa sản phẩm");
        loadCart();
    } catch (err) { console.error(err); }
};

document.getElementById("confirmNo").onclick = () => {
    document.getElementById("confirmModal").style.display = "none";
};

function updateSummary(items, total) {
    document.getElementById("totalItems").innerText = items;
    document.getElementById("totalPrice").innerText = formatMoney(total);
}

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function goCheckout() { 
    const status = localStorage.getItem("userStatus");
    if (status === "LOCKED") {
        notify.popup("TÀI KHOẢN BỊ KHÓA", "Bạn không thể thực hiện giao dịch!", "error");
        return;
    }
    window.location.href = "/user/payment"; 
}