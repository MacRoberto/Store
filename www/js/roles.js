import {
  deleteRecords,
  updateRecord,
  saveRecords,
  loadRecordDataToForm,
  fetchRecords,
} from "./api.js";

import { initView as initViewMain } from "./enviroment.js";

import { rowClick, loadView, getSelectedId } from "./function.js";

import { validateForm } from "./validators/validate-form.js";
import { rolesRules } from "./validators/roles-rules.js";

let listOptions = {
  page: 1,
  limit: 50,
  orderBy: "id_rol",
  orderDirection: "DESC",
  searchField: "all",
  search: "",
};

export async function initView() {
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnAdd = document.getElementById("btnAdd");
  const btnGoBack = document.getElementById("goback");
  const orderBy = document.getElementById("orderBy");
  const orderDirection = document.getElementById("orderDirection");
  const btnPrevious = document.getElementById("btnPrevious");
  const btnNext = document.getElementById("btnNext");
  const searchField = document.getElementById("searchField");
  const searchInput = document.getElementById("searchInput");
  const btnSearch = document.getElementById("btnSearch");
  const btnPermissions = document.getElementById("btnPermissions");
  if (searchField) {
    searchField.value = listOptions.searchField;

    searchField.addEventListener("change", async function () {
      listOptions.searchField = searchField.value;
      listOptions.page = 1;

      await loadRoles();
    });
  }

  if (searchInput) {
    searchInput.value = listOptions.search;
  }

  btnRemove.addEventListener("click", async function () {
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
        await deleteRecords("roles", getSelectedId());
        await loadRoleView();
      }
    });
  });

  if (btnEdit) {
    btnEdit.addEventListener("click", async function () {
      const id = getSelectedId();
      await loadView("../views/forms/roles.html", "content");
      await initRoleForm("edit", id);
    });
  }

  if (btnPermissions) {
    btnPermissions.addEventListener("click", async function () {
      await loadView("../views/forms/assign_permissions.html", "content");
      await initAssignPermissionsView();
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener("click", async function () {
      await loadView("../views/forms/roles.html", "content");
      await initRoleForm("add");
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

      await loadRoles();
    });
  }

  if (orderDirection) {
    orderDirection.value = listOptions.orderDirection;

    orderDirection.addEventListener("change", async function () {
      listOptions.orderDirection = orderDirection.value;
      listOptions.page = 1;

      await loadRoles();
    });
  }

  if (btnPrevious) {
    btnPrevious.addEventListener("click", async function () {
      if (listOptions.page > 1) {
        listOptions.page--;

        await loadRoles();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", async function () {
      if (!btnNext.disabled) {
        listOptions.page++;

        await loadRoles();
      }
    });
  }

  if (btnSearch) {
    btnSearch.addEventListener("click", async function () {
      listOptions.searchField = searchField.value;
      listOptions.search = searchInput.value.trim();
      listOptions.page = 1;

      await loadRoles();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", async function (event) {
      if (event.key === "Enter") {
        listOptions.searchField = searchField.value;
        listOptions.search = searchInput.value.trim();
        listOptions.page = 1;

        await loadRoles();
      }
    });
  }

  await loadRoles();
}

async function loadRoles() {
  const data = await fetchRecords("roles", listOptions);
  const tableBody = document.getElementById("rolesTableBody");

  if (tableBody) {
    tableBody.innerHTML = "";

    const roles = data.records;

    roles.forEach((role) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${role.id_rol}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${role.name}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${role.description || "-"}</td>
      `;

      tr.addEventListener("click", function (event) {
        rowClick(event, role.id_rol);
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

  paginationSummary.textContent = `Showing ${start} to ${end} of ${data.total} roles`;
}

async function loadRoleView() {
  await loadView("../views/roles.html", "content");
  await initView();
}

async function initRoleForm(mode, id = null) {
  try {
    const form = document.getElementById("itemForm");
    const btnGoBack = document.getElementById("goback");

    if (mode === "edit" && id) {
      await loadRecordDataToForm("roles", id, "itemForm");
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      // Se valida el formulario utilizando las reglas del módulo Roles.
      const validation = validateForm(form, rolesRules);

      if (!validation.valid) {
        await Swal.fire({
          icon: "warning",
          title: "Validation error",
          text: validation.error.message,
        });

        return;
      }

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
              await updateRecord("roles", form, id);
              await loadRoleView();
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
              await saveRecords("roles", form);
              await loadRoleView();
            }
          });
        }
      } catch (error) {
        console.error("Error al guardar el rol:", error);
      }
    });

    if (btnGoBack) {
      btnGoBack.addEventListener("click", async function (event) {
        event.preventDefault();
        await loadRoleView();
      });
    }
  } catch (error) {
    console.error("Error al inicializar el formulario:", error);
  }
}

async function initAssignPermissionsView() {
  const rolesPermissionModule = await import("./roles_permissions.js");
  const roleId = getSelectedId();
  await rolesPermissionModule.initView(roleId);

  const btnBackToRoles = document.getElementById("btnBackToRoles");

  if (btnBackToRoles) {
    btnBackToRoles.addEventListener("click", async function () {
      await loadRoleView();
    });
  }
}
