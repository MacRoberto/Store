import {
  deleteRecords,
  updateRecord,
  saveRecords,
  loadRecordDataToForm,
  fetchRecords,
} from "./api.js";

import { initView as initViewMain } from "./enviroment.js";

import { rowClick, loadView, getSelectedId } from "./function.js";

let listOptions = {
  page: 1,
  limit: 50,
  orderBy: "id_inv",
  orderDirection: "DESC",
  searchField: "all",
  search: "",
};

export async function initView() {
  const btnAdd = document.getElementById("btnAdd");
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

    searchField.addEventListener("change", async function () {
      listOptions.searchField = searchField.value;
      listOptions.page = 1;

      await loadInventories();
    });
  }

  if (searchInput) {
    searchInput.value = listOptions.search;
  }

  if (btnAdd) {
    btnAdd.addEventListener("click", async function () {
      await loadView("../views/forms/inventory.html", "content");
      const inventoryModule = await import("./inventory.js");
      await inventoryModule.initView();
    });
  }

  if (btnDetail) {
    btnDetail.addEventListener("click", async function () {
      const inventoryId = getSelectedId();
      await loadView("../views/inventory_items.html", "content");
      const inventoryItemsModule = await import("./inventory_items.js");
      await inventoryItemsModule.initView(inventoryId);
    });
  }

  if (orderBy) {
    orderBy.value = listOptions.orderBy;

    orderBy.addEventListener("change", async function () {
      listOptions.orderBy = orderBy.value;
      listOptions.page = 1;

      await loadInventory();
    });
  }

  if (orderDirection) {
    orderDirection.value = listOptions.orderDirection;

    orderDirection.addEventListener("change", async function () {
      listOptions.orderDirection = orderDirection.value;
      listOptions.page = 1;

      await loadInventory();
    });
  }

  if (btnPrevious) {
    btnPrevious.addEventListener("click", async function () {
      if (listOptions.page > 1) {
        listOptions.page--;

        await loadInventory();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", async function () {
      if (!btnNext.disabled) {
        listOptions.page++;

        await loadInventory();
      }
    });
  }

  if (btnSearch) {
    btnSearch.addEventListener("click", async function () {
      listOptions.searchField = searchField.value;
      listOptions.search = searchInput.value.trim();
      listOptions.page = 1;

      await loadInventory();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", async function (event) {
      if (event.key === "Enter") {
        listOptions.searchField = searchField.value;
        listOptions.search = searchInput.value.trim();
        listOptions.page = 1;

        await loadInventory();
      }
    });
  }

  await loadInventory();
}

async function loadInventory() {
  const data = await fetchRecords("inventories", listOptions);
  const tableBody = document.getElementById("inventoriesTableBody");

  if (tableBody) {
    tableBody.innerHTML = "";

    const Inventory = data.records;

    Inventory.forEach((Inventory) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${Inventory.id_inventory}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Inventory.arrival_date}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Inventory.username}</td>
      `;

      tr.addEventListener("click", function (event) {
        rowClick(event, Inventory.id_inventory);
      });

      tableBody.appendChild(tr);
    });

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

  paginationSummary.textContent = `Showing ${start} to ${end} of ${data.total} Inventory`;
}
