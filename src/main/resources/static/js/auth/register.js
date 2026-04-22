const API_REGISTER = "http://localhost:8080/api/auth/register";

const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");
const passwordHint = document.getElementById("passwordHint");
const confirmHint = document.getElementById("confirmHint");

// 1. VALIDATE MẬT KHẨU REALTIME
passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;

    const isValid =
        value.length >= 8 &&
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /[0-9]/.test(value) &&
        /[^A-Za-z0-9]/.test(value); 

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
        alert("Vui lòng điền đầy đủ các trường thông tin!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Xác nhận mật khẩu không chính xác!");
        return;
    }

    try {
        // Sử dụng FormData phù hợp với API xử lý đa phần (Multipart) nếu cần
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("password", password);

        const res = await fetch(API_REGISTER, {
            method: "POST",
            body: formData
            // Lưu ý: Không đặt Content-Type khi dùng FormData để fetch tự động set Multipart boundary
        });

        const data = await res.json();

        if (res.ok) {
            alert("Chúc mừng! Bạn đã trở thành thành viên EAZY VIBES.");
            window.location.href = "/login";
        } else {
            alert(data.message || "Đăng ký thất bại. Vui lòng thử lại!");
        }

    } catch (err) {
        console.error("Register Error:", err);
        alert("Lỗi hệ thống. Vui lòng kiểm tra lại kết nối server!");
    }
}