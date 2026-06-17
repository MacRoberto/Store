document.addEventListener("DOMContentLoaded", () => {
  fetchInventories();
});

function fetchInventories() {
  // Hace petición al archivo de php usando método POST
  fetch("php/inventories.php", {
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
      const tableBody = document.getElementById("inventoriesTableBody");
      tableBody.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }

      // Recorre los resultados para dibujar la tabla de lotes/inventarios
      data.forEach((inventory) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Almacén / Lote #${inventory.id_inventory}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">${inventory.arrival_date}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${inventory.username || 'Usuario #' + inventory.user_id}</td>
        `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error al obtener los registros de inventario:", error));
}