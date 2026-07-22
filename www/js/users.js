import {
  deleteRecords,
  updateUsers,
  saveRecords,
  loadRecordDataToForm,
  loadSelectOptions,
  fetchRecords,
} from "./api.js";

import { initView as initViewMain } from "./enviroment.js";
import { rowClick, loadView, getSelectedId } from "./function.js";

export async function initView() {
  const users = await fetchRecords("users");
  const tableBody = document.getElementById("usersTableBody");
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnAdd = document.getElementById("btnAdd");
  const btnGoBack = document.getElementById("goback");

  if (btnRemove) {
    btnRemove.addEventListener("click", async function () {
      Swal.fire({
        title: "¿Estás seguro de eliminar este registro?",
        text: "No podrás revertir esta acción",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deleteRecords("users", getSelectedId());
          await loadUsersView();
        }
      });
    });
  }

  if (btnEdit) {
    btnEdit.addEventListener("click", async function () {
      const id = getSelectedId();
      await loadView("../views/forms/users.html", "content");
      await initUserForm("edit", id);
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener("click", async function () {
      await loadView("../views/forms/users.html", "content");
      await initUserForm("add");
    });
  }

  if (tableBody) {
    users.forEach((user) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${user.username || "-"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.role_name || "-"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.status || "-"}</td>
      `;

      tr.addEventListener("click", function (event) {
        rowClick(event, user.id);
      });

      tableBody.appendChild(tr);
    });
  }

  if (btnGoBack) {
    btnGoBack.addEventListener("click", async function (event) {
      event.preventDefault();
      await initViewMain();
    });
  }
}

async function loadUsersView() {
  await loadView("../views/users.html", "content");
  await initView();
}

async function initUserForm(mode, id = null) {
  try {
    const form = document.getElementById("itemForm");
    const btnGoBack = document.getElementById("goback");

    await loadSelectOptions("roles", "role");

    if (mode === "edit" && id) {
      await loadRecordDataToForm("users", id, "itemForm");
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      try {
        if (mode === "edit") {
          await updateUsers("users", "itemForm", id);
          await loadUsersView();
        } else {
          Swal.fire({
            title: "¿Deseas guardar este registro?",
            text: "Revisa que los datos sean correctos",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, guardar",
            cancelButtonText: "Cancelar",
          }).then(async (result) => {
            if (result.isConfirmed) {
              await saveRecords("users", form);
              await loadUsersView();
            }
          });
        }
      } catch (error) {
        console.error("Error al guardar el usuario:", error);
      }
    });

    if (btnGoBack) {
      btnGoBack.addEventListener("click", async function (event) {
        event.preventDefault();
        await loadUsersView();
      });
    }
  } catch (error) {
    console.error("Error al inicializar el formulario:", error);
  }
}

