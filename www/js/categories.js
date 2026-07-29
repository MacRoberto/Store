import {
  deleteRecords,
  updateRecord,
  saveRecords,
  loadRecordDataToForm,
  fetchRecords,
} from "./api.js";

let listOptions = {
  orderBy: "id", //campo por default por el que se va a ordenar
  orderDirection: "DESC",
  searchField: "all",
  search: "",
};

import { initView as initViewMain } from "./enviroment.js";

import { rowClick, loadView, getSelectedId } from "./function.js";

export async function initView() {
  const tableBody = document.getElementById("categoriesTableBody");
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnAdd = document.getElementById("btnAdd");
  const btnGoBack = document.getElementById("goback");

  const orderBy = document.getElementById("orderBy");
  const orderDirection = document.getElementById("orderDirection");

  const searchField = document.getElementById("searchField");
  const searchInput = document.getElementById("searchInput");
  const btnSearch = document.getElementById("btnSearch");

  if (searchField) {
    searchField.value = listOptions.searchField;
  }

  if (searchInput) {
    searchInput.value = listOptions.search;
  }

  btnRemove.addEventListener("click", async function (event) {
    Swal.fire({
      title: "¿Are you sure to delete this record?",
      text: "You won't be able to revert this action",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteRecords("categories", getSelectedId());
        await loadCategoryView();
      }
    });
  });

  if (btnEdit) {
    btnEdit.addEventListener("click", async function () {
      const id = getSelectedId();
      await loadView("../views/forms/categories.html", "content");
      await initCategoryForm("edit", id);
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener("click", async function () {
      await loadView("../views/forms/categories.html", "content");
      await initCategoryForm("add");
    });
  }

  if (btnGoBack) {
    btnGoBack.addEventListener("click", async function (event) {
      event.preventDefault();

      await initViewMain();
    });
  }

  if (orderBy) {
    orderBy.value = listOptions.orderBy;

    orderBy.addEventListener("change", async function () {
      listOptions.orderBy = orderBy.value;
      listOptions.page = 1;

      await loadCategories();
    });
  }

  if (orderDirection) {
    orderDirection.value = listOptions.orderDirection;

    orderDirection.addEventListener("change", async function () {
      listOptions.orderDirection = orderDirection.value;
      listOptions.page = 1;

      await loadCategories();
    });

  }

  if (btnSearch) {
    btnSearch.addEventListener("click", async function () {
      listOptions.searchField = searchField.value;
      listOptions.search = searchInput.value.trim();
      listOptions.page = 1;

      await loadCategories();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", async function (event) {
      if (event.key === "Enter") {
        listOptions.searchField = searchField.value;
        listOptions.search = searchInput.value.trim();
        listOptions.page = 1;

        await loadCategories();
      }
    });
  }

  await loadCategories();
}

async function loadCategories() {
  const data = await fetchRecords("categories", listOptions);

  const tableBody = document.getElementById("categoriesTableBody");

  if (tableBody) {
    // Limpiar la tabla antes de volver a pintar los registros.
    tableBody.innerHTML = "";
    const categories = data.records || [];

    categories.forEach((category) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${category.id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${category.name}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${category.description}</td>
      `;

      tr.addEventListener("click", function (event) {
        rowClick(event, category.id);
      });

      tableBody.appendChild(tr);
    });

  }
}

async function loadCategoryView() {
  await loadView("../views/categories.html", "content");
  await initView();
}

async function initCategoryForm(mode, id = null) {
  try {
    const form = document.getElementById("itemForm");
    const btnGoBack = document.getElementById("goback");

    if (mode === "edit" && id) {
      await loadRecordDataToForm("categories", id, "itemForm");
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      try {
        if (mode === "edit") {
          Swal.fire({
            title: "¿Are you sure to update this record?",
            text: "This will overwrite the existing information",
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update",
            cancelButtonText: "Cancel",
          }).then(async (result) => {
            if (result.isConfirmed) {
              await updateRecord("categories", form, id);
              await loadCategoryView();
            }
          });
        } else {
          Swal.fire({
            title: "¿Are you sure to Add record?",
            text: "Please confirm that the data is correct",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, save",
            cancelButtonText: "Cancel",
          }).then(async (result) => {
            if (result.isConfirmed) {
              await saveRecords("categories", form);
              await loadCategoryView();
            }
          });
        }
      } catch (error) {
        console.error("Error al guardar la categoria:", error);
      }
    });

    if (btnGoBack) {
      btnGoBack.addEventListener("click", async function (event) {
        event.preventDefault();

        await loadCategoryView();
      });
    }
  } catch (error) {
    console.error("Error al inicializar el formulario:", error);
  }
}

