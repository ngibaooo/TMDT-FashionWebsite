const API_SUMMARY = "http://localhost:8080/api/admin/revenue/summary";
const API_MONTH = "http://localhost:8080/api/admin/revenue/by-month";
const API_TOP = "http://localhost:8080/api/products/best-selling";

document.addEventListener("DOMContentLoaded", () => {

    const role = localStorage.getItem("role");

    console.log("ROLE =", role);

    if (!role || role.toUpperCase() !== "ADMIN") {
        window.location.href = "/login";
        return;
    }

    loadSummary();
    loadChart();
    loadTopProduct();
});

// ===== SUMMARY =====
async function loadSummary() {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(API_SUMMARY, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        document.getElementById("revenue").innerText = formatMoney(data.totalRevenue);
        document.getElementById("orders").innerText = data.totalOrders;
        document.getElementById("products").innerText = data.totalProductsSold;

    } catch (e) {
        console.error("Summary error:", e);
    }
}
// ===== TOP PRODUCT =====
async function loadTopProduct() {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(API_TOP + "?page=0&size=1", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        if (data.content.length > 0) {
            document.getElementById("topProduct").innerText =
                data.content[0].name;
        }

    } catch (e) {
        console.error("Top product error:", e);
    }
}
// ===== CHART =====
async function loadChart() {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(API_MONTH + "?year=2026", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        const labels = data.map(d => "T" + d.month);
        const values = data.map(d => d.revenue);

        new Chart(document.getElementById("revenueChart"), {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Doanh thu",
                    data: values
                }]
            }
        });

    } catch (e) {
        console.error("Chart error:", e);
    }
}
// ===== FORMAT =====
function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
}
function authHeader() {
    return {
        "Authorization": "Bearer " + localStorage.getItem("token")
    };
}