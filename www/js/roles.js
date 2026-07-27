import { deleteRecords, fetchRecords } from "./api.js";
import { getSelectedId, rowClick } from "./function.js";
import { initView as loadEnvironment } from "./enviroment.js";

let allRoles = [];

// Se ejecuta cuando se carga esta vista
export async function initView() {
  setupFilterEvents();
  setupActionButtons();
  setupBackButton();
  await loadRoles();
}

function setupBackButton() {
  const btnBack = document.getElementById("btnBack");

  if (!btnBack) return;

  btnBack.addEventListener("click", async (event) => {
    event.preventDefault();
    await loadEnvironment();
  });
}

// Carga los roles desde la base de datos
async function loadRoles() {
  try {
    const data = await fetchRecords("roles");

    if (!Array.isArray(data)) {
      console.error("Respuesta inválida:", data);
      return;
    }

    allRoles = data;

    renderRoleFilter(allRoles);
    applyFilters();
  } catch (error) {
    console.error("Error al cargar roles:", error);
  }
}

// Dibuja la tabla
function renderTable(roles) {
  const tableBody = document.getElementById("rolesTableBody");
  tableBody.innerHTML = "";

  roles.forEach((role) => {
    const tr = document.createElement("tr");
    tr.className = "cursor-pointer hover:bg-indigo-50 transition";

    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${role.id_rol}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">${role.name}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${role.description}</td>
    `;

    tr.addEventListener("click", (event) => {
      rowClick(event, role.id_rol);
    });

    tableBody.appendChild(tr);
  });
}

// Crea los checkboxes con los roles existentes
function renderRoleFilter(roles) {
  const roleFilter = document.getElementById("roleFilter");
  if (!roleFilter) return;

  const uniqueRoles = [...new Set(roles.map((role) => role.name))].sort((a, b) =>
    a.localeCompare(b)
  );

  roleFilter.innerHTML = "";

  uniqueRoles.forEach((roleName) => {
    const safeId = `role-${roleName.replaceAll(" ", "-").replaceAll("/", "-").toLowerCase()}`;

    const item = document.createElement("label");
    item.className = "flex items-center gap-2 py-1 cursor-pointer";

    item.innerHTML = `
      <input type="checkbox" id="${safeId}" value="${roleName}" class="role-checkbox">
      <span class="text-sm text-gray-700">${roleName}</span>
    `;

    roleFilter.appendChild(item);
  });
}

// Obtiene los roles marcados
function getSelectedRoles() {
  return Array.from(document.querySelectorAll(".role-checkbox:checked")).map(
    (checkbox) => checkbox.value
  );
}

// Muestra u oculta los filtros
function setupFilterEvents() {
  const filterType = document.getElementById("filterType");
  const nameFilterBox = document.getElementById("nameFilterBox");
  const idFilterBox = document.getElementById("idFilterBox");
  const idSort = document.getElementById("idSort");
  const btnClearFilter = document.getElementById("btnClearFilter");

  if (!filterType || !nameFilterBox || !idFilterBox || !idSort || !btnClearFilter) return;

  const refreshVisibility = () => {
    nameFilterBox.classList.toggle("hidden", filterType.value !== "name");
    idFilterBox.classList.toggle("hidden", filterType.value !== "id");
  };

  filterType.addEventListener("change", () => {
    refreshVisibility();
    applyFilters();
  });

  document.addEventListener("change", (event) => {
    if (event.target.classList.contains("role-checkbox")) {
      applyFilters();
    }
  });

  idSort.addEventListener("change", () => {
    applyFilters();
  });

  btnClearFilter.addEventListener("click", () => {
    filterType.value = "";
    idSort.value = "ASC";

    document.querySelectorAll(".role-checkbox").forEach((checkbox) => {
      checkbox.checked = false;
    });

    refreshVisibility();
    applyFilters();
  });
}

// Aplica filtros y orden
function applyFilters() {
  const filterType = document.getElementById("filterType")?.value ?? "";
  const selectedRoles = getSelectedRoles();
  const idSort = document.getElementById("idSort")?.value ?? "ASC";

  let filtered = [...allRoles];

  // Filtro por nombre
  if (filterType === "name") {
    if (selectedRoles.length > 0) {
      filtered = filtered.filter((role) => selectedRoles.includes(role.name));
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  // Filtro por ID
  if (filterType === "id") {
    filtered.sort((a, b) => {
      const aId = Number(a.id_rol);
      const bId = Number(b.id_rol);
      return idSort === "DESC" ? bId - aId : aId - bId;
    });
  }

  // Sin filtro, orden por nombre
  if (filterType === "") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderTable(filtered);
}

// Botones de agregar, editar y eliminar
function setupActionButtons() {
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnAdd = document.getElementById("btnAdd");

  if (btnRemove) {
    btnRemove.addEventListener("click", async () => {
      const id = getSelectedId();
      if (!id) return;

      const result = await Swal.fire({
        title: "Delete role?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      try {
        await deleteRecords("roles", id);
        await Swal.fire("Deleted", "The role was deleted successfully.", "success");
        await loadRoles();
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener("click", async () => {
      const result = await Swal.fire({
        title: "Add role",
        html: `
          <input id="swal-role-name" class="swal2-input" placeholder="Role name">
          <textarea id="swal-role-description" class="swal2-textarea" placeholder="Description"></textarea>
        `,
        showCancelButton: true,
        confirmButtonText: "Save",
        cancelButtonText: "Cancel",
        focusConfirm: false,
        preConfirm: () => {
          const name = document.getElementById("swal-role-name").value.trim();
          const description = document.getElementById("swal-role-description").value.trim();

          if (!name) {
            Swal.showValidationMessage("The role name is required");
            return false;
          }

          return { name, description };
        },
      });

      if (!result.isConfirmed) return;

      try {
        const response = await fetch("../php/roles.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "save",
            name: result.value.name,
            description: result.value.description,
          }),
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        await Swal.fire("Saved", "The role was added successfully.", "success");
        await loadRoles();
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    });
  }

  if (btnEdit) {
    btnEdit.addEventListener("click", async () => {
      const id = getSelectedId();
      if (!id) return;

      try {
        const role = await getRoleById(id);

        const result = await Swal.fire({
          title: "Edit role",
          html: `
            <input id="swal-role-name" class="swal2-input" placeholder="Role name" value="${escapeHtml(role.name)}">
            <textarea id="swal-role-description" class="swal2-textarea" placeholder="Description">${escapeHtml(role.description)}</textarea>
          `,
          showCancelButton: true,
          confirmButtonText: "Update",
          cancelButtonText: "Cancel",
          focusConfirm: false,
          preConfirm: () => {
            const name = document.getElementById("swal-role-name").value.trim();
            const description = document.getElementById("swal-role-description").value.trim();

            if (!name) {
              Swal.showValidationMessage("The role name is required");
              return false;
            }

            return { name, description };
          },
        });

        if (!result.isConfirmed) return;

        const response = await fetch("../php/roles.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "update",
            id,
            name: result.value.name,
            description: result.value.description,
          }),
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        await Swal.fire("Updated", "The role was updated successfully.", "success");
        await loadRoles();
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    });
  }
}

// Obtiene un rol por ID
async function getRoleById(id) {
  const response = await fetch("../php/roles.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "getInfoByID",
      id,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

// Evita problemas con comillas en SweetAlert
function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}