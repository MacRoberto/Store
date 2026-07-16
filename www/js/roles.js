import { rowClick, clearSelection } from "./function.js";

let selectedRole = null;

// Se cargan los roles al abrir la página
document.addEventListener("DOMContentLoaded", () => {
  const btnAdd = document.getElementById("btnAdd");
  const btnEdit = document.getElementById("btnEdit");
  const btnRemove = document.getElementById("btnRemove");

  // Botón agregar
  btnAdd?.addEventListener("click", (event) => {
    event.preventDefault();
    openRoleForm("save");
  });

  // Botón editar
  btnEdit?.addEventListener("click", (event) => {
    event.preventDefault();

    if (!selectedRole) {
      Swal.fire("Selecciona un rol primero", "", "warning");
      return;
    }

    openRoleForm("edit", selectedRole);
  });

  // Botón eliminar
  btnRemove?.addEventListener("click", (event) => {
    event.preventDefault();

    if (!selectedRole) {
      Swal.fire("Selecciona un rol primero", "", "warning");
      return;
    }

    deleteRole(selectedRole.id_rol);
  });

  fetchRoles();
});

// Se obtienen y pintan los roles en la tabla
function fetchRoles() {
  const tableBody = document.getElementById("rolesTableBody");
  if (!tableBody) return;

  fetch("../php/roles.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "list" }),
  })
    .then((response) => response.json())
    .then((data) => {
      tableBody.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }

      data.forEach((role) => {
        const tr = document.createElement("tr");
        tr.className = "cursor-pointer";

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${role.id_rol}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">${role.name}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${role.description}</td>
        `;

        tr.addEventListener("click", (event) => {
          selectedRole = role;
          rowClick(event, role.id_rol);
        });

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error al obtener los roles:", error));
}

// Se muestra el formulario para guardar o editar
function openRoleForm(action, role = null) {
  const isEdit = action === "edit";

  Swal.fire({
    title: isEdit ? "Editar rol" : "Agregar rol",
    html: `
      <input id="swal-role-name" class="swal2-input" placeholder="Nombre" value="${escapeHtml(role?.name ?? "")}">
      <textarea id="swal-role-description" class="swal2-textarea" placeholder="Descripción">${escapeHtml(role?.description ?? "")}</textarea>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: isEdit ? "Actualizar" : "Guardar",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const name = document.getElementById("swal-role-name").value.trim();
      const description = document.getElementById("swal-role-description").value.trim();

      if (!name) {
        Swal.showValidationMessage("El nombre es obligatorio");
        return false;
      }

      return { name, description };
    },
  }).then((result) => {
    if (!result.isConfirmed) return;

    const payload = {
      action: isEdit ? "edit" : "save",
      name: result.value.name,
      description: result.value.description,
    };

    if (isEdit) {
      payload.id = role.id_rol;
    }

    fetch("../php/roles.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "error") {
          Swal.fire("Error", data.msg || "Ocurrió un error", "error");
          return;
        }

        Swal.fire("Listo", data.msg || "Operación realizada", "success");
        selectedRole = null;
        clearSelection();
        fetchRoles();
      })
      .catch((error) => console.error("Error guardando rol:", error));
  });
}

// Se elimina el rol seleccionado
function deleteRole(id) {
  Swal.fire({
    title: "¿Eliminar este rol?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (!result.isConfirmed) return;

    fetch("../php/roles.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete",
        id: id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "error") {
          Swal.fire("Error", data.msg || "No se pudo eliminar", "error");
          return;
        }

        Swal.fire("Eliminado", data.msg || "Rol eliminado", "success");
        selectedRole = null;
        clearSelection();
        fetchRoles();
      })
      .catch((error) => console.error("Error eliminando rol:", error));
  });
}

// Se escapan caracteres para evitar problemas en el input
function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
