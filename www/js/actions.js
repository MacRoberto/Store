import {
  deleteRecords,
  updateRecord,
  saveRecords,
  fetchRecords,
} from "./api.js";

import {
  rowClick,
  loadView,
  getSelectedId,
  configureModulePermissions,
  setCurrentModuleKey,
} from "./function.js";
import { validateForm } from "./validators/validate-form.js";
import { actionsRules } from "./validators/rules/actions-rules.js";

let listOptions = {
  page: 1,
  limit: 50,
  orderBy: "id_action",
  orderDirection: "DESC",
  searchField: "all",
  search: "",
};

let activeModuleId = null;
let currentActionMode = "add";
let selectedActionData = null;

export async function initView(idModule) {
  setCurrentModuleKey("actions");
  await configureModulePermissions({
    create: "actions.create",
    delete: "actions.delete",
    edit: "actions.edit",
  });
  activeModuleId = idModule ?? activeModuleId;
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnAdd = document.getElementById("btnAdd");
  const btnGoBack = document.getElementById("btnBackToModules");

  btnRemove.addEventListener("click", async function () {
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
      if (!selectedActionData) {
        Swal.fire({
          title: "Select a record",
          text: "Choose an action row before editing.",
          icon: "info",
        });
        return;
      }

      openActionModal("edit", selectedActionData);
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener("click", async function () {
      openActionModal("add");
    });
  }

  if (btnGoBack) {
    btnGoBack.addEventListener("click", async function () {
      await loadView("../views/modules.html", "content");
      const modulesModule = await import("./modules.js");
      setCurrentModuleKey("modules");
      await modulesModule.initView();
    });
  }

  initActionForm();
  await loadActions(activeModuleId);
}

async function loadActionView() {
  await loadView("../views/actions.html", "content");
  await initView(activeModuleId);
}

function initActionForm() {
  const form = document.getElementById("itemForm");
  const modal = document.getElementById("actionModal");
  const modalTitle = document.getElementById("actionModalTitle");
  const submitButton = document.getElementById("actionSubmitBtn");
  const closeButton = document.getElementById("actionModalClose");
  const cancelButton = document.getElementById("actionModalCancel");

  if (!form || !modal) {
    return;
  }

  ensureModuleHiddenInput(form);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    //se manda a llamar la funcion, se le pasa el formulario y las reglas definidas
    const validation = validateForm(form, actionsRules);
    //Si no es valido se muestra mensaje y ya no ejecuta el resto del proceso
    if (!validation.valid) {
      await Swal.fire({
        icon: "warning",
        title: "Validation error",
        text: validation.error.message,
      });

      return; // Evitar que se ejecute el guardado o la actualización.
    }

    const idActionInput = form.querySelector('input[name="id_action"]');
    const idModuleInput = ensureModuleHiddenInput(form);

    if (idModuleInput) {
      idModuleInput.value = activeModuleId ?? "";
    }

    try {
      const isEditMode = currentActionMode === "edit" && idActionInput?.value;

      Swal.fire({
        title: isEditMode
          ? "¿Are you sure to update this record?"
          : "¿Are you sure to Add record?",
        text: isEditMode
          ? "This will overwrite the existing information"
          : "Please confirm that the data is correct",
        icon: isEditMode ? "info" : "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: isEditMode ? "Yes, update" : "Yes, save",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          if (isEditMode) {
            const response = await updateRecord(
              "actions",
              form,
              idActionInput.value,
            );
            // Después de guardar, regresar al listado.
            if (response) {
              // Después de guardar, regresar al listado.
              await loadActions(activeModuleId);
            }
          } else {
            const response = await saveRecords("actions", form);
            if (response) {
              // Después de guardar, regresar al listado.
              await loadActions(activeModuleId);
            }
          }

          closeActionModal();
        }
      });
    } catch (error) {
      console.error("Error al guardar la accion:", error);
    }
  });

  if (closeButton) {
    closeButton.addEventListener("click", closeActionModal);
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", closeActionModal);
  }

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeActionModal();
      }
    });
  }

  if (modalTitle && submitButton) {
    modalTitle.textContent = "Add Action";
    submitButton.textContent = "Save Action";
  }
}

function openActionModal(mode, actionData = null) {
  const modal = document.getElementById("actionModal");
  const modalTitle = document.getElementById("actionModalTitle");
  const submitButton = document.getElementById("actionSubmitBtn");
  const form = document.getElementById("itemForm");

  if (!modal || !form) {
    return;
  }

  currentActionMode = mode;

  if (mode === "edit" && actionData) {
    selectedActionData = actionData;
    const idActionInput = form.querySelector('input[name="id_action"]');
    const idModuleInput = ensureModuleHiddenInput(form);
    const nameInput = form.querySelector('input[name="name"]');
    const descriptionInput = form.querySelector('input[name="description"]');

    if (idActionInput) idActionInput.value = actionData.id_action ?? "";
    if (idModuleInput) idModuleInput.value = activeModuleId ?? "";
    if (nameInput)
      nameInput.value = actionData.name ?? actionData.action_name ?? "";
    if (descriptionInput) descriptionInput.value = actionData.description ?? "";

    if (modalTitle) modalTitle.textContent = "Edit Action";
    if (submitButton) submitButton.textContent = "Update Action";
  } else {
    clearActionForm(form);
    if (modalTitle) modalTitle.textContent = "Add Action";
    if (submitButton) submitButton.textContent = "Save Action";
  }

  modal.classList.remove("hidden");
}

function closeActionModal() {
  const modal = document.getElementById("actionModal");
  const form = document.getElementById("itemForm");
  const modalTitle = document.getElementById("actionModalTitle");
  const submitButton = document.getElementById("actionSubmitBtn");

  if (modal) {
    modal.classList.add("hidden");
  }

  if (form) {
    clearActionForm(form);
  }

  if (modalTitle) modalTitle.textContent = "Add Action";
  if (submitButton) submitButton.textContent = "Save Action";

  currentActionMode = "add";
  selectedActionData = null;
}

function ensureModuleHiddenInput(form) {
  let idModuleInput = form.querySelector('input[name="id_module"]');

  if (!idModuleInput) {
    idModuleInput = document.createElement("input");
    idModuleInput.type = "hidden";
    idModuleInput.name = "id_module";
    form.appendChild(idModuleInput);
  }

  return idModuleInput;
}

function clearActionForm(form) {
  if (!form) {
    return;
  }

  form.reset();

  const idActionInput = form.querySelector('input[name="id_action"]');
  const idModuleInput = ensureModuleHiddenInput(form);

  if (idActionInput) idActionInput.value = "";
  if (idModuleInput) idModuleInput.value = activeModuleId ?? "";

  form.querySelectorAll("input, textarea, select").forEach((element) => {
    element.classList.remove("border-red-500");
  });
}

async function loadActions(idModule) {
  const data = await fetchRecords("actions", { ...listOptions, idModule });
  const tableBody = document.getElementById("actionsTableBody");

  if (tableBody) {
    tableBody.innerHTML = "";
    data.forEach((action) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${action.id_action}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${action.action_name}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${action.module_name || "-"}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${action.description || "-"}</td>
      `;

      tr.addEventListener("click", function (event) {
        rowClick(event, action.id_action);
        selectedActionData = {
          id_action: action.id_action,
          name: action.action_name,
          description: action.description,
        };
      });

      tableBody.appendChild(tr);
    });
  }
}
