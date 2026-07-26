import {
  deleteRecords,
  updateRecord,
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
        await deleteRecords("users", getSelectedId());
        await loadUserView();
      }
    });
  });

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

    tableBody.innerHTML = "";

    users.forEach((user) => {
      const tr = document.createElement("tr");

      const statusBadgeColor =
        user.status === "Active"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800";

      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.id_user}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${user.username || "-"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.role_name || "-"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColor}">
            ${user.status}
          </span>
        </td>
        `;

      tr.addEventListener("click", function (event) {
        rowClick(event, user.id_user); 
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

async function loadUserView() {
  await loadView("../views/users.html", "content");
  await initView();
}

async function initUserForm(mode, id = null) {
  try {
    const form = document.getElementById("itemForm");
    const btnGoBack = document.getElementById("goback");

    await loadSelectOptions("roles", "roles");


    if (mode === "edit" && id) {
      await loadRecordDataToForm("users", id, "itemForm");
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
              await updateRecord("users", form, id);
              await loadUserView();
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
              await saveRecords("users", form);
              await loadUserView();
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

        await loadUserView();
      });
    }
  } catch (error) {
    console.error("Error al inicializar el formulario:", error);
  }
}
