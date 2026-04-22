document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("token");

    // ===== LOGO =====
    const logo = document.querySelector(".logo");
    if (logo) {
        logo.onclick = () => window.location.href = "/";
    }

    // ===== CART =====
    const cartIcon = document.getElementById("cartIcon");

    if (cartIcon) {
        cartIcon.onclick = async () => {
            if (!token) {
                alert("Vui lòng đăng nhập");
                return window.location.href = "/login";
            }

            try {
                const res = await fetch("/api/users/me", {
                    headers: { Authorization: "Bearer " + token }
                });

                const user = await res.json();

                if (user.status === "LOCKED") {
                    alert("Tài khoản của bạn đã bị khóa");
                    return window.location.href = "/";
                }

                window.location.href = "/user/cart";

            } catch (err) {
                console.error(err);
            }
        };
    }

    // ===== ACCOUNT =====
    const accountIcon = document.getElementById("accountIcon");
    const dropdown = document.getElementById("accountDropdown");

    if (accountIcon && token) {
        try {
            const res = await fetch("/api/users/me", {
                headers: { Authorization: "Bearer " + token }
            });

            const user = await res.json();

            if (user.avatar) {
                accountIcon.innerHTML = `
                    <img src="/uploads/${user.avatar}"
                         onerror="this.src='/images/default-avatar.png'">
                `;
            } else {
                const name = user.name || "U";
                accountIcon.innerText = name.charAt(0).toUpperCase();
            }

        } catch (err) {
            console.error("Lỗi avatar:", err);
        }
    }

    // ===== DROPDOWN =====
    if (accountIcon && dropdown) {
        accountIcon.onclick = () => {
            dropdown.classList.toggle("show");
        };

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".account-wrapper")) {
                dropdown.classList.remove("show");
            }
        });
    }

    // ===== PROFILE =====
    const btnProfile = document.getElementById("btnProfile");
    if (btnProfile) {
        btnProfile.onclick = () => window.location.href = "/user/profile";
    }

    // ===== LOGOUT =====
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.onclick = () => {
            localStorage.removeItem("token");
            window.location.href = "/login";
        };
    }
});