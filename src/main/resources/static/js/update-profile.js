const API_USER = "http://localhost:8080/api/users/me";
const API_UPDATE = "http://localhost:8080/api/users/me";
// LOAD DATA
async function loadUser() {
    const token = localStorage.getItem("token");

    const res = await fetch(API_USER, {
        headers: { Authorization: "Bearer " + token }
    });

    const user = await res.json();

    document.getElementById("name").value = user.name || "";
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("address").value = user.address || "";

    document.getElementById("previewAvatar").src =
        "http://localhost:8080/uploads/" + user.avatar;
}

// PREVIEW AVATAR
document.getElementById("avatarInput").addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        document.getElementById("previewAvatar").src =
            URL.createObjectURL(file);
    }
});

// UPDATE
document.getElementById("btnUpdate").onclick = async () => {
    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("name", document.getElementById("name").value);
    formData.append("phone", document.getElementById("phone").value);
    formData.append("address", document.getElementById("address").value);

    const file = document.getElementById("avatarInput").files[0];
    if (file) {
        formData.append("avatar", file);
    }

    try {
        const res = await fetch(API_UPDATE, {
            method: "PUT",
            headers: {
                Authorization: "Bearer " + token
            },
            body: formData
        });

        const data = await res.json();
        if (res.ok) {
            alert("Cập nhật thành công!");
            window.location.href = "/user/profile";
        } else {
            handleError(data.message);
            return;
        }

    } catch (err) {
        console.error(err);
    }
};
function handleError(msg) {
    // reset lỗi trước
    document.getElementById("phoneError").innerText = "";
    document.getElementById("errorMsg").innerText = "";

    if (msg.includes("SĐT")) {
        document.getElementById("phoneError").innerText = msg;
    } else {
        document.getElementById("errorMsg").innerText = msg;
    }
}
document.getElementById("phone").addEventListener("input", () => {
    document.getElementById("phoneError").innerText = "";
});
// INIT
loadUser();