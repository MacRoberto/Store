import {
  rowClick,
  deleteRecords,
  editRecords,
  saveRecords,
  loadView,
  loadSelectOptions,
} from "./function.js";


document.addEventListener("DOMContentLoaded", () => {
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnAdd = document.getElementById("btnAdd");
  btnRemove.addEventListener("click", function (event) {
    deleteRecords("actions");
  });
  btnEdit.addEventListener("click", function (event) {
    editRecords();
  });
  btnAdd.addEventListener("click", function (event) {
    loadView("../views/forms/actions.html", "content").then(() => {
      const form = document.getElementById("itemForm");

      loadSelectOptions("actions", "category");
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        saveRecords("actions", form);
      });
    });
  });

  fetchActions();
});

function fetchActions() {
  // Hace petición al archivo de php usando método POST
  fetch("../php/actions.php", {
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
      const tableBody = document.getElementById("actionsTableBody");
      tableBody.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }

      // Recorre los resultados para dibujar la tabla de acciones
      data.forEach((action) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">#${action.id_action}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">${action.action_name}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              ${action.module_name || 'Módulo ID: ' + action.id_module}
            </span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-500">
            ${action.description || '<span class="text-gray-300 italic">Sin descripción</span>'}
          </td>
        `;

          tr.addEventListener("click", function (event) {
            rowClick(event, ); //Se manda a llamar el evento on click y se le pasa el objeto producto
          });

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error al obtener las acciones del sistema:", error));
}