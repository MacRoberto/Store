document.addEventListener("DOMContentLoaded", () => {
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
      data.forEach((item) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">#${item.id_action}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">${item.action_name}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              ${item.module_name || 'Módulo ID: ' + item.id_module}
            </span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-500">
            ${item.description || '<span class="text-gray-300 italic">Sin descripción</span>'}
          </td>
        `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error al obtener las acciones del sistema:", error));
}