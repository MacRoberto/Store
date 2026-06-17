document.addEventListener("DOMContentLoaded", () => {
  fetchRolesPermissions();
});

function fetchRolesPermissions() {
  // Hace petición al archivo de php usando método POST
  fetch("php/roles_permissions.php", {
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
      const tableBody = document.getElementById("permissionsTableBody");
      tableBody.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }

      // Recorre los resultados para dibujar la tabla de matriz de control
      data.forEach((perm) => {
        const tr = document.createElement("tr");

        // Condición visual para badges de estado del permiso
        const statusBadgeColor = perm.status === 'Active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800 border border-red-200';

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">#${perm.id_permission}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold uppercase tracking-wide">${perm.role_name || 'Rol #' + perm.id_role}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              ${perm.module_name || 'Módulo Base'}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">${perm.action_name || 'Acción #' + perm.id_action}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2.5 inline-flex text-xs leading-5 font-bold rounded-full ${statusBadgeColor}">
              ${perm.status}
            </span>
          </td>
        `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error al obtener la matriz de seguridad:", error));
}