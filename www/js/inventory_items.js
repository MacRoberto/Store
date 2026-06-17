document.addEventListener("DOMContentLoaded", () => {
  fetchInventoryItems();
});

function fetchInventoryItems() {
  fetch("../php/inventory_items.php", {
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
      const tableBody = document.getElementById("inventoryItemsTableBody");
      tableBody.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }

      data.forEach((item) => {
        const tr = document.createElement("tr");

        // Configuración de Badge de Estado
        const statusBadgeColor = item.status === 'Active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-amber-100 text-amber-800';

        // Formateador de moneda regional nativo de JS
        const formatter = new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN'
        });

        // Alerta visual si las existencias disponibles bajan a 0
        const isDepleted = parseInt(item.quantity_available) <= 0;
        const availableStockClass = isDepleted 
          ? 'text-red-600 font-bold bg-red-50 px-2 py-1 rounded' 
          : 'text-gray-900';

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.id_inventory_item}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${item.product_name || 'ID Producto: ' + item.product_id}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${'Almacén #' + item.id_inventory}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${formatter.format(item.cost_price)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">${formatter.format(item.sale_price)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.quantity_received}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="${availableStockClass}">${item.quantity_available}</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColor}">
              ${isDepleted ? 'Depleted' : item.status}
            </span>
          </td>
        `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error al obtener los artículos de inventario:", error));
}