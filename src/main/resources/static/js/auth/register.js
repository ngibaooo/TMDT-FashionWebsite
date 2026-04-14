const API = "http://localhost:8080/api/auth/register";

const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");

const passwordHint = document.getElementById("passwordHint");
const confirmHint = document.getElementById("confirmHint");

// VALIDATE PASSWORD REALTIME
passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;

    const isValid =
        value.length >= 8 &&
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /[0-9]/.test(value) &&
        /[^A-Za-z0-9]/.test(value); // ký tự đặc biệt

    if (isValid) {
        passwordHint.style.color = "#4CAF50";
        passwordHint.innerText = "Mật khẩu mạnh ✔";
    } else {
        passwordHint.style.color = "#ff4d4f";
        passwordHint.innerText =
            "Ít nhất 8 ký tự, có hoa, thường, số và ký tự đặc biệt";
    }
});

// CHECK CONFIRM PASSWORD
confirmInput.addEventListener("input", () => {
    if (confirmInput.value === passwordInput.value) {
        confirmHint.style.color = "#4CAF50";
        confirmHint.innerText = "Mật khẩu khớp";
    } else {
        confirmHint.style.color = "#ff4d4f";
        confirmHint.innerText = "Mật khẩu không khớp";
    }
});

// TOGGLE PASSWORD
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

// REGISTER
async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    if (!name || !email || !phone || !address || !password) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    if (password !== confirmPassword) {
        alert("Mật khẩu không khớp");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("password", password);

        const res = await fetch(API, {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            alert("Đăng ký thành công!");
            window.location.href = "/login";
        } else {
            alert(data.message || "Đăng ký thất bại");
        }

    } catch (err) {
        alert("Lỗi kết nối server");
    }
}