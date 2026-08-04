import {
  updateRecord,
  saveRecords,
  loadRecordDataToForm,
  fetchRecords,
  sendRequest,
} from "./api.js";

import { initView as initViewMain } from "./enviroment.js";

import { rowClick, loadView, getSelectedId } from "./function.js";
import { validateForm } from "./validators/validate-form.js";
import { modulesRules } from "./validators/rules/modules-rules.js";

let listOptions = {
  page: 1,
  limit: 50,
  orderBy: "id_module",
  orderDirection: "DESC",
  searchField: "all",
  search: "",
};

export async function initView() {
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnAdd = document.getElementById("btnAdd");
  const btnGoBack = document.getElementById("goback");
  const orderBy = document.getElementById("orderBy");
  const orderDirection = document.getElementById("orderDirection");
  const btnPrevious = document.getElementById("btnPrevious");
  const btnNext = document.getElementById("btnNext");
  const searchField = document.getElementById("searchField");
  const searchInput = document.getElementById("searchInput");
  const btnSearch = document.getElementById("btnSearch");
  const btnActions = document.getElementById("btnActions");

  if (searchField) {
    searchField.value = listOptions.searchField;

    searchField.addEventListener("change", async function () {
      listOptions.searchField = searchField.value;
      listOptions.page = 1;

      await loadModules();
    });
  }

  if (searchInput) {
    searchInput.value = listOptions.search;
  }

  btnRemove.addEventListener("click", async function () {
    const id = getSelectedId();

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
        try {
          await sendRequest("modules", {
            action: "delete",
            id: id,
          });

          Swal.fire({
            title: "Deleted",
            text: "Record deleted successfully",
            icon: "success",
          });

          await loadModuleView();
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error",
          });
        }
      }
    });
  });

  if (btnEdit) {
    btnEdit.addEventListener("click", async function () {
      const id = getSelectedId();
      await loadView("../views/forms/modules.html", "content");
      await initModuleForm("edit", id);
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener("click", async function () {
      await loadView("../views/forms/modules.html", "content");
      await initModuleForm("add");
    });
  }

  if (btnGoBack) {
    btnGoBack.addEventListener("click", async function (event) {
      event.preventDefault();

      await initViewMain();
    });
  }

  btnActions.addEventListener("click", async function () {
    await loadView("../views/actions.html", "content");
    const actionModule = await import("./actions.js");
    const moduleId = getSelectedId();
    await actionModule.initView(moduleId);
  });

  if (orderBy) {
    orderBy.value = listOptions.orderBy;

    orderBy.addEventListener("change", async function () {
      listOptions.orderBy = orderBy.value;
      listOptions.page = 1;

      await loadModules();
    });
  }

  if (orderDirection) {
    orderDirection.value = listOptions.orderDirection;

    orderDirection.addEventListener("change", async function () {
      listOptions.orderDirection = orderDirection.value;
      listOptions.page = 1;

      await loadModules();
    });
  }

  if (btnPrevious) {
    btnPrevious.addEventListener("click", async function () {
      if (listOptions.page > 1) {
        listOptions.page--;

        await loadModules();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", async function () {
      if (!btnNext.disabled) {
        listOptions.page++;

        await loadModules();
      }
    });
  }

  if (btnSearch) {
    btnSearch.addEventListener("click", async function () {
      listOptions.searchField = searchField.value;
      listOptions.search = searchInput.value.trim();
      listOptions.page = 1;

      await loadModules();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", async function (event) {
      if (event.key === "Enter") {
        listOptions.searchField = searchField.value;
        listOptions.search = searchInput.value.trim();
        listOptions.page = 1;

        await loadModules();
      }
    });
  }

  await loadModules();
}

async function loadModules() {
  const data = await fetchRecords("modules", listOptions);
  const tableBody = document.getElementById("modulesTableBody");

  if (tableBody) {
    tableBody.innerHTML = "";

    const modules = data.records;

    modules.forEach((module) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${module.id_module}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${module.name}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${module.description || "-"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${module.img || "-"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${module.url || "-"}</td>
      `;

      tr.addEventListener("click", function (event) {
        rowClick(event, module.id_module);
      });

      tableBody.appendChild(tr);
    });

    updatePagination(data);
  }
}

function updatePagination(data) {
  const currentPage = document.getElementById("currentPage");
  const totalPages = document.getElementById("totalPages");
  const paginationSummary = document.getElementById("paginationSummary");
  const btnPrevious = document.getElementById("btnPrevious");
  const btnNext = document.getElementById("btnNext");

  currentPage.textContent = data.page;
  totalPages.textContent = data.totalPages;

  btnPrevious.disabled = data.page <= 1;
  btnNext.disabled = data.page >= data.totalPages;

  const start = data.total === 0 ? 0 : (data.page - 1) * data.limit + 1;
  const end = Math.min(data.page * data.limit, data.total);

  paginationSummary.textContent = `Showing ${start} to ${end} of ${data.total} modules`;
}

async function loadModuleView() {
  await loadView("../views/modules.html", "content");
  await initView();
}

async function initModuleForm(mode, id = null) {
  try {
    const form = document.getElementById("itemForm");
    const btnGoBack = document.getElementById("goback");

    if (mode === "edit" && id) {
      await loadRecordDataToForm("modules", id, "itemForm");
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      //se manda a llamar la funcion, se le pasa el formulario y las reglas definidas
      const validation = validateForm(form, modulesRules);
      //Si no es valido se muestra mensaje y ya no ejecuta el resto del proceso
      if (!validation.valid) {
        await Swal.fire({
          icon: "warning",
          title: "Validation error",
          text: validation.error.message,
        });

        return; // Evitar que se ejecute el guardado o la actualización.
      }

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
              const response = await updateRecord("modules", form, id);
              if (response) {
                // Después de guardar, regresar al listado.
                await loadModuleView();
              }
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
              const response = await saveRecords("modules", form);

              if (response) {
                // Después de guardar, regresar al listado.
                await loadModuleView();
              }
            }
          });
        }
      } catch (error) {
        console.error("Error al guardar el módulo:", error);
      }
    });

    if (btnGoBack) {
      btnGoBack.addEventListener("click", async function (event) {
        event.preventDefault();

        await loadModuleView();
      });
    }
  } catch (error) {
    console.error("Error al inicializar el formulario:", error);
  }
}
