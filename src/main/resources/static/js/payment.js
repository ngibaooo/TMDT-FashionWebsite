// const API_CART = "http://localhost:8080/api/cart";
// const API_ORDER = "http://localhost:8080/api/orders";
// const API_VOUCHER = "http://localhost:8080/api/vouchers/apply";

// let currentVoucher = null;
// let originalPrice = 0;
// let discount = 0;
// let finalPrice = 0;

// // Hệ thống thông báo chuyên nghiệp
// const notify = {
//     toast: (msg, icon = 'success') => {
//         const Toast = Swal.mixin({
//             toast: true,
//             position: 'top-end',
//             showConfirmButton: false,
//             timer: 3000,
//             timerProgressBar: true
//         });
//         Toast.fire({ icon: icon, title: msg });
//     },
//     popup: (title, msg, icon = 'warning') => {
//         Swal.fire({
//             title: title.toUpperCase(),
//             text: msg,
//             icon: icon,
//             confirmButtonColor: '#000',
//             confirmButtonText: 'ĐÃ HIỂU',
//             customClass: { popup: 'ez-swal-popup' }
//         });
//     }
// };

// async function loadOrder() {
//     console.log("RUN LOAD ORDER");
//     const token = localStorage.getItem("token");
//     try {
//         const res = await fetch(API_CART, {
//             headers: { Authorization: "Bearer " + token }
//         });
//         const data = await res.json();
//         const activeItems = data.items.filter(i => i.variantStatus === "ACTIVE");
//         originalPrice = activeItems.reduce((sum, i) => sum + i.total, 0);
//         finalPrice = originalPrice;
//         renderOrder(activeItems);
//         updateSummary();
//     } catch (err) {
//         console.error(err);
//     }
// }

// function renderOrder(items) {
//     const container = document.getElementById("orderItems");
//     container.innerHTML = "";
//     if (!items || items.length === 0) {
//         container.innerHTML = "<p>Không có sản phẩm</p>";
//         return;
//     }
//     items.forEach(i => {
//         container.innerHTML += `
//             <div class="item">
//                 <div style="display:flex; gap:10px; align-items:center;">
//                     <img src="http://localhost:8080${i.image}" class="thumb"/>
//                     <div>
//                         <div class="name">${i.productName}</div>
//                         <div class="meta">Size: ${i.size} | Màu: ${i.color}</div>
//                         <div class="qty">x${i.quantity}</div>
//                     </div>
//                 </div>
//                 <div class="price">${formatMoney(i.price)}</div>
//             </div>
//         `;
//     });
// }

// function updateSummary() {
//     document.getElementById("originalPrice").innerText = formatMoney(originalPrice);
//     document.getElementById("discount").innerText = formatMoney(discount);
//     document.getElementById("totalPrice").innerText = formatMoney(finalPrice);
// }

// async function applyVoucher() {
//     const token = localStorage.getItem("token");
//     const code = document.getElementById("voucher").value.trim();
//     const text = document.getElementById("discountText");

//     if (!code) {
//         notify.toast("Vui lòng nhập mã voucher", "warning");
//         text.innerText = "Vui lòng nhập mã voucher";
//         text.className = "error";
//         return;
//     }

//     try {
//         const res = await fetch(API_VOUCHER, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: "Bearer " + token
//             },
//             body: JSON.stringify({ code })
//         });

//         const data = await res.json();

//         if (!res.ok) {
//             text.innerText = data.message || "Voucher không hợp lệ";
//             text.className = "error";
//             discount = 0;
//             finalPrice = originalPrice;
//             currentVoucher = null;
//             updateSummary();
//             notify.toast("Mã giảm giá không hợp lệ", "error");
//             return;
//         }

//         currentVoucher = code;
//         discount = data.discount;
//         finalPrice = data.finalPrice;

//         text.innerText = "Đã áp dụng voucher: -" + formatMoney(discount);
//         text.className = "success";

//         updateSummary();
//         notify.toast("Áp dụng mã giảm giá thành công!");

//     } catch (err) {
//         console.error(err);
//         text.innerText = "Lỗi kết nối server";
//         text.className = "error";
//         updateSummary();
//     }
// }

// async function placeOrder() {
//     const token = localStorage.getItem("token");
//     const body = {
//         address: document.getElementById("address").value,
//         phone: document.getElementById("phone").value,
//         paymentMethod: document.getElementById("payment").value,
//         voucherCode: currentVoucher
//     };

//     if (!body.address || !body.phone) {
//         notify.popup("Thiếu thông tin", "Vui lòng nhập đầy đủ địa chỉ và số điện thoại", "warning");
//         return;
//     }

//     try {
//         const res = await fetch(API_ORDER, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: "Bearer " + token
//             },
//             body: JSON.stringify(body)
//         });

//         const data = await res.json();

//         if (!res.ok) {
//             notify.popup("Thất bại", data.message || "Đặt hàng thất bại", "error");
//             return;
//         }

//         if (body.paymentMethod === "VNPAY") {
//             window.location.href = `/vnpay?orderId=${data.orderId}&amount=${finalPrice}`;
//         } else {
//             notify.popup("Thành công", "Đã đặt hàng thành công!", "success");
//             setTimeout(() => {
//                 window.location.href = "/user/cart";
//             }, 2000);
//         }

//     } catch (err) {
//         console.error(err);
//         notify.toast("Lỗi kết nối máy chủ", "error");
//     }
// }

// function formatMoney(amount) {
//     return new Intl.NumberFormat("vi-VN", {
//         style: "currency",
//         currency: "VND"
//     }).format(amount);
// }

// loadOrder();
/**
 * EAZY VIBES - PAYMENT ENGINE (FIXED SYNC)
 */
const API_CART = "http://localhost:8080/api/cart";
const API_ORDER = "http://localhost:8080/api/orders";
const API_VOUCHER = "http://localhost:8080/api/vouchers/apply";

let currentVoucher = null;
let originalPrice = 0;
let discount = 0;
let finalPrice = 0;

const notify = {
    toast: (msg, icon = 'success') => {
        if (typeof Swal === 'undefined') { alert(msg); return; }
        Swal.mixin({ toast: true, position: 'bottom-end', showConfirmButton: false, timer: 3000, timerProgressBar: true }).fire({ icon: icon, title: msg });
    },
    popup: (title, msg, icon = 'warning') => {
        Swal.fire({ title: title.toUpperCase(), text: msg, icon: icon, confirmButtonColor: '#000', confirmButtonText: 'ĐÃ HIỂU', customClass: { popup: 'ez-swal-popup' } });
    }
};

async function loadOrder() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(API_CART, { headers: { Authorization: "Bearer " + token } });
        const data = await res.json();
        const activeItems = data.items.filter(i => i.variantStatus === "ACTIVE");
        originalPrice = activeItems.reduce((sum, i) => sum + i.total, 0);
        finalPrice = originalPrice;
        renderOrder(activeItems);
        updateSummary();
    } catch (err) { console.error(err); }
}

function renderOrder(items) {
    const container = document.getElementById("orderItems");
    container.innerHTML = (items && items.length > 0) ? items.map(i => `
        <div class="item">
            <div style="display:flex; gap:10px; align-items:center;">
                <img src="http://localhost:8080${i.image}" class="thumb"/>
                <div><div class="name">${i.productName}</div><div class="meta">Size: ${i.size} | Màu: ${i.color}</div><div class="qty">x${i.quantity}</div></div>
            </div>
            <div class="price">${formatMoney(i.price)}</div>
        </div>`).join('') : "<p>Không có sản phẩm</p>";
}

function updateSummary() {
    document.getElementById("originalPrice").innerText = formatMoney(originalPrice);
    document.getElementById("discount").innerText = formatMoney(discount);
    document.getElementById("totalPrice").innerText = formatMoney(finalPrice);
}

async function applyVoucher() {
    const token = localStorage.getItem("token");
    const code = document.getElementById("voucher").value.trim();
    const text = document.getElementById("discountText");
    if (!code) { notify.toast("Vui lòng nhập mã voucher", "warning"); return; }
    try {
        const res = await fetch(API_VOUCHER, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ code }) });
        const data = await res.json();
        if (!res.ok) { text.innerText = data.message || "Voucher không hợp lệ"; text.className = "error"; discount = 0; finalPrice = originalPrice; currentVoucher = null; updateSummary(); notify.toast("Voucher không hợp lệ", "error"); return; }
        currentVoucher = code; discount = data.discount; finalPrice = data.finalPrice;
        text.innerText = "Đã áp dụng: -" + formatMoney(discount); text.className = "success"; updateSummary(); notify.toast("Áp dụng thành công!");
    } catch (err) { console.error(err); }
}

async function placeOrder() {
    const token = localStorage.getItem("token");
    const body = { address: document.getElementById("address").value, phone: document.getElementById("phone").value, paymentMethod: document.getElementById("payment").value, voucherCode: currentVoucher };
    if (!body.address || !body.phone) { notify.popup("Thiếu thông tin", "Vui lòng nhập đủ địa chỉ và số điện thoại", "warning"); return; }
    try {
        const res = await fetch(API_ORDER, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) { notify.popup("Thất bại", data.message || "Đặt hàng thất bại", "error"); return; }
        
        // FIX: PHÁT TÍN HIỆU RESET GIỎ HÀNG CHO HEADER
        window.dispatchEvent(new Event("cartUpdated"));

        if (body.paymentMethod === "VNPAY") { window.location.href = `/vnpay?orderId=${data.orderId}&amount=${finalPrice}`; }
        else { notify.popup("Thành công", "Đã đặt hàng thành công!", "success"); setTimeout(() => window.location.href = "/user/cart", 2000); }
    } catch (err) { console.error(err); }
}

function formatMoney(amount) { return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount); }
loadOrder();