// roles.js
import { fetchRecords } from "./api.js";
import { rowClick, clearSelection, getSelectedId } from "./function.js";

console.log("roles.js cargó correctamente");

// Se inicializa la vista de roles
document.addEventListener("DOMContentLoaded", initView);

export async function initView() {
  const btnAdd = document.getElementById("btnAdd");
  const btnEdit = document.getElementById("btnEdit");
  const btnRemove = document.getElementById("btnRemove");
  const tableBody = document.getElementById("rolesTableBody");

  // Se configura el botón agregar
  if (btnAdd) {
    btnAdd.addEventListener("click", async (event) => {
      event.preventDefault();
      clearSelection();
      await openRoleModal("save");
    });
  }

  // Se configura el botón editar
  if (btnEdit) {
    btnEdit.addEventListener("click", async (event) => {
      event.preventDefault();

      const id = getSelectedId();
      if (!id) {
        Swal.fire("Selecciona un rol primero", "", "warning");
        return;
      }

      await openRoleModal("update", id);
    });
  }

  // Se configura el botón eliminar
  if (btnRemove) {
    btnRemove.addEventListener("click", async (event) => {
      event.preventDefault();

      const id = getSelectedId();
      if (!id) {
        Swal.fire("Selecciona un rol primero", "", "warning");
        return;
      }

      await confirmDelete(id);
    });
  }

  await loadRoles(tableBody);
}

// Se cargan los roles en la tabla
async function loadRoles(tableBody) {
  const roles = await fetchRecords("roles");

  if (!tableBody) return;

  tableBody.innerHTML = "";

  roles.forEach((role) => {
    const tr = document.createElement("tr");
    tr.classList.add("cursor-pointer");

    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${role.id_rol}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${role.name}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${role.description || "-"}</td>
    `;

    tr.addEventListener("click", (event) => {
      rowClick(event, role.id_rol);
    });

    tableBody.appendChild(tr);
  });
}

// Se abre el cuadro para agregar o editar
async function openRoleModal(mode, id = null) {
  let roleData = {
    name: "",
    description: "",
  };

  // Se recupera la información si se va a editar
  if (mode === "update" && id) {
    const response = await fetch("../php/roles.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "getInfoByID",
        id: id,
      }),
    });

    roleData = await response.json();
  }

  const result = await Swal.fire({
    title: mode === "update" ? "Editar rol" : "Agregar rol",
    html: `
      <input id="swal-role-name" class="swal2-input" placeholder="Name" value="${escapeHtml(roleData.name || "")}">
      <textarea id="swal-role-description" class="swal2-textarea" placeholder="Description">${escapeHtml(roleData.description || "")}</textarea>
    `,
    showCancelButton: true,
    confirmButtonText: mode === "update" ? "Actualizar" : "Guardar",
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    preConfirm: () => {
      const name = document.getElementById("swal-role-name").value.trim();
      const description = document
        .getElementById("swal-role-description")
        .value.trim();

      if (!name) {
        Swal.showValidationMessage("El nombre es obligatorio");
        return false;
      }

      return { name, description };
    },
  });

  if (!result.isConfirmed) return;

  const payload = {
    action: mode === "update" ? "update" : "save",
    name: result.value.name,
    description: result.value.description,
  };

  if (mode === "update") {
    payload.id = id;
  }

  const response = await fetch("../php/roles.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (data.status === "error") {
    Swal.fire("Error", data.msg || "No se pudo guardar", "error");
    return;
  }

  Swal.fire("Listo", data.msg || "Operación realizada", "success");
  clearSelection();
  await initView();
}

// Se confirma la eliminación
async function confirmDelete(id) {
  const result = await Swal.fire({
    title: "¿Eliminar este rol?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) return;

  const response = await fetch("../php/roles.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "delete",
      id: id,
    }),
  });

  const data = await response.json();

  if (data.status === "error") {
    Swal.fire("Error", data.msg || "No se pudo eliminar", "error");
    return;
  }

  Swal.fire("Eliminado", data.msg || "Rol eliminado", "success");
  clearSelection();
  await initView();
}

// Se escapan caracteres para el modal
function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}