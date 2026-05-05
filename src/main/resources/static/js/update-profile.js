/**
 * EAZY VIBES - UPDATE PROFILE ENGINE
 */
const API_USER = "http://localhost:8080/api/users/me";
const API_UPDATE = "http://localhost:8080/api/users/me";

// ===== HỆ THỐNG THÔNG BÁO ĐỒNG BỘ =====
const notify = {
    toast: (msg, icon = 'success') => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#000',
            color: '#fff'
        });
        Toast.fire({ icon: icon, title: msg });
    },
    popup: (title, msg, icon = 'success') => {
        return Swal.fire({
            title: title.toUpperCase(),
            text: msg,
            icon: icon,
            customClass: {
                popup: 'ez-swal-popup',
                title: 'ez-swal-title',
                confirmButton: 'ez-swal-confirm'
            },
            buttonsStyling: false
        });
    }
};

// LOAD DATA
async function loadUser() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login";
        return;
    }

    try {
        const res = await fetch(API_USER, {
            headers: { Authorization: "Bearer " + token }
        });
        const user = await res.json();

        document.getElementById("name").value = user.name || "";
        document.getElementById("phone").value = user.phone || "";
        document.getElementById("address").value = user.address || "";

        const avatarPath = user.avatar 
            ? "http://localhost:8080/uploads/" + user.avatar 
            : "/images/default-avatar.png";
        
        document.getElementById("previewAvatar").src = avatarPath;
        
    } catch (err) {
        console.error("Lỗi tải thông tin:", err);
    }
}

// PREVIEW AVATAR
document.getElementById("avatarInput").addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        // Kiểm tra kích thước file (tối đa 2MB)
        if (file.size > 2 * 1024 * 1024) {
            notify.popup("Lỗi file", "Vui lòng chọn ảnh có kích thước dưới 2MB", "warning");
            this.value = "";
            return;
        }
        document.getElementById("previewAvatar").src = URL.createObjectURL(file);
    }
});

// UPDATE ACTION
document.getElementById("btnUpdate").onclick = async () => {
    const token = localStorage.getItem("token");
    const btn = document.getElementById("btnUpdate");

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    if (!name || !phone) {
        notify.popup("Thiếu thông tin", "Vui lòng nhập đầy đủ Tên và Số điện thoại", "warning");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("address", address);

    const file = document.getElementById("avatarInput").files[0];
    if (file) {
        formData.append("avatar", file);
    }

    // Hiển thị trạng thái Loading
    btn.innerText = "UPDATING...";
    btn.disabled = true;

    try {
        const res = await fetch(API_UPDATE, {
            method: "PUT",
            headers: { Authorization: "Bearer " + token },
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            // Cập nhật thành công
            await notify.popup("Thành công", "Thông tin cá nhân của bạn đã được cập nhật!", "success");
            window.location.href = "/user/profile";
        } else {
            handleError(data.message || "Không thể cập nhật thông tin");
        }

    } catch (err) {
        console.error(err);
        notify.popup("Lỗi kết nối", "Máy chủ không phản hồi, vui lòng thử lại sau!", "error");
    } finally {
        btn.innerText = "SAVE CHANGES";
        btn.disabled = false;
    }
};

function handleError(msg) {
    // reset lỗi trước
    document.getElementById("phoneError").innerText = "";
    document.getElementById("errorMsg").innerText = "";

    if (msg.includes("SĐT") || msg.toLowerCase().includes("phone")) {
        document.getElementById("phoneError").innerText = msg;
        notify.toast(msg, "error");
    } else {
        document.getElementById("errorMsg").innerText = msg;
        notify.popup("Cập nhật thất bại", msg, "error");
    }
}

document.getElementById("phone").addEventListener("input", () => {
    document.getElementById("phoneError").innerText = "";
});

// INIT
loadUser();