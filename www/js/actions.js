import {
  deleteRecords,
  updateAction,
  saveRecords,
  loadRecordDataToForm,
  loadSelectOptions,
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
          await deleteRecords("actions", getSelectedId());
          await loadActionsView();
        }
      });
    });
  }

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
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${action.id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${action.name}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${action.module_name || "-"}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${action.description || "-"}</td>
      `;

      tr.addEventListener("click", function (event) {
        rowClick(event, action.id);
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

async function loadActionsView() {
  await loadView("../views/actions.html", "content");
  await initView();
}

async function initActionForm(mode, id = null) {
  try {
    const form = document.getElementById("itemForm");
    const btnGoBack = document.getElementById("goback");

    await loadSelectOptions("modules", "module");

    if (mode === "edit" && id) {
      await loadRecordDataToForm("actions", id, "itemForm");
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      try {
        if (mode === "edit") {
          await updateAction("actions", "itemForm", id);
          await loadActionsView();
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
              await saveRecords("actions", form);
              await loadActionsView();
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
        await loadActionsView();
      });
    }
  } catch (error) {
    console.error("Error al inicializar el formulario:", error);
  }
}