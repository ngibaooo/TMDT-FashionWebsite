/**
 * EAZY VIBES - REGISTER ENGINE
 * Cập nhật hệ thống thông báo chuyên nghiệp
 */

const API_REGISTER = "http://localhost:8080/api/auth/register";

const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");
const passwordHint = document.getElementById("passwordHint");
const confirmHint = document.getElementById("confirmHint");
const btnRegister = document.getElementById("btn-register");

// ===== HELPER: THÔNG BÁO CHUYÊN NGHIỆP =====
const notify = {
    toast: (msg, icon = 'success') => {
        if (typeof Swal === 'undefined') { alert(msg); return; }
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#111',
            color: '#fff'
        });
        Toast.fire({ icon: icon, title: msg });
    },
    popup: (title, msg, icon = 'warning') => {
        if (typeof Swal === 'undefined') { alert(title + ": " + msg); return; }
        Swal.fire({
            title: title.toUpperCase(),
            text: msg,
            icon: icon,
            background: '#000',
            color: '#fff',
            confirmButtonColor: '#fff',
            confirmButtonText: '<span style="color:#000; font-weight:900;">ĐÃ HIỂU</span>',
            customClass: {
                popup: 'ez-swal-popup',
                title: 'ez-swal-title'
            }
        });
    }
};

// 1. VALIDATE MẬT KHẨU REALTIME
passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;
    const isValid = value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value); 

    if (isValid) {
        passwordHint.style.color = "#4CAF50";
        passwordHint.innerText = "Mật khẩu hợp lệ ✔";
    } else {
        passwordHint.style.color = "#ff4d4f";
        passwordHint.innerText = "Yêu cầu: 8+ ký tự, có hoa, thường, số, ký tự đặc biệt.";
    }
});

// 2. KIỂM TRA MẬT KHẨU NHẬP LẠI
confirmInput.addEventListener("input", () => {
    if (confirmInput.value === passwordInput.value && confirmInput.value !== "") {
        confirmHint.style.color = "#4CAF50";
        confirmHint.innerText = "Mật khẩu đã khớp ✔";
    } else {
        confirmHint.style.color = "#ff4d4f";
        confirmHint.innerText = "Mật khẩu không khớp";
    }
});

// 3. ẨN/HIỆN MẬT KHẨU
function togglePassword(id, el) {
    const input = document.getElementById(id);
    if (input.type === "password") {
        input.type = "text";
        el.innerText = "🙈";
    } else {
        input.type = "password";
        el.innerText = "👁";
    }
}

// 4. XỬ LÝ ĐĂNG KÝ
async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !phone || !address || !password) {
        notify.toast("Vui lòng điền đầy đủ các trường thông tin!", "warning");
        return;
    }

    if (password !== confirmPassword) {
        notify.popup("Mật khẩu không khớp", "Xác nhận mật khẩu phải trùng khớp với mật khẩu đã nhập!", "error");
        return;
    }

    // Đổi trạng thái nút bấm
    btnRegister.innerText = "ĐANG TẠO TÀI KHOẢN...";
    btnRegister.disabled = true;

    try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("password", password);

        const res = await fetch(API_REGISTER, {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            notify.popup("Thành công", "Chào mừng bạn đã trở thành thành viên của EAZY VIBES!", "success");
            setTimeout(() => {
                window.location.href = "/login";
            }, 2500);
        } else {
            notify.popup("Đăng ký thất bại", data.message || "Email hoặc số điện thoại đã tồn tại trong hệ thống.", "error");
            btnRegister.innerText = "TẠO TÀI KHOẢN NGAY";
            btnRegister.disabled = false;
        }

    } catch (err) {
        console.error("Register Error:", err);
        notify.toast("Lỗi hệ thống. Vui lòng thử lại sau!", "error");
        btnRegister.innerText = "TẠO TÀI KHOẢN NGAY";
        btnRegister.disabled = false;
    }
}