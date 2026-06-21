document.addEventListener("DOMContentLoaded", () => {
  fetchRoles();
});

function fetchRoles() {
  // Hace petición al archivo de php usando método POST
  fetch("php/roles.php", {
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
      const tableBody = document.getElementById("rolesTableBody");
      tableBody.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }

      // Recorre los resultados para dibujar la tabla
      data.forEach((role) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${role.id_rol}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">${role.name}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${role.description}</td>
        `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error al obtener los roles:", error));
}
