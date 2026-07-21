import {
  deleteRecords,
  updateCategories,
  saveRecords,
  loadRecordDataToForm,
  fetchRecords,
} from "./api.js";

import { initView as initViewMain } from "./enviroment.js";
import { rowClick, loadView, getSelectedId } from "./function.js";

export async function initView() {
  const categories = await fetchRecords("categories");
  const tableBody = document.getElementById("categoriesTableBody");
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
          await deleteRecords("categories", getSelectedId());
          await loadCategoriesView();
        }
      });
    });
  }

  if (btnEdit) {
    btnEdit.addEventListener("click", async function () {
      const id = getSelectedId();
      await loadView("../views/forms/categories.html", "content");
      await initCategoryForm("edit", id);
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener("click", async function () {
      await loadView("../views/forms/categories.html", "content");
      await initCategoryForm("add");
    });
  }

  if (tableBody) {
    categories.forEach((category) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${category.id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${category.name}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${category.description || "-"}</td>
      `;

      tr.addEventListener("click", function (event) {
        rowClick(event, category.id);
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

async function loadCategoriesView() {
  await loadView("../views/categories.html", "content");
  await initView();
}

async function initCategoryForm(mode, id = null) {
  try {
    const form = document.getElementById("itemForm");
    const btnGoBack = document.getElementById("goback");

    if (mode === "edit" && id) {
      await loadRecordDataToForm("categories", id, "itemForm");
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      try {
        if (mode === "edit") {
          await updateCategories("categories", "itemForm", id);
          await loadCategoriesView();
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
              await saveRecords("categories", form);
              await loadCategoriesView();
            }
          });
        }
      } catch (error) {
        console.error("Error al guardar la categoría:", error);
      }
    });

    if (btnGoBack) {
      btnGoBack.addEventListener("click", async function (event) {
        event.preventDefault();
        await loadCategoriesView();
      });
    }
  } catch (error) {
    console.error("Error al inicializar el formulario:", error);
  }
}