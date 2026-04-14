const API = "http://localhost:8080/api/auth/register";

async function register() {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Mật khẩu không khớp");
        return;
    }

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
}