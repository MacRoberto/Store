import {
  deleteRecords,
  updateRecord,
  saveRecords,
  loadSelectOptions,
  loadRecordDataToForm,
  fetchRecords,
} from "./api.js";

import { initView as initViewMain } from "./enviroment.js";

import { rowClick, loadView, getSelectedId } from "./function.js";

export async function initView() {
  const actions = await fetchRecords("actions");
  const tableBody = document.getElementById("actionsTableBody");
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
        await deleteRecords("actions", getSelectedId());
        await loadActionView();
      }
    });
  });

  if (btnEdit) {
    btnEdit.addEventListener("click", async function () {
      const id = getSelectedId();
      await loadView("../views/forms/actions.html", "content");
      await initActionForm("edit", id);
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener("click", async function () {
      await loadView("../views/forms/actions.html", "content");
      await initActionForm("add");
    });
  }

  if (tableBody) {
    actions.forEach((action) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${action.id_action}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${action.action_name}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${action.module_name || "-"}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${action.description || "-"}</td>
      `;

      tr.addEventListener("click", function (event) {
        rowClick(event, action.id_action); 
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

async function loadActionView() {
  await loadView("../views/actions.html", "content");
  await initView();
}

async function initActionForm(mode, id = null) {
  try {
    const form = document.getElementById("itemForm");
    const btnGoBack = document.getElementById("goback");

    await loadSelectOptions("modules", "module")

    if (mode === "edit" && id) {
      await loadRecordDataToForm("actions", id, "itemForm");
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
              await updateRecord("actions", form, id);
              await loadActionView();
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
              await saveRecords("actions", form);
              await loadActionView();
            }
          });
        }
      } catch (error) {
        console.error("Error al guardar la accion:", error);
      }
    });

    if (btnGoBack) {
      btnGoBack.addEventListener("click", async function (event) {
        event.preventDefault();

        await loadActionView();
      });
    }
  } catch (error) {
    console.error("Error al inicializar el formulario:", error);
  }
}
