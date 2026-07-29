// Importa la función general que realiza peticiones al servidor.
import { sendRequest } from "./api.js";

// Función principal del módulo.
export async function initView() {
  await loadRoles();
}

// Recupera todos los roles y los muestra dentro de la tabla.
async function loadRoles() {

  try {

    // Solicita la lista de roles al archivo PHP.
    const data = await sendRequest("roles", {
      action: "list",
    });

    const tableBody = document.getElementById("rolesTableBody");

    tableBody.innerHTML = "";

    // Recorre cada registro recibido y crea una fila.
    data.forEach((role) => {

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            ${role.id_rol}
        </td>

        <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">
            ${role.name}
        </td>

        <td class="px-6 py-4 text-sm text-gray-500">
            ${role.description ?? "-"}
        </td>
      `;

      // Agrega la fila a la tabla.
      tableBody.appendChild(tr);

    });

  } catch (error) {

    console.error("Error loading roles:", error);

  }

}