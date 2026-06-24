document.addEventListener("DOMContentLoaded", () => {
  fetchSales();
});

function fetchSales() {
  // Hace petición al archivo de php usando método POST
  fetch("../php/sales.php", {
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
      const tableBody = document.getElementById("salesTableBody");
      tableBody.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }

      // Recorre los resultados para dibujar la tabla de ventas
      data.forEach((sale) => {
        const tr = document.createElement("tr");

        // Condición visual para badges de estado
        let statusBadgeColor = "bg-gray-100 text-gray-800";
        switch (sale.status) {
          case "Completed":
            statusBadgeColor = "bg-green-100 text-green-800";
            break;
          case "Refunded":
            statusBadgeColor = "bg-amber-100 text-amber-800";
            break;
          case "Voided":
            statusBadgeColor = "bg-red-100 text-red-800";
            break;
        }

        // Formateador de moneda regional nativo de JS
        const currencyFormatter = new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        });

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">#${sale.id_sale}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sale.transaction_date}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${sale.username || "Usuario #" + sale.user_id}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800">
              ${sale.payment_method}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
            ${currencyFormatter.format(sale.total_amount)}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColor}">
              ${sale.status}
            </span>
          </td>
        `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error al obtener las ventas:", error));
}
