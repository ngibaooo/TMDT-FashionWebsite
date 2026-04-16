const API_UPDATE_STATUS = "http://localhost:8080/api/orders";



function getQuery(param) {
    return new URLSearchParams(window.location.search).get(param);
}

const orderId = getQuery("orderId");
const amount = getQuery("amount");

document.getElementById("orderId").innerText = orderId;
document.getElementById("amount").innerText = formatMoney(amount);

async function paySuccess() {
    const token = localStorage.getItem("token");

    await fetch(`${API_UPDATE_STATUS}/${orderId}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: JSON.stringify({
            status: "PAID"
        })
    });

    window.location.href = `/payment-success?orderId=${orderId}`;
}

async function payFail() {
    const token = localStorage.getItem("token");

    await fetch(`${API_UPDATE_STATUS}/${orderId}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: JSON.stringify({
            status: "FAILED"
        })
    });

    alert("Thanh toán thất bại!");
    window.location.href = "/user/cart";
}

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
}