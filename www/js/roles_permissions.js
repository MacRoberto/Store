import {
  deleteRecords,
  updateRecord,
  saveRecords,
  loadSelectOptions,
  loadRecordDataToForm,
  fetchRecords,
} from "./api.js";

import { initView as initViewMain } from "./enviroment.js";

import { rowClick, loadView, getSelectedId } from "./function.js";

let listOptions = {
  page: 1,
  limit: 50,
  orderBy: "id_permission", // campo por default por el que se va a ordenar
  orderDirection: "DESC",
  searchField: "all",
  search: "",
};

export async function initView() {
  const tableBody = document.getElementById("permissionsTableBody");
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnAdd = document.getElementById("btnAdd");
  const btnGoBack = document.getElementById("goback");

  const orderBy = document.getElementById("orderBy");
  const orderDirection = document.getElementById("orderDirection");

  const btnPrevious = document.getElementById("btnPrevious");
  const btnNext = document.getElementById("btnNext");

  const currentPage = document.getElementById("currentPage");
  const totalPages = document.getElementById("totalPages");
  const paginationSummary = document.getElementById("paginationSummary");

  const searchField = document.getElementById("searchField");
  const searchInput = document.getElementById("searchInput");
  const btnSearch = document.getElementById("btnSearch");

  if (searchField) {
    searchField.value = listOptions.searchField;
  }

  if (searchInput) {
    searchInput.value = listOptions.search;
  }

  // Detecta cuando el usuario da clic en el botón de eliminar
  if (btnRemove) {
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
          await deleteRecords("roles_permissions", getSelectedId());
          await loadRolesPermissionsView();
        }
      });
    });
  }

  if (btnEdit) {
    btnEdit.addEventListener("click", async function () {
      const id = getSelectedId();
      await loadView("../views/forms/roles_permissions.html", "content");
      await initPermissionForm("edit", id);
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener("click", async function () {
      await loadView("../views/forms/roles_permissions.html", "content");
      await initPermissionForm("add");
    });
  }

  if (btnGoBack) {
    btnGoBack.addEventListener("click", async function (event) {
      event.preventDefault();
      await initViewMain();
    });
  }

  // Sincronización automática de ordenamiento (Sort by)
  if (orderBy) {
    orderBy.value = listOptions.orderBy;

    orderBy.addEventListener("change", async function () {
      listOptions.orderBy = orderBy.value;
      if (orderDirection) listOptions.orderDirection = orderDirection.value;
      if (searchField) listOptions.searchField = searchField.value;
      if (searchInput) listOptions.search = searchInput.value.trim();
      listOptions.page = 1;

      await loadPermissions();
    });
  }

  // Sincronización automática de dirección (Ascending/Descending)
  if (orderDirection) {
    orderDirection.value = listOptions.orderDirection;

    orderDirection.addEventListener("change", async function () {
      listOptions.orderDirection = orderDirection.value;
      if (orderBy) listOptions.orderBy = orderBy.value;
      if (searchField) listOptions.searchField = searchField.value;
      if (searchInput) listOptions.search = searchInput.value.trim();
      listOptions.page = 1;

      await loadPermissions();
    });
  }

  if (btnPrevious) {
    btnPrevious.addEventListener("click", async function () {
      if (listOptions.page > 1) {
        listOptions.page--;
        await loadPermissions();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", async function () {
      if (!btnNext.disabled) {
        listOptions.page++;
        await loadPermissions();
      }
    });
  }

  // Al presionar "Apply", toma tanto la búsqueda como los selects de ordenamiento
  if (btnSearch) {
    btnSearch.addEventListener("click", async function () {
      if (searchField) listOptions.searchField = searchField.value;
      if (searchInput) listOptions.search = searchInput.value.trim();
      if (orderBy) listOptions.orderBy = orderBy.value;
      if (orderDirection) listOptions.orderDirection = orderDirection.value;
      listOptions.page = 1;

      await loadPermissions();
    });
  }

  // Búsqueda con tecla Enter
  if (searchInput) {
    searchInput.addEventListener("keydown", async function (event) {
      if (event.key === "Enter") {
        if (searchField) listOptions.searchField = searchField.value;
        listOptions.search = searchInput.value.trim();
        if (orderBy) listOptions.orderBy = orderBy.value;
        if (orderDirection) listOptions.orderDirection = orderDirection.value;
        listOptions.page = 1;

        await loadPermissions();
      }
    });
  }

  await loadPermissions();
}

async function loadPermissions() {
  const response = await fetchRecords("roles_permissions", listOptions);

  const tableBody = document.getElementById("permissionsTableBody");

  if (tableBody) {
    tableBody.innerHTML = "";

    // Adaptación flexible según la estructura recibida de la API
    const permissions = Array.isArray(response)
      ? response
      : response?.records || [];

    permissions.forEach((perm) => {
      const tr = document.createElement("tr");

      const statusBadgeColor =
        perm.status === "Active"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800";

      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#${perm.id_permission || perm.id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold uppercase">${perm.role_name || perm.role || "Rol #" + (perm.id_role || "")}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${perm.module_name || perm.module || "Módulo Base"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">${perm.action_name || perm.action || "Acción #" + (perm.id_action || "")}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColor}">
            ${perm.status || "Active"}
          </span>
        </td>
      `;

      tr.addEventListener("click", function (event) {
        rowClick(event, perm.id_permission || perm.id);
      });

      tableBody.appendChild(tr);
    });

    updatePagination(response, permissions.length);
  }
}

function updatePagination(data, currentCount = 0) {
  const currentPage = document.getElementById("currentPage");
  const totalPages = document.getElementById("totalPages");
  const paginationSummary = document.getElementById("paginationSummary");
  const btnPrevious = document.getElementById("btnPrevious");
  const btnNext = document.getElementById("btnNext");

  // Normalizar los datos recibidos de la API evitando que sea undefined o NaN
  const page = Number(data?.page) || listOptions.page || 1;
  const limit = Number(data?.limit) || listOptions.limit || 50;
  const total = data?.total !== undefined ? Number(data.total) : currentCount;
  const computedTotalPages = data?.totalPages
    ? Number(data.totalPages)
    : Math.ceil(total / limit) || 1;

  if (currentPage) currentPage.textContent = page;
  if (totalPages) totalPages.textContent = computedTotalPages;

  if (btnPrevious) btnPrevious.disabled = page <= 1;
  if (btnNext) btnNext.disabled = page >= computedTotalPages;

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  if (paginationSummary) {
    paginationSummary.textContent = `Showing ${start} to ${end} of ${total} permissions`;
  }
}

async function loadRolesPermissionsView() {
  await loadView("../views/roles_permissions.html", "content");
  await initView();
}

async function initPermissionForm(mode, id = null) {
  try {
    const form = document.getElementById("itemForm");
    const btnGoBack = document.getElementById("goback");

    // 1. Cargar primero las opciones de los selectores
    await loadSelectOptions("roles", "id_role");
    await loadSelectOptions("actions", "id_action");

    // 2. Si es edición, cargar los datos del registro en el formulario
      if (mode === "edit" && id) {
        await loadRecordDataToForm("roles_permissions", id, "itemForm");
    }

    if (form) {
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
                await updateRecord("roles_permissions", form, id);
                await loadRolesPermissionsView();
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
                await saveRecords("roles_permissions", form);
                await loadRolesPermissionsView();
              }
            });
          }
        } catch (error) {
          console.error("Error al guardar el permiso:", error);
        }
      });
    }

    if (btnGoBack) {
      btnGoBack.addEventListener("click", async function (event) {
        event.preventDefault();
        await loadRolesPermissionsView();
      });
    }
  } catch (error) {
    console.error("Error al inicializar el formulario:", error);
  }
}