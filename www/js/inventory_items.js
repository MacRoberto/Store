import { fetchRecords } from "./api.js";
import { loadView } from "./function.js";

let listOptions = {
  inventoryId: 0,
  page: 1,
  limit: 50,
  orderBy: "id_inventory_item",
  orderDirection: "DESC",
  searchField: "all",
  search: "",
};

export async function initView(inventoryId) {
  listOptions.inventoryId = Number(inventoryId) || 0;
  listOptions.page = 1;

  const selectedInventoryReference = document.getElementById(
    "selectedInventoryReference",
  );
  const orderBy = document.getElementById("orderBy");
  const orderDirection = document.getElementById("orderDirection");
  const btnPrevious = document.getElementById("btnPrevious");
  const btnNext = document.getElementById("btnNext");
  const searchField = document.getElementById("searchField");
  const searchInput = document.getElementById("searchInput");
  const btnSearch = document.getElementById("btnSearch");
  const btnBackToInventory = document.getElementById("btnGoback");

  if (selectedInventoryReference) {
    selectedInventoryReference.textContent = `Inventory ID: ${listOptions.inventoryId || "-"}`;
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

      await loadInventoryDetails();
    });
  }

  if (orderDirection) {
    orderDirection.value = listOptions.orderDirection;

    orderDirection.addEventListener("change", async function () {
      listOptions.orderDirection = orderDirection.value;
      listOptions.page = 1;

      await loadInventoryDetails();
    });
  }

  if (btnPrevious) {
    btnPrevious.addEventListener("click", async function () {
      if (listOptions.page > 1) {
        listOptions.page--;

        await loadInventoryDetails();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", async function () {
      if (!btnNext.disabled) {
        listOptions.page++;

        await loadInventoryDetails();
      }
    });
  }

  if (btnSearch) {
    btnSearch.addEventListener("click", async function () {
      listOptions.searchField = searchField.value;
      listOptions.search = searchInput.value.trim();
      listOptions.page = 1;

      await loadInventoryDetails();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", async function (event) {
      if (event.key === "Enter") {
        listOptions.searchField = searchField.value;
        listOptions.search = searchInput.value.trim();
        listOptions.page = 1;

        await loadInventoryDetails();
      }
    });
  }

  if (btnBackToInventory) {
    btnBackToInventory.addEventListener("click", async function () {
      await loadView("../views/inventories.html", "content");
      const inventoriesModule = await import("./inventories.js");
      await inventoriesModule.initView();
    });
  }

  await loadInventoryDetails();
}

async function loadInventoryDetails() {
  const data = await fetchRecords("inventory_items", listOptions);
  const tableBody = document.getElementById("inventoryItemsTableBody");

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

    const inventoryDetails = data.records;
    const currencyFormatter = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    });

    if (inventoryDetails.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
            No records found
          </td>
        </tr>
      `;
    } else {
      inventoryDetails.forEach((item) => {
        const tr = document.createElement("tr");

        // Configuración de Badge de Estado
        const statusBadgeColor =
          item.status === "Active"
            ? "bg-green-100 text-green-800"
            : "bg-amber-100 text-amber-800";

        // Formateador de moneda regional nativo de JS
        const formatter = new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        });

        // Alerta visual si las existencias disponibles bajan a 0
        const isDepleted = parseInt(item.quantity_available) <= 0;
        const availableStockClass = isDepleted
          ? "text-red-600 font-bold bg-red-50 px-2 py-1 rounded"
          : "text-gray-900";

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.id_inventory_item}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${item.product_name || "ID Producto: " + item.product_id}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${"Almacén #" + item.id_inventory}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${formatter.format(item.cost_price)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">${formatter.format(item.sale_price)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.quantity_received}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="${availableStockClass}">${item.quantity_available}</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColor}">
              ${isDepleted ? "Depleted" : item.status}
            </span>
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

  paginationSummary.textContent = `Showing ${start} to ${end} of ${data.total} inventory details`;
}
