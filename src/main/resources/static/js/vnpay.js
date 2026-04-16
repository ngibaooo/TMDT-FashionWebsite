function getQuery(param) {
    return new URLSearchParams(window.location.search).get(param);
}

const orderId = getQuery("orderId");
const amount = getQuery("amount");

document.getElementById("orderId").innerText = orderId;
document.getElementById("amount").innerText = formatMoney(amount);

function paySuccess() {
    window.location.href = `/payment-success?orderId=${orderId}`;
}

function payFail() {
    alert("Thanh toán thất bại!");
    window.location.href = "/user/cart";
}

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
}