import { sendRequest, fetchRecords } from "./api.js";

import { initView as initViewMain } from "./enviroment.js";

import { rowClick, loadView } from "./function.js";

export async function initView(roleID) {
  const btnGoBack = document.getElementById("btnBackToRoles");
  const btnSave = document.getElementById("btnSavePermissions");
  if (btnGoBack) {
    btnGoBack.addEventListener("click", async function (event) {
      await loadView("../views/roles.html", "content");
      const rolesModule = await import("./roles.js");
      await rolesModule.initView();
    });
  }
  if (btnSave) {
    btnSave.addEventListener("click", async () => {
      const permissions = getSelectedPermissions();
      const payload = {
        permissions,
        idRol: roleID,
        action: "savePermissions",
      };
      const rs = await sendRequest("roles_permissions", payload);
      if (rs && rs.success) {
        Swal.fire({
          icon: "success",
          title: "Information Save",
          text: "Permissions saves successfull",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error saving information",
          text: "Error while save information",
        });
      }
    });
  }

  await loadPermissions(roleID);
}

async function loadPermissions(roleID) {
  const options = {
    idRol: roleID,
  };
  const data = await fetchRecords("roles_permissions", options);

  const content = document.getElementById("contentPermissions");

  if (content) {
    // Limpiar el contenedor antes de volver a pintar los módulos.
    content.innerHTML = "";

    data.forEach((module) => {
      const totalActions = module.actions.length;

      const assignedActions = module.actions.filter((action) =>
        Boolean(Number(action.enabled)),
      ).length;

      // Crear un identificador seguro para usarlo en IDs de HTML.
      const moduleKey = `module-${module.id}`;

      // Crear las acciones del módulo.
      const actionsHtml = module.actions
        .map((action, index) => {
          const actionId = `${moduleKey}-action-${action.id}`;
          const isEnabled = Boolean(Number(action.enabled));

          // Quitar el borde de la última acción.
          const borderClass =
            index < module.actions.length - 1 ? "border-b border-gray-100" : "";

          return `
                    <label
                        for="${actionId}"
                        class="flex items-center gap-3 py-3 ${borderClass}
                               text-sm text-gray-700 cursor-pointer"
                    >
                        <input
                            id="${actionId}"
                            type="checkbox"
                            class="permission-checkbox
                                   w-4 h-4 text-indigo-600 border-gray-300
                                   rounded focus:ring-indigo-500"
                            data-module-id="${module.id}"
                            data-action-id="${action.id}"
                            ${isEnabled ? "checked" : ""}
                        />

                        <span>
                            ${action.description || action.name}
                        </span>
                    </label>
                `;
        })
        .join("");

      const article = document.createElement("article");

      article.className =
        "module-card bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden";

      article.dataset.moduleId = module.id;

      article.innerHTML = `
            <div
                class="px-5 py-4 flex items-start justify-between gap-4
                       border-b border-gray-100"
            >
                <div class="flex items-start gap-3 min-w-0">
                    <div
                        class="w-11 h-11 rounded-lg bg-indigo-100
                               text-indigo-700 flex items-center
                               justify-center shrink-0"
                    >
                        <i class="fa-solid fa-${module.img || "fa-solid fa-cube"}"></i>
                    </div>

                    <div class="min-w-0">
                        <h2 class="text-base font-semibold text-gray-900">
                            ${module.name}
                        </h2>

                        <p
                            class="permission-counter text-sm text-gray-500"
                            data-module-id="${module.id}"
                        >
                            ${assignedActions} of ${totalActions} actions assigned
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                    <label
                        for="select-all-${moduleKey}"
                        class="flex items-center gap-2 text-sm
                               text-gray-600 cursor-pointer"
                    >
                        <input
                            id="select-all-${moduleKey}"
                            type="checkbox"
                            class="select-all-checkbox
                                   w-4 h-4 text-indigo-600
                                   border-gray-300 rounded
                                   focus:ring-indigo-500"
                            data-module-id="${module.id}"
                            ${
                              totalActions > 0 &&
                              assignedActions === totalActions
                                ? "checked"
                                : ""
                            }
                        />

                        <span>Select all</span>
                    </label>
                </div>
            </div>

            <div
                class="actions-container px-5 py-2"
                data-module-id="${module.id}"
            >
                ${
                  totalActions > 0
                    ? actionsHtml
                    : `
                            <p class="py-4 text-sm text-gray-400">
                                This module has no assigned actions.
                            </p>
                        `
                }
            </div>
        `;

      content.appendChild(article);
    });

    configurePermissionEvents(content);
  }
}

function getSelectedPermissions() {
  const permissions = [];

  document
    .querySelectorAll(".permission-checkbox:checked")
    .forEach((checkbox) => {
      permissions.push({
        id_module: Number(checkbox.dataset.moduleId),
        id_action: Number(checkbox.dataset.actionId),
      });
    });

  return permissions;
}

function configurePermissionEvents(content) {
  content.addEventListener("change", function (event) {
    const target = event.target;

    /*
     * Seleccionar o deseleccionar todas las acciones
     * de un módulo.
     */
    if (target.classList.contains("select-all-checkbox")) {
      const moduleId = target.dataset.moduleId;

      const actionCheckboxes = content.querySelectorAll(
        `.permission-checkbox[data-module-id="${moduleId}"]`,
      );

      actionCheckboxes.forEach((checkbox) => {
        checkbox.checked = target.checked;
      });
      return;
    }
  });
}
