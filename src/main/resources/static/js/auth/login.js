// // Đường dẫn API đăng nhập của hệ thống
// const API = "http://localhost:8080/api/auth/login";

// // ===== HELPER: THÔNG BÁO CHUYÊN NGHIỆP =====
// const notify = {
//     toast: (msg, icon = 'success') => {
//         if (typeof Swal === 'undefined') { alert(msg); return; }
//         const Toast = Swal.mixin({
//             toast: true,
//             position: 'top-end',
//             showConfirmButton: false,
//             timer: 3000,
//             timerProgressBar: true,
//             background: '#111',
//             color: '#fff'
//         });
//         Toast.fire({ icon: icon, title: msg });
//     },
//     popup: (title, msg, icon = 'warning') => {
//         if (typeof Swal === 'undefined') { alert(title + ": " + msg); return; }
//         Swal.fire({
//             title: title.toUpperCase(),
//             text: msg,
//             icon: icon,
//             background: '#000',
//             color: '#fff',
//             confirmButtonColor: '#fff',
//             confirmButtonText: '<span style="color:#000; font-weight:900;">ĐÃ HIỂU</span>',
//             customClass: {
//                 popup: 'ez-swal-popup',
//                 title: 'ez-swal-title'
//             }
//         });
//     }
// };

// async function login() {
//     const usernameInput = document.getElementById("username");
//     const passwordInput = document.getElementById("password");
//     const btnLogin = document.getElementById("btn-login");

//     const username = usernameInput.value.trim();
//     const password = passwordInput.value;

//     // Kiểm tra dữ liệu đầu vào cơ bản
//     if (!username || !password) {
//         notify.toast("Vui lòng nhập đầy đủ Email/SĐT và Mật khẩu!", "warning");
//         return;
//     }

//     // Đổi trạng thái nút bấm
//     btnLogin.innerText = "ĐANG XÁC THỰC...";
//     btnLogin.disabled = true;

//     try {
//         const res = await fetch(API, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 username: username,
//                 password: password
//             })
//         });

//         const data = await res.json();

//         if (res.ok) {
//             // Thông báo thành công
//             notify.toast("Đăng nhập thành công!", "success");
            
//             // Lưu thông tin
//             localStorage.setItem("token", data.token);
//             localStorage.setItem("role", data.role);
//             localStorage.setItem("userName", data.name || username);
            
//             // Chuyển hướng sau 1 giây để người dùng kịp nhìn thấy thông báo
//             setTimeout(() => {
//                 if (data.role === "ADMIN") {
//                     window.location.href = "/admin/dashboard";
//                 } else {
//                     window.location.href = "/";
//                 }
//             }, 1000);
            
//         } else {
//             // Hiển thị lỗi từ server bằng Popup
//             notify.popup("Đăng nhập thất bại", data.message || "Tài khoản hoặc mật khẩu không chính xác!", "error");
            
//             // Reset nút bấm
//             btnLogin.innerText = "ĐĂNG NHẬP";
//             btnLogin.disabled = false;
//         }

//     } catch (err) {
//         console.error("Login Error:", err);
//         notify.toast("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau!", "error");
        
//         // Reset nút bấm
//         btnLogin.innerText = "ĐĂNG NHẬP";
//         btnLogin.disabled = false;
//     }
// }

// /**
//  * SELF-CORRECTION: 
//  * Hỗ trợ người dùng nhấn phím Enter để đăng nhập nhanh hơn.
//  */
// document.addEventListener("keypress", function (e) {
//     if (e.key === "Enter") {
//         login();
//     }
// });
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