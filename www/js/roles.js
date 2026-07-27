import {
  deleteRecords,
  updateRecord,
  saveRecords,
  loadRecordDataToForm,
  fetchRecords,
} from "./api.js";

import { initView as initViewMain } from "./enviroment.js";
import {
  rowClick,
  loadView,
  getSelectedId,
  clearSelection,
} from "./function.js";

// Guarda todos los roles cargados
let allRoles = [];

// Guarda el rol seleccionado
let selectedRole = null;

// Opciones de consulta
let listOptions = {
  page: 1,
  limit: 50,
  orderBy: "id_rol",
  orderDirection: "DESC",
};

// Inicializa la vista de Roles
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

  // Muestra u oculta filtros
  if (filterType) {
    filterType.addEventListener("change", () => {
      if (nameFilterBox) {
        nameFilterBox.classList.toggle("hidden", filterType.value !== "name");
      }

      if (idFilterBox) {
        idFilterBox.classList.toggle("hidden", filterType.value !== "id");
      }

      applyFilters();
    });
  }

  // Filtra por nombre
  if (nameFilter) {
    nameFilter.addEventListener("change", applyFilters);
  }

  // Orden asc / desc
  if (orderDirection) {
    orderDirection.addEventListener("change", applyFilters);
  }

  // Limpia filtros
  if (btnClearFilters) {
   btnClearFilters.addEventListener("click", () => {
  filterType.value = "";
  orderDirection.value = "DESC";

  document.querySelectorAll(".name-checkbox").forEach((checkbox) => {
    checkbox.checked = false;
  });

  nameFilterBox.classList.add("hidden");
  idFilterBox.classList.add("hidden");

  applyFilters();
});
   ;
  }

  // Volver al menú principal
  if (btnBack) {
    btnBack.addEventListener("click", async function (event) {
      event.preventDefault();
      await initViewMain();
    });
  }

  // Eliminar rol
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

  // Editar rol
  if (btnEdit) {
    btnEdit.addEventListener("click", async function (event) {
      event.preventDefault();

      const id = getSelectedId();
      if (!id) return;

      await loadView("../views/forms/roles.html", "content");
      await initRoleForm("edit", id);
    });
  }

  // Agregar rol
  if (btnAdd) {
    btnAdd.addEventListener("click", async function (event) {
      event.preventDefault();

      await loadView("../views/forms/roles.html", "content");
      await initRoleForm("add");
    });
  }

  // Carga inicial
  await loadRoles();
}

// Carga los roles desde la base de datos
async function loadRoles() {
  const data = await fetchRecords("roles", listOptions);

  allRoles = Array.isArray(data?.records)
    ? data.records
    : Array.isArray(data)
      ? data
      : [];

  selectedRole = null;
  clearSelection();

  fillNameFilter();
  applyFilters();
}

// Llena el filtro de nombres
function fillNameFilter() {
  const nameFilter = document.getElementById("nameFilter");
  if (!nameFilter) return;

  nameFilter.innerHTML = "";

  const uniqueNames = [...new Set(allRoles.map((role) => role.name).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  uniqueNames.forEach((name) => {
    const item = document.createElement("label");
    item.className = "flex items-center gap-2 py-1 cursor-pointer";

    item.innerHTML = `
      <input type="checkbox" class="name-checkbox" value="${name}">
      <span class="text-sm text-gray-700">${name}</span>
    `;

    nameFilter.appendChild(item);
  });
}

// Aplica filtro y orden
function applyFilters() {
  const filterType = document.getElementById("filterType")?.value ?? "";
  const direction = document.getElementById("orderDirection")?.value ?? "DESC";
  const selectedNames = Array.from(document.querySelectorAll(".name-checkbox:checked"))
    .map((checkbox) => checkbox.value);

  let roles = [...allRoles];

  if (filterType === "name" && selectedNames.length > 0) {
    roles = roles.filter((role) => selectedNames.includes(role.name));
  }

  if (filterType === "id") {
    roles.sort((a, b) => {
      return direction === "ASC"
        ? Number(a.id_rol) - Number(b.id_rol)
        : Number(b.id_rol) - Number(a.id_rol);
    });
  } else {
    roles.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderTable(roles);
}

// Dibuja la tabla
function renderTable(roles) {
  const tableBody = document.getElementById("rolesTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  roles.forEach((role) => {
    const tr = document.createElement("tr");
    tr.className = "cursor-pointer hover:bg-indigo-50 transition";

    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${role.id_rol}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${role.name || "-"}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${role.description || "-"}</td>
    `;

    tr.addEventListener("click", function (event) {
      selectedRole = role;
      rowClick(event, role.id_rol);
    });

    tableBody.appendChild(tr);
  });
}

// Vuelve a cargar la vista de Roles
async function loadRolesView() {
  await loadView("../views/roles.html", "content");
  await initView();
}

// Inicializa el formulario de agregar o editar
async function initRoleForm(mode, id = null) {
  try {
    const form = document.getElementById("itemForm");
    const btnGoBack = document.getElementById("btnBack");

    // Si es edición, carga los datos
    if (mode === "edit" && id) {
      await loadRecordDataToForm("roles", id, "itemForm");
    }

    // Guarda o actualiza el rol
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