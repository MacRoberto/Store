import {
  deleteRecords,
  updateRecord,
  saveRecords,
  loadRecordDataToForm,
  fetchRecords,
  sendRequest,
} from "./api.js";

import { rowClick, loadView, getSelectedId } from "./function.js";

// Opciones predeterminadas del listado
let listOptions = {
  page: 1,
  limit: 50,
  orderBy: "id_permission",
  orderDirection: "DESC",
  searchField: "all",
  search: "",
};

// Función principal del módulo. Carga la tabla y listeners de botones.
export async function initView() {
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnAdd = document.getElementById("btnAdd");
  const btnGoBack = document.getElementById("goback");

  // Eliminar registro
  if (btnRemove) {
    btnRemove.addEventListener("click", async function () {
      const result = await Swal.fire({
        title: "¿Are you sure to delete this record?",
        text: "You won't be able to revert this action",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        await deleteRecords("roles_permissions", getSelectedId());
        await loadRolesPermissionsView();
      }
    });
  }

  // Editar registro
  if (btnEdit) {
    btnEdit.addEventListener("click", async function () {
      const id = getSelectedId();
      await loadView("../views/forms/roles_permissions.html", "content");
      await initPermissionForm("edit", id);
    });
  }

  // Agregar registro
  if (btnAdd) {
    btnAdd.addEventListener("click", async function () {
      await loadView("../views/forms/roles_permissions.html", "content");
      await initPermissionForm("add");
    });
  }

  // Regresar al listado
  if (btnGoBack) {
    btnGoBack.addEventListener("click", async function (event) {
      event.preventDefault();
      await loadRolesPermissionsView();
    });
  }

  await loadPermissions();
}

// Carga los registros en la tabla
async function loadPermissions() {
  const data = await fetchRecords("roles_permissions", listOptions);
  const tableBody = document.getElementById("permissionsTableBody");

  if (!tableBody) return;

  tableBody.innerHTML = "";

  const permissions = data.records || data;

  permissions.forEach((perm) => {
    const tr = document.createElement("tr");

    const statusBadgeColor =
      perm.status === "Active"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800 border border-red-200";

    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
        #${perm.id_permission}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold uppercase tracking-wide">
        ${perm.role_name || "Rol #" + perm.id_role}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          ${perm.module_name || "Módulo Base"}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">
        ${perm.action_name || "Acción #" + perm.id_action}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm">
        <span class="px-2.5 inline-flex text-xs leading-5 font-bold rounded-full ${statusBadgeColor}">
          ${perm.status}
        </span>
      </td>
    `;

    tr.addEventListener("click", function (event) {
      rowClick(event, perm.id_permission);
    });

    tableBody.appendChild(tr);
  });
}

// Recarga la vista principal del módulo
async function loadRolesPermissionsView() {
  await loadView("../views/roles_permissions.html", "content");
  await initView();
}

// Poblar desplegables de selección dinámicamente desde API
async function fillSelectFromApi(file, selectId) {
  try {
    const data = await sendRequest(file, { action: "selectOptions" });
    const select = document.getElementById(selectId);

    if (!select || !Array.isArray(data)) return;

    const firstOption =
      select.querySelector('option[value=""]')?.outerHTML ||
      '<option value="">Select</option>';

    select.innerHTML = firstOption;

    data.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.id;
      optionElement.textContent = option.name;
      select.appendChild(optionElement);
    });
  } catch (error) {
    console.error(`Error llenando el select ${selectId}:`, error);
  }
}

// Inicializar el formulario para agregar o editar
async function initPermissionForm(mode, id = null) {
  try {
    const form = document.getElementById("itemForm");
    if (!form) return;

    const btnGoBack = document.getElementById("goback");

    // Llenar catálogos antes de cargar datos
    await Promise.all([
      fillSelectFromApi("roles", "id_role"),
      fillSelectFromApi("actions", "id_action"),
    ]);

    // Llenar campos si está en modo edición
    if (mode === "edit" && id) {
      await loadRecordDataToForm("roles_permissions", id, "itemForm");
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const isEdit = mode === "edit";

      const result = await Swal.fire({
        title: isEdit
          ? "¿Are you sure to update this record?"
          : "¿Are you sure to Add record?",
        text: isEdit
          ? "This will overwrite the existing information"
          : "Please confirm that the data is correct",
        icon: isEdit ? "info" : "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: isEdit ? "Yes, update" : "Yes, save",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        if (isEdit) {
          await updateRecord("roles_permissions", form, id);
        } else {
          await saveRecords("roles_permissions", form);
        }
        await loadRolesPermissionsView();
      }
    });

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