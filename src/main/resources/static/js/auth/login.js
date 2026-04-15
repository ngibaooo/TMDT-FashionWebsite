// Đường dẫn API đăng nhập của hệ thống
const API = "http://localhost:8080/api/auth/login";

/**
 * TRACE DATA FLOW:
 * 1. Lấy dữ liệu từ Form.
 * 2. Gửi yêu cầu POST đến Server.
 * 3. Lưu dữ liệu cần thiết (Token & Tên) vào LocalStorage.
 * 4. Điều hướng người dùng dựa trên quyền (Role).
 */
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
            // LƯU TRỮ DỮ LIỆU ĐỂ DÙNG TOÀN TRANG
            localStorage.setItem("token", data.token);
            
            /** * FIX LỖI AVATAR: 
             * Lưu tên người dùng để các file index.js, tops.js... đọc được.
             * Ưu tiên lấy data.name (tên thật) từ API, nếu không có dùng tạm username.
             */
            localStorage.setItem("userName", data.name || username);

            // PHÂN QUYỀN VÀ ĐIỀU HƯỚNG
            if (data.role === "ADMIN") {
                window.location.href = "/admin";
            } else {
                // Quay về trang chủ để khách hàng tiếp tục mua sắm
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