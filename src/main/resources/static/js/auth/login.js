const API = "http://localhost:8080/api/auth/login";

async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    const data = await res.json();

    if (res.ok) {
        localStorage.setItem("token", data.token);

        // phân quyền
        if (data.role === "ADMIN") {
            window.location.href = "/admin";
        } else {
            window.location.href = "/profile";
        }

    } else {
        alert(data.message || "Đăng nhập thất bại");
    }
}