import { fetchRecords } from "./api.js";
import {
  rowClick,
  getSelectedId,
  loadView,
  configureModulePermissions,
  setCurrentModuleKey,
} from "./function.js";

let listOptions = {
  page: 1,
  limit: 50,
  orderBy: "id_sale",
  orderDirection: "DESC",
  searchField: "all",
  search: "",
};

export async function initView() {
  await configureModulePermissions({
    details: "sales.viewdetails",
  });
  const orderBy = document.getElementById("orderBy");
  const orderDirection = document.getElementById("orderDirection");
  const btnPrevious = document.getElementById("btnPrevious");
  const btnNext = document.getElementById("btnNext");
  const searchField = document.getElementById("searchField");
  const searchInput = document.getElementById("searchInput");
  const btnSearch = document.getElementById("btnSearch");
  const btnDetail = document.getElementById("btnDetail");

  if (searchField) {
    searchField.value = listOptions.searchField;
  }

  if (searchInput) {
    searchInput.value = listOptions.search;
  }

  if (btnDetail) {
    btnDetail.addEventListener("click", async function () {
      const saleId = getSelectedId();

      if (!saleId) {
        Swal.fire({
          title: "Select a sale",
          text: "Please select a sale to view its details.",
          icon: "info",
        });
        return;
      }

      await loadView("../views/sales_details.html", "content");
      const salesDetailsModule = await import("./sales_details.js");
      await salesDetailsModule.initView(saleId);
    });
  }

  if (orderBy) {
    orderBy.value = listOptions.orderBy;

    orderBy.addEventListener("change", async function () {
      listOptions.orderBy = orderBy.value;
      listOptions.page = 1;

      await loadSales();
    });
  }

  if (orderDirection) {
    orderDirection.value = listOptions.orderDirection;

    orderDirection.addEventListener("change", async function () {
      listOptions.orderDirection = orderDirection.value;
      listOptions.page = 1;

      await loadSales();
    });
  }

  if (btnPrevious) {
    btnPrevious.addEventListener("click", async function () {
      if (listOptions.page > 1) {
        listOptions.page--;

        await loadSales();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", async function () {
      if (!btnNext.disabled) {
        listOptions.page++;

        await loadSales();
      }
    });
  }

  if (btnSearch) {
    btnSearch.addEventListener("click", async function () {
      listOptions.searchField = searchField.value;
      listOptions.search = searchInput.value.trim();
      listOptions.page = 1;

      await loadSales();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", async function (event) {
      if (event.key === "Enter") {
        listOptions.searchField = searchField.value;
        listOptions.search = searchInput.value.trim();
        listOptions.page = 1;

        await loadSales();
      }
    });
  }

  await loadSales();
}

async function loadSales() {
  const data = await fetchRecords("sales", listOptions);
  const tableBody = document.getElementById("salesTableBody");

  if (tableBody) {
    tableBody.innerHTML = "";

    const sales = data.records;

    if (sales.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
            No records found
          </td>
        </tr>
      `;
    } else {
      sales.forEach((sale) => {
        const tr = document.createElement("tr");

        let statusBadgeColor = "bg-gray-100 text-gray-800";
        switch (sale.status) {
          case "Completed":
            statusBadgeColor = "bg-green-100 text-green-800";
            break;
          case "Refunded":
            statusBadgeColor = "bg-amber-100 text-amber-800";
            break;
          case "Voided":
            statusBadgeColor = "bg-red-100 text-red-800";
            break;
        }

        const currencyFormatter = new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        });

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">#${sale.id_sale}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sale.transaction_date}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${sale.username || "Usuario #" + sale.user_id}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800">
              ${sale.payment_method}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
            ${currencyFormatter.format(sale.total_amount)}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColor}">
              ${sale.status}
            </span>
          </td>
        `;

        tr.addEventListener("click", function (event) {
          rowClick(event, sale.id_sale);
        });

        tableBody.appendChild(tr);
      });
    }

    updatePagination(data);
  }
}

function updatePagination(data) {
  const currentPage = document.getElementById("currentPage");
  const totalPages = document.getElementById("totalPages");
  const paginationSummary = document.getElementById("paginationSummary");
  const btnPrevious = document.getElementById("btnPrevious");
  const btnNext = document.getElementById("btnNext");

  currentPage.textContent = data.page;
  totalPages.textContent = data.totalPages;

  btnPrevious.disabled = data.page <= 1;
  btnNext.disabled = data.page >= data.totalPages;

  const start = data.total === 0 ? 0 : (data.page - 1) * data.limit + 1;
  const end = Math.min(data.page * data.limit, data.total);

  paginationSummary.textContent = `Showing ${start} to ${end} of ${data.total} sales`;
}
