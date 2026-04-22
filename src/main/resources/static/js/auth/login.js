// Đường dẫn API đăng nhập của hệ thống
const API = "http://localhost:8080/api/auth/login";

async function login() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Kiểm tra dữ liệu đầu vào cơ bản
    if (!username || !password) {
        alert("Vui lòng nhập đầy đủ Email/SĐT và Mật khẩu!");
        return;
    }

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        // Đọc dữ liệu phản hồi từ Server
        const data = await res.json();

       if (res.ok) {
           localStorage.setItem("token", data.token);
           localStorage.setItem("role", data.role);
           localStorage.setItem("userName", data.name || username);
           if (data.role === "ADMIN") {
               window.location.href = "/admin/dashboard";
           } else {
               window.location.href = "/";
           }
       } else {
            // Hiển thị lỗi từ server (ví dụ: sai mật khẩu, tài khoản bị khóa)
            alert(data.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại!");
        }

    } catch (err) {
        console.error("Login Error:", err);
        alert("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau!");
    }
}

/**
 * SELF-CORRECTION: 
 * Hỗ trợ người dùng nhấn phím Enter để đăng nhập nhanh hơn.
 */
document.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        login();
    }
});