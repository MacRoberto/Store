import { rowClick, clearSelection } from "./function.js";

let selectedPermission = null;

// Se ejecuta cuando la página termina de cargar
document.addEventListener("DOMContentLoaded", () => {
  const btnAdd = document.getElementById("btnAdd");
  const btnEdit = document.getElementById("btnEdit");
  const btnRemove = document.getElementById("btnRemove");

  // Carga los permisos en la tabla
  fetchRolesPermissions();

  // Botón para agregar un nuevo permiso
  btnAdd?.addEventListener("click", (event) => {
    event.preventDefault();
    openPermissionForm();
  });

  // Botón para editar el permiso seleccionado
  btnEdit?.addEventListener("click", (event) => {
    event.preventDefault();

    if (!selectedPermission) {
      Swal.fire("Selecciona un permiso primero", "", "warning");
      return;
    }

    openPermissionForm(selectedPermission);
  });

  // Botón para eliminar el permiso seleccionado
  btnRemove?.addEventListener("click", (event) => {
    event.preventDefault();

    if (!selectedPermission) {
      Swal.fire("Selecciona un permiso primero", "", "warning");
      return;
    }

    deletePermission(selectedPermission.id_permission);
  });
});

// Obtiene los permisos registrados y llena la tabla
function fetchRolesPermissions() {
  const tableBody = document.getElementById("permissionsTableBody");
  if (!tableBody) return;

  // Petición al servidor para listar permisos
  fetch("../php/roles_permissions.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "list",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      tableBody.innerHTML = "";

      if (!Array.isArray(data)) {
        console.error(data.msg || data.error || "Error al cargar permisos");
        return;
      }

      // Recorre cada permiso recibido y lo agrega a la tabla
      data.forEach((perm) => {
        const tr = document.createElement("tr");
        

        const statusBadgeColor =
          perm.status === "Active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800 border border-red-200";

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">#${perm.id_permission}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold uppercase tracking-wide">${perm.role_name || "Rol #" + perm.id_role}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${perm.module_name || "Módulo Base"}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">${perm.action_name || "Acción #" + perm.id_action}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2.5 inline-flex text-xs leading-5 font-bold rounded-full ${statusBadgeColor}">
              ${perm.status}
            </span>
          </td>
        `;

        // Permite seleccionar la fila para editar o eliminar
        tr.addEventListener("click", (event) => {
          selectedPermission = perm;
          rowClick(event, perm.id_permission);
        });

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => {
      console.error("Error al obtener la matriz de seguridad:", error);
    });
}

// Muestra el formulario para agregar o editar permisos
async function openPermissionForm(permission = null) {
  const isEdit = !!permission;

  try {
    // Carga las opciones de roles y acciones
    const response = await fetch("../php/roles_permissions.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "selectOptions",
      }),
    });

    const options = await response.json();

    const roles = Array.isArray(options.roles) ? options.roles : [];
    const actions = Array.isArray(options.actions) ? options.actions : [];

    const result = await Swal.fire({
      title: isEdit ? "Editar permiso" : "Agregar permiso",
      html: `
        <select id="swal-role" class="swal2-input">
          <option value="">Selecciona un rol</option>
          ${roles
            .map(
              (role) => `
                <option value="${role.id_rol}" ${
                  permission && Number(permission.id_role) === Number(role.id_rol)
                    ? "selected"
                    : ""
                }>
                  ${escapeHtml(role.name)}
                </option>
              `
            )
            .join("")}
        </select>

        <select id="swal-action" class="swal2-input">
          <option value="">Selecciona una acción</option>
          ${actions
            .map(
              (action) => `
                <option value="${action.id_action}" ${
                  permission && Number(permission.id_action) === Number(action.id_action)
                    ? "selected"
                    : ""
                }>
                  ${escapeHtml(action.action_name || action.name)}
                </option>
              `
            )
            .join("")}
        </select>

        <select id="swal-status" class="swal2-input">
          <option value="Active" ${permission?.status === "Active" ? "selected" : ""}>Active</option>
          <option value="Inactive" ${permission?.status === "Inactive" ? "selected" : ""}>Inactive</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: isEdit ? "Actualizar" : "Guardar",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const id_role = document.getElementById("swal-role").value;
        const id_action = document.getElementById("swal-action").value;
        const status = document.getElementById("swal-status").value;

        if (!id_role) {
          Swal.showValidationMessage("Selecciona un rol");
          return false;
        }

        if (!id_action) {
          Swal.showValidationMessage("Selecciona una acción");
          return false;
        }

        return { id_role, id_action, status };
      },
    });

    if (!result.isConfirmed) return;

    const payload = {
      action: isEdit ? "edit" : "save",
      id_role: result.value.id_role,
      id_action: result.value.id_action,
      status: result.value.status,
    };

    if (isEdit) {
      payload.id_permission = permission.id_permission;
    }

    // Envía los datos al servidor
    const saveResponse = await fetch("../php/roles_permissions.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const saveData = await saveResponse.json();

    if (saveData.status === "error") {
      Swal.fire("Error", saveData.msg || "No se pudo guardar", "error");
      return;
    }

    Swal.fire("Listo", saveData.msg || "Operación realizada", "success");
    selectedPermission = null;
    clearSelection();
    fetchRolesPermissions();
  } catch (error) {
    console.error("Error en el formulario:", error);
  }
}

// Elimina el permiso seleccionado
function deletePermission(id_permission) {
  Swal.fire({
    title: "¿Eliminar este permiso?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (!result.isConfirmed) return;

    fetch("../php/roles_permissions.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "delete",
        id_permission,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "error") {
          Swal.fire("Error", data.msg || "No se pudo eliminar", "error");
          return;
        }

        Swal.fire("Eliminado", data.msg || "Permiso eliminado", "success");
        selectedPermission = null;
        clearSelection();
        fetchRolesPermissions();
      })
      .catch((error) => {
        console.error("Error eliminando permiso:", error);
      });
  });
}

// Escapa caracteres especiales para evitar problemas en HTML
function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}