document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    const loginBtn = document.getElementById("loginBtn");
    const avatar = document.getElementById("userAvatar");
    const dropdown = document.getElementById("headerDropdown");

    if (!loginBtn || !avatar) return;

    // ===== CHƯA LOGIN =====
    if (!token) {
        avatar.style.display = "none";
        loginBtn.style.display = "inline-block";
        return;
    }

    // ===== ĐÃ LOGIN =====
    loginBtn.style.display = "none";
    avatar.style.display = "flex";

    try {
        const res = await fetch("/api/users/me", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            console.warn("Token lỗi hoặc hết hạn");
            return; // ❌ KHÔNG logout vội
        }

        const user = await res.json();

        // ===== AVATAR =====
        if (user.avatar) {
            avatar.innerHTML = `
                <img src="/uploads/${user.avatar}"
                     onerror="this.src='/images/default-avatar.png'">
            `;
        } else {
            const name = user.name || "U";
            avatar.innerText = name.charAt(0).toUpperCase();
        }

    } catch (err) {
        console.error("Lỗi fetch user:", err);
    }

    // ===== DROPDOWN =====
    if (avatar && dropdown) {
        avatar.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".account-wrapper")) {
                dropdown.classList.remove("show");
            }
        });
    }

    // ===== PROFILE =====
    const headerProfile = document.getElementById("headerProfile");
    if (headerProfile) {
        headerProfile.onclick = () => {
            window.location.href = "/user/profile";
        };
    }

    // ===== LOGOUT =====
    const headerLogout = document.getElementById("headerLogout");
    if (headerLogout) {
        headerLogout.onclick = () => {
            localStorage.removeItem("token");
            window.location.href = "/login";
        };
    }
});