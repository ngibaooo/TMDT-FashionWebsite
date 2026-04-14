const API_BASE = "http://localhost:8080/api";

// lấy token
const token = localStorage.getItem("token");

// ================= USER PROFILE =================
async function loadProfile() {
    const res = await fetch(`${API_BASE}/users/me`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const data = await res.json();

    document.getElementById("name").innerText = data.name;
    document.getElementById("email").innerText = data.email;
    document.getElementById("phone").innerText = data.phone;
    document.getElementById("address").innerText = data.address;

    document.getElementById("avatar").src =
        "http://localhost:8080/uploads/" + data.avatar;
}

// ================= ORDER LIST =================
async function loadOrders() {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const orders = await res.json();

    const table = document.getElementById("orderTable");
    table.innerHTML = "";

    orders.forEach(o => {
        const row = `
            <tr onclick="goToDetail('${o.id}')">
                <td>${o.id}</td>
                <td>${formatDate(o.createdAt)}</td>
                <td>${o.status}</td>
                <td>${formatPrice(o.totalPrice)}</td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

// ================= FORMAT =================
function formatPrice(price) {
    return price.toLocaleString() + "đ";
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("vi-VN");
}

// ================= REDIRECT =================
function goToDetail(orderId) {
    window.location.href = `order-detail.html?id=${orderId}`;
}

// ================= INIT =================
loadProfile();
loadOrders();