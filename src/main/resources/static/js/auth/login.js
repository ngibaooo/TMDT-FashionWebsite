const API = "http://localhost:8080/api/auth/login";

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
            customClass: { popup: 'ez-swal-popup', title: 'ez-swal-title' }
        });
    }
};
/**
 * HÀM ẨN/HIỆN MẬT KHẨU
 */
function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.querySelector(".toggle-password");
    
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.innerText = "visibility_off"; // Đổi icon sang mắt gạch chéo
    } else {
        passwordInput.type = "password";
        toggleIcon.innerText = "visibility"; // Đổi icon về mắt thường
    }
}
async function login() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const btnLogin = document.getElementById("btn-login");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        notify.toast("Vui lòng nhập đầy đủ Email/SĐT và Mật khẩu!", "warning");
        return;
    }

    btnLogin.innerText = "ĐANG XÁC THỰC...";
    btnLogin.disabled = true;

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            notify.toast("Đăng nhập thành công!", "success");
            
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("userName", data.name || username);
            // FIX: Lưu trạng thái tài khoản vào localStorage để kiểm tra ở các trang khác
            localStorage.setItem("userStatus", data.status || "ACTIVE");
            
            setTimeout(() => {
                if (data.role === "ADMIN") {
                    window.location.href = "/admin/dashboard";
                } else {
                    window.location.href = "/";
                }
            }, 1000);
            
        } else {
            notify.popup("Đăng nhập thất bại", data.message || "Tài khoản hoặc mật khẩu không chính xác!", "error");
            btnLogin.innerText = "ĐĂNG NHẬP";
            btnLogin.disabled = false;
        }

    } catch (err) {
        console.error("Login Error:", err);
        notify.toast("Lỗi kết nối máy chủ!", "error");
        btnLogin.innerText = "ĐĂNG NHẬP";
        btnLogin.disabled = false;
    }
}

document.addEventListener("keypress", function (e) {
    if (e.key === "Enter") login();
});
function loginWithGoogle() {
    // Tạm thời fake redirect (sau này backend sẽ xử lý)
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
}
window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
        localStorage.setItem("token", token);
        notify.toast("Đăng nhập Google thành công!", "success");

        // xoá token khỏi URL cho đẹp
        window.history.replaceState({}, document.title, "/");

        // reload để apply login
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
};