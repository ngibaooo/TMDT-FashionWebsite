const API_CART = "http://localhost:8080/api/cart";
const API_UPDATE = "http://localhost:8080/api/cart/update-quantity";
const API_DELETE = "http://localhost:8080/api/cart/delete";
async function loadCart() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(API_CART, {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();

        console.log("Cart API:", data);

        renderCart(data.items, data.totalPrice);

    } catch (err) {
        console.error(err);
    }
}

// RENDER
function renderCart(items, totalPriceFromAPI) {
    const container = document.getElementById("cartItems");
    container.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML = "<p>Giỏ hàng trống</p>";
        updateSummary(0, 0);
        return;
    }

    let totalItems = 0;

    items.forEach(item => {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);

        totalItems += quantity;
//        container.innerHTML += `
//            <div class="cart-item">
//                <div class="left">
//                    <img src="http://localhost:8080${item.image}" />
//
//                    <div class="cart-info">
//                        <h3>${item.productName}</h3>
//                        <p>${formatMoney(price)}</p>
//                        <p>Size: ${item.size} | Color: ${item.color}</p>
//
//                        <p class="remove" onclick="removeItem('${item.cartItemId}')">
//                            Xóa
//                        </p>
//                    </div>
//                </div>
//
//                <div class="right">
//                    <div class="quantity">
//                        <button onclick="changeQty('${item.cartItemId}', -1)">−</button>
//                        <span>${quantity}</span>
//                        <button onclick="changeQty('${item.cartItemId}', 1)">+</button>
//                    </div>
//                </div>
//            </div>
//        `;
        container.innerHTML += `
            <div class="cart-item">
                <div class="left">
                    <img src="http://localhost:8080${item.image}" />

                    <div class="cart-info">
                        <h3>${item.productName}</h3>
                        <p>${formatMoney(price)}</p>
                        <p>Size: ${item.size} | Color: ${item.color}</p>
                    </div>
                </div>

                <div class="right">
                    <div class="quantity">
                        <button  onclick="changeQty('${item.cartItemId}', 'DECREASE')"
                                    ${quantity <= 1 ? "disabled" : ""}>−</button>
                        <span>${quantity}</span>
                        <button onclick="changeQty('${item.cartItemId}', 'INCREASE')">+</button>
                    </div>

                    <button class="btn-remove" onclick="removeItem('${item.cartItemId}')">
                        Xóa
                    </button>
                </div>
            </div>
        `;
    });

    updateSummary(totalItems, totalPriceFromAPI);
}

// UPDATE QUANTITY
async function changeQty(cartItemId, action) {
    const token = localStorage.getItem("token");

    try {
        await fetch(API_UPDATE, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                cartItemId: cartItemId,
                action: action
            })
        });

        loadCart();

    } catch (err) {
        console.error(err);
    }
}

// DELETE
let deleteId = null;

function removeItem(cartItemId) {
    deleteId = cartItemId;
    document.getElementById("confirmModal").classList.add("show");
}

// click YES
document.getElementById("confirmYes").onclick = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${API_DELETE}/${deleteId}`, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + token
        }
    });

    document.getElementById("confirmModal").classList.remove("show");
    loadCart();
};

// click NO
document.getElementById("confirmNo").onclick = () => {
    document.getElementById("confirmModal").classList.remove("show");
};

// SUMMARY
function updateSummary(items, total) {
    document.getElementById("totalItems").innerText = items;
    document.getElementById("totalPrice").innerText = formatMoney(total);
}

// FORMAT
function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
}

// NAV
function goProfile() {
    window.location.href = "/user/profile";
}
function goCheckout() {
    window.location.href = "/user/payment";
}

// INIT
loadCart();