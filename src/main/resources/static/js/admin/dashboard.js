const API_SUMMARY = "http://localhost:8080/api/admin/revenue/summary";
const API_MONTH = "http://localhost:8080/api/admin/revenue/by-month";
const API_TOP = "http://localhost:8080/api/products/admin/best-selling";
const API_ORDER_STATUS = "http://localhost:8080/api/orders/admin/status-summary";


document.addEventListener("DOMContentLoaded", () => {

    const role = localStorage.getItem("role");

    if (!role || role.toUpperCase() !== "ADMIN") {
        window.location.href = "/login";
        return;
    }

    loadSummaryWithGrowth();
    loadRevenueChart();
    loadTopProduct();
    loadOrderStatus();
    loadOrderStatusChart();
});
async function loadOrderStatus() {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(API_ORDER_STATUS, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        renderOrderStatus(data);

    } catch (e) {
        console.error("Order status error:", e);
    }
}

//  SUMMARY + GROWTH
async function loadSummaryWithGrowth() {
    try {
        const token = localStorage.getItem("token");

        // Lấy tháng hiện tại
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-11

        //  tháng hiện tại
        const currentFrom = new Date(year, month, 1);
        const currentTo = new Date(year, month + 1, 0);

        // tháng trước
        const prevFrom = new Date(year, month - 1, 1);
        const prevTo = new Date(year, month, 0);

        // gọi API
        const current = await fetchSummary(currentFrom, currentTo, token);
        const previous = await fetchSummary(prevFrom, prevTo, token);

        // render số
        renderCard("revenue", current.totalRevenue, previous.totalRevenue, true);
        renderCard("orders", current.totalOrders, previous.totalOrders);
        renderCard("products", current.totalProductsSold, previous.totalProductsSold);

    } catch (e) {
        console.error("Summary error:", e);
    }
}
function renderTopProducts(list) {
    const container = document.getElementById("topProduct");

    container.innerHTML = list.map((p, index) => `
        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:6px 0;
            border-bottom:1px solid #eee;
        ">
            <span style="font-size:13px;">
                ${index + 1}. ${p.name}
            </span>

            <span style="
                font-size:12px;
                color:#666;
                font-weight:600;
            ">
                ${p.totalSold} sold
            </span>
        </div>
    `).join("");
}


// CALL API SUMMARY
async function fetchSummary(fromDate, toDate, token) {
    const from = formatDate(fromDate);
    const to = formatDate(toDate);

    const res = await fetch(`${API_SUMMARY}?from=${from}&to=${to}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    return await res.json();
}


// RENDER CARD + GROWTH
function renderCard(elementId, currentValue, previousValue, isMoney = false) {

    const growth = calcGrowth(currentValue, previousValue);

    const valueText = isMoney
        ? formatMoney(currentValue)
        : currentValue;

    document.getElementById(elementId).innerHTML =
        `${valueText} ${renderGrowth(growth)}`;
}


// CALC GROWTH
function calcGrowth(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}


// RENDER UI GROWTH
function renderGrowth(value) {
    const isUp = value >= 0;

    const color = isUp ? "#16a34a" : "#dc2626";
    const arrow = isUp ? "▲" : "▼";

    return `
        <span style="
            color:${color};
            font-size:12px;
            font-weight:600;
            margin-left:6px;
        ">
            ${arrow} ${Math.abs(value).toFixed(1)}%
        </span>
    `;
}


//  TOP PRODUCT
async function loadTopProduct() {
    try {
        const token = localStorage.getItem("token");

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const from = new Date(year, month, 1);
        const to = new Date(year, month + 1, 0);

        const res = await fetch(
            `${API_TOP}?from=${formatDate(from)}&to=${formatDate(to)}&page=0&size=5`,
            {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await res.json();

        console.log("TOP PRODUCT:", data); // debug

        renderTopProducts(data.content);

    } catch (e) {
        console.error("Top product error:", e);
    }
}
// CHART
async function loadRevenueChart() {
    try {
        const token = localStorage.getItem("token");

        const year = new Date().getFullYear();

        const res = await fetch(API_MONTH + "?year=" + year, {
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
                    data: values,
                    tension: 0.4
                }]
            }
        });

    } catch (e) {
        console.error("Chart error:", e);
    }
}
const statusColors = {
    PENDING: "#facc15",    // vàng
    PAID: "#16a34a",       // xanh lá
    SHIPPING: "#3b82f6",   // xanh dương
    COMPLETED: "#9ca3af",  // xám
    CANCELLED: "#dc2626",  // đỏ
    FAILED: "#f97316"      // cam
};

async function loadOrderStatusChart() {
    const token = localStorage.getItem("token");

    const res = await fetch(API_ORDER_STATUS, {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();

    const labels = Object.keys(data);
    const values = Object.values(data);

    // 👉 map màu theo đúng status
    const colors = labels.map(status => statusColors[status] || "#ccc");

    new Chart(document.getElementById("orderStatusChart"), {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: "bottom"
                }
            },
            cutout: "60%"
        }
    });
}

// UTILS
function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
}

function formatDate(date) {
    return date.toISOString().split("T")[0];
}
function renderOrderStatus(data) {
    const container = document.getElementById("orderStatus");

    container.innerHTML = Object.entries(data).map(([status, count]) => `
        <div style="
            display:flex;
            justify-content:space-between;
            padding:6px 0;
            border-bottom:1px solid #eee;
        ">
            <span style="font-size:13px;">
                ${status}
            </span>

            <span style="
                font-size:12px;
                font-weight:600;
                color:#333;
            ">
                ${count}
            </span>
        </div>
    `).join("");
}