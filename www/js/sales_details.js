import { fetchRecords } from "./api.js";
import { loadView, setCurrentModuleKey } from "./function.js";

let listOptions = {
  saleId: 0,
  page: 1,
  limit: 50,
  orderBy: "id_sale_item",
  orderDirection: "DESC",
  searchField: "all",
  search: "",
};

export async function initView(saleId) {
  listOptions.saleId = Number(saleId) || 0;
  listOptions.page = 1;

  const selectedSaleReference = document.getElementById(
    "selectedSaleReference",
  );
  const orderBy = document.getElementById("orderBy");
  const orderDirection = document.getElementById("orderDirection");
  const btnPrevious = document.getElementById("btnPrevious");
  const btnNext = document.getElementById("btnNext");
  const searchField = document.getElementById("searchField");
  const searchInput = document.getElementById("searchInput");
  const btnSearch = document.getElementById("btnSearch");
  const btnBackToSales = document.getElementById("btnBackToSales");

  if (selectedSaleReference) {
    selectedSaleReference.textContent = `Sale ID: ${listOptions.saleId || "-"}`;
  }

  if (searchField) {
    searchField.value = listOptions.searchField;
  }

  if (searchInput) {
    searchInput.value = listOptions.search;
  }

  if (orderBy) {
    orderBy.value = listOptions.orderBy;

    orderBy.addEventListener("change", async function () {
      listOptions.orderBy = orderBy.value;
      listOptions.page = 1;

      await loadSalesDetails();
    });
  }

  if (orderDirection) {
    orderDirection.value = listOptions.orderDirection;

    orderDirection.addEventListener("change", async function () {
      listOptions.orderDirection = orderDirection.value;
      listOptions.page = 1;

      await loadSalesDetails();
    });
  }

  if (btnPrevious) {
    btnPrevious.addEventListener("click", async function () {
      if (listOptions.page > 1) {
        listOptions.page--;

        await loadSalesDetails();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", async function () {
      if (!btnNext.disabled) {
        listOptions.page++;

        await loadSalesDetails();
      }
    });
  }

  if (btnSearch) {
    btnSearch.addEventListener("click", async function () {
      listOptions.searchField = searchField.value;
      listOptions.search = searchInput.value.trim();
      listOptions.page = 1;

      await loadSalesDetails();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", async function (event) {
      if (event.key === "Enter") {
        listOptions.searchField = searchField.value;
        listOptions.search = searchInput.value.trim();
        listOptions.page = 1;

        await loadSalesDetails();
      }
    });
  }

  if (btnBackToSales) {
    btnBackToSales.addEventListener("click", async function () {
      await loadView("../views/sales.html", "content");
      const salesModule = await import("./sales.js");
      setCurrentModuleKey("sales");
      await salesModule.initView();
    });
  }

  await loadSalesDetails();
}

async function loadSalesDetails() {
  const data = await fetchRecords("sales_details", listOptions);
  const tableBody = document.getElementById("salesDetailsTableBody");

  if (tableBody) {
    tableBody.innerHTML = "";

    if (data.error) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-4 text-center text-sm text-red-500">
            ${data.error}
          </td>
        </tr>
      `;
      updatePagination({
        page: 1,
        totalPages: 0,
        total: 0,
        limit: listOptions.limit,
      });
      return;
    }

    const salesDetails = data.records;
    const currencyFormatter = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    });

    if (salesDetails.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
            No records found
          </td>
        </tr>
      `;
    } else {
      salesDetails.forEach((item) => {
        const tr = document.createElement("tr");

        const discountValue = parseFloat(item.discount_applied);
        const discountClass =
          discountValue > 0
            ? "text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded"
            : "text-gray-500";

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#${item.id_sale_item}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.product_name || "-"}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${item.quantity}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${currencyFormatter.format(item.unit_price)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="${discountClass}">${currencyFormatter.format(discountValue)}</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
            ${currencyFormatter.format(item.subtotal)}
          </td>
        `;

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
  btnNext.disabled = data.page >= data.totalPages || data.totalPages === 0;

  const start = data.total === 0 ? 0 : (data.page - 1) * data.limit + 1;
  const end = Math.min(data.page * data.limit, data.total);

  paginationSummary.textContent = `Showing ${start} to ${end} of ${data.total} sale details`;
}
