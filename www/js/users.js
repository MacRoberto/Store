document.addEventListener("DOMContentLoaded", () => {
  fetchUsers();
});

function fetchUsers() {
  // Hace petición al archivo de php usando método POST
  fetch("../php/users.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "list",
    }),
  })
    .then(async (response) => {
      const text = await response.text();
      console.log("RESPUESTA:", text);
      return JSON.parse(text);
    })
    .then((data) => {
      const tableBody = document.getElementById("usersTableBody");
      tableBody.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }

      // Recorre los resultados para dibujar la tabla de usuarios
      data.forEach((user) => {
        const tr = document.createElement("tr");

        // Condición visual para badges de estado de la cuenta
        const statusBadgeColor =
          user.status === "Active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.id_user}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${user.username}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-800">
              ${user.role_name || "Rol ID: " + user.id_rol}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColor}">
              ${user.status}
            </span>
          </td>
        `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error al obtener los usuarios:", error));
}
