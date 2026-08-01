import { fetchRecords } from "./api.js";
import { loadView } from "./function.js";

let dashboardOptions = {
  period: "week", // default filter: 'week' | 'month' | 'year'
};

export async function initView() {
  const periodButtons = document.querySelectorAll("[data-period]");

  // Setup period toggle buttons (Week / Month / Year)
  periodButtons.forEach((btn) => {
    btn.addEventListener("click", async function () {
      const selectedPeriod = this.getAttribute("data-period");
      dashboardOptions.period = selectedPeriod;

      // Update button styling states
      periodButtons.forEach((b) => {
        b.classList.remove("bg-indigo-600", "text-white");
        b.classList.add("text-gray-600", "hover:bg-gray-100");
      });
      this.classList.remove("text-gray-600", "hover:bg-gray-100");
      this.classList.add("bg-indigo-600", "text-white");

      await loadDashboardMetrics();
    });
  });

  // Initial load of dashboard data
  await loadDashboardMetrics();
}

// Keep track of the chart instance globally or in scope so it can be destroyed before redraws
let salesChartInstance = null;

async function loadDashboardMetrics() {
  try {
    // Fetches summary data passing period parameter to php/dashboard.php
    const data = await fetchRecords("dashboard", dashboardOptions);

    // Update Top Summary KPI Cards
    if (data.summary) {
      document.getElementById("todaySales").textContent =
        `$${data.summary.todaySales || "0.00"}`;
      document.getElementById("qtySales").textContent =
        data.summary.qtySales || 0;
      document.getElementById("outOfStock").textContent =
        data.summary.outOfStockItems || 0;
      document.getElementById("activePromotions").textContent =
        data.summary.activePromotions || 0;
    }

    // Populate Top Selling Products Table/List
    const topProductsContainer = document.getElementById("topProductsList");
    if (topProductsContainer && data.topProducts) {
      topProductsContainer.innerHTML = "";
      data.topProducts.forEach((product) => {
        const item = document.createElement("div");
        item.className =
          "flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg";
        item.innerHTML = `
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
              <i class="fa-solid fa-box"></i>
            </div>
            <div>
              <p class="font-semibold text-sm text-gray-800">${product.product_name}</p>
              <p class="text-xs text-gray-400">${product.units_sold} units sold</p>
            </div>
          </div>
          <!-- <span class="text-sm font-bold text-gray-700">$0.00</span> -->
        `;
        topProductsContainer.appendChild(item);
      });
    }

    // Render Recent Transactions
    const transactionsBody = document.getElementById("recentTransactionsBody");
    if (transactionsBody && data.recentTransactions) {
      transactionsBody.innerHTML = "";
      data.recentTransactions.forEach((tx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="py-2.5 font-medium text-sm text-gray-800">${tx.qty}</td>
          <td class="py-2.5 text-xs text-gray-500">${tx.time}</td>
          <td class="py-2.5 text-right font-bold text-sm text-gray-800">$${tx.total_amount}</td>
        `;
        transactionsBody.appendChild(tr);
      });
    }

    //Para graficar ventas por periodo de tiempo (semana, mes, año) en el dashboard
    // Render / Update Sales Trend Chart

    if (data.salesTrend && Array.isArray(data.salesTrend)) {
      const labels = data.salesTrend.map((item) => item.label);
      const salesValues = data.salesTrend.map((item) => item.total);
      const ctx = document.getElementById("salesTrendChart").getContext("2d");

      // Destroy previous chart instance if it exists
      if (salesChartInstance) {
        salesChartInstance.destroy();
      }

      salesChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Sales ($)",
              data: salesValues,
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              borderWidth: 2,
              fill: true,
              tension: 0.4, // Smooth curved lines
              pointBackgroundColor: "#6366f1",
              pointRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "#f3f4f6",
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }

    // Inicia system alerts
    // Render / Update System Alerts
    if (data.systemAlerts && Array.isArray(data.systemAlerts)) {
      const alertsContainer = document.getElementById("systemAlertsContainer"); // Adjust ID to match your HTML

      if (data.systemAlerts.length === 0) {
        alertsContainer.innerHTML = `
      <div class="p-3 bg-green-50 rounded-lg text-green-700 text-sm">
        No active alerts. Everything looks good!
      </div>`;
      } else {
        // Clear container before appending
        alertsContainer.innerHTML = "";

        // Loop through alerts using forEach
        data.systemAlerts.forEach((alert) => {
          alertsContainer.innerHTML += `
        <div class="flex items-start gap-3 p-3 bg-amber-50 rounded-lg text-amber-900 border border-amber-100 mb-2">
          <div class="p-1.5 bg-amber-100 rounded-md text-amber-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 class="text-sm font-semibold">${alert.title}</h4>
            <p class="text-xs text-amber-700 mt-0.5">${alert.message}</p>
          </div>
        </div>
      `;
        });
      }
    }
    //Fin de System Alerts
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

export async function loadDashboardView() {
  await loadView("../views/dashboard.html", "content");
  await initView();
}
