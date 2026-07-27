import {
  deleteRecords,
  updateRecord,
  saveRecords,
  loadRecordDataToForm,
  fetchRecords,
} from "./api.js";

import { initView as initViewMain } from "./enviroment.js";
import { rowClick, loadView, getSelectedId } from "./function.js";

// Filtros del listado
let listOptions = {
  filterType: "",
  filterValues: [],
  orderDirection: "DESC",
  search: "",
};

// Guarda el rol seleccionado
let selectedRole = null;

// Inicializa la vista
export async function initView() {
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnAdd = document.getElementById("btnAdd");
  const btnBack = document.getElementById("btnBack");

  const filterType = document.getElementById("filterType");
  const nameFilterBox = document.getElementById("nameFilterBox");
  const idFilterBox = document.getElementById("idFilterBox");
  const nameFilter = document.getElementById("nameFilter");
  const orderDirection = document.getElementById("orderDirection");
  const btnClearFilters = document.getElementById("btnClearFilters");
  const searchRole = document.getElementById("searchRole");

  // Buscador
  if (searchRole) {
    searchRole.addEventListener("input", async function () {
      listOptions.search = searchRole.value.trim();
      await loadRoles();
    });
  }

  // Muestra u oculta filtros
  if (filterType) {
    filterType.value = listOptions.filterType;

    filterType.addEventListener("change", async function () {
      listOptions.filterType = filterType.value;

      if (listOptions.filterType !== "name") {
        listOptions.filterValues = [];

        if (nameFilter) {
          Array.from(
            nameFilter.querySelectorAll('input[type="checkbox"]')
          ).forEach((checkbox) => {
            checkbox.checked = false;
          });
        }
      }

      if (nameFilterBox) {
        nameFilterBox.classList.toggle("hidden", filterType.value !== "name");
      }

      if (idFilterBox) {
        idFilterBox.classList.toggle("hidden", filterType.value !== "id");
      }

      await loadRoles();
    });
  }

  // Selección de nombres
  if (nameFilter) {
    nameFilter.addEventListener("change", async function (event) {
      if (!(event.target instanceof HTMLInputElement)) return;
      if (event.target.type !== "checkbox") return;

      listOptions.filterType = "name";
      if (filterType) filterType.value = "name";

      listOptions.filterValues = Array.from(
        nameFilter.querySelectorAll('input[type="checkbox"]:checked')
      ).map((checkbox) => checkbox.value);

      await loadRoles();
    });
  }

  // Orden asc / desc
  if (orderDirection) {
    orderDirection.value = listOptions.orderDirection;

    orderDirection.addEventListener("change", async function () {
      listOptions.orderDirection = orderDirection.value;
      await loadRoles();
    });
  }

  // Limpia filtros
  if (btnClearFilters) {
    btnClearFilters.addEventListener("click", async function () {
      listOptions.filterType = "";
      listOptions.filterValues = [];
      listOptions.orderDirection = "DESC";
      listOptions.search = "";

      if (searchRole) {
        searchRole.value = "";
      }

      if (filterType) filterType.value = "";
      if (orderDirection) orderDirection.value = "DESC";

      if (nameFilterBox) nameFilterBox.classList.add("hidden");
      if (idFilterBox) idFilterBox.classList.add("hidden");

      Array.from(
        nameFilter?.querySelectorAll('input[type="checkbox"]') ?? []
      ).forEach((checkbox) => {
        checkbox.checked = false;
      });

      await loadRoles();
    });
  }

  // Volver al menú principal
  if (btnBack) {
    btnBack.addEventListener("click", async function (event) {
      event.preventDefault();
      await initViewMain();
    });
  }

  // Eliminar
  if (btnRemove) {
    btnRemove.addEventListener("click", async function (event) {
      event.preventDefault();

      const id = getSelectedId();
      if (!id) return;

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
          await deleteRecords("roles", id);
          await loadRoles();
        }
      });
    });
  }

  // Editar
  if (btnEdit) {
    btnEdit.addEventListener("click", async function (event) {
      event.preventDefault();

      const id = getSelectedId();
      if (!id) return;

      await loadView("../views/forms/roles.html", "content");
      await initRoleForm("edit", id);
    });
  }

  // Agregar
  if (btnAdd) {
    btnAdd.addEventListener("click", async function (event) {
      event.preventDefault();

      await loadView("../views/forms/roles.html", "content");
      await initRoleForm("add");
    });
  }

  // Carga opciones y tabla
  await loadNameFilterOptions();
  await loadRoles();
}

// Carga las opciones de nombres
async function loadNameFilterOptions() {
  const nameFilter = document.getElementById("nameFilter");
  if (!nameFilter) return;

  const data = await fetchRecords("roles", {
    filterType: "",
    filterValues: [],
    orderDirection: "ASC",
    search: "",
  });

  const roles = Array.isArray(data?.records)
    ? data.records
    : Array.isArray(data)
      ? data
      : [];

  const uniqueNames = [...new Set(roles.map((role) => role.name).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  nameFilter.innerHTML = "";

  uniqueNames.forEach((name) => {
    const label = document.createElement("label");
    label.className = "flex items-center gap-2 py-1 cursor-pointer";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = name;

    const text = document.createElement("span");
    text.className = "text-sm text-gray-700";
    text.textContent = name;

    label.appendChild(checkbox);
    label.appendChild(text);
    nameFilter.appendChild(label);
  });
}

// Carga la tabla
async function loadRoles() {
  const data = await fetchRecords("roles", listOptions);
  const tableBody = document.getElementById("rolesTableBody");
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");

  if (btnRemove) btnRemove.classList.add("hidden");
  if (btnEdit) btnEdit.classList.add("hidden");

  if (!tableBody) return;

  tableBody.innerHTML = "";

  const roles = Array.isArray(data?.records)
    ? data.records
    : Array.isArray(data)
      ? data
      : [];

  roles.forEach((role) => {
    const tr = document.createElement("tr");
    tr.className = "cursor-pointer hover:bg-indigo-50 transition";

    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${role.id_rol}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${role.name || "-"}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${role.description || "-"}</td>
    `;

    tr.addEventListener("click", function (event) {
      rowClick(event, role.id_rol);
    });

    tableBody.appendChild(tr);
  });
}

// Vuelve a cargar la vista
async function loadRolesView() {
  await loadView("../views/roles.html", "content");
  await initView();
}

// Inicializa el formulario
async function initRoleForm(mode, id = null) {
  try {
    const form = document.getElementById("itemForm");
    const btnGoBack = document.getElementById("btnBack") || document.getElementById("goback");

    // Carga datos al editar
    if (mode === "edit" && id) {
      await loadRecordDataToForm("roles", id, "itemForm");
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
              await updateRecord("roles", form, id);
              await loadRolesView();
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
              await loadRolesView();
            }
          });
        }
      } catch (error) {
        console.error("Error al guardar el rol:", error);
      }
    });

    // Regresa al listado
    if (btnGoBack) {
      btnGoBack.addEventListener("click", async function (event) {
        event.preventDefault();
        await loadRolesView();
      });
    }
  } catch (error) {
    console.error("Error al inicializar el formulario:", error);
  }
}