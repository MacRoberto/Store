document.addEventListener("DOMContentLoaded", () => {
  fetchSalesDetails();
});

function fetchSalesDetails() {
  // Hace petición al archivo de php usando método POST
  fetch("../php/sales_details.php", {
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
      const tableBody = document.getElementById("salesDetailsTableBody");
      tableBody.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }

      // Formateador de moneda regional nativo de JS
      const currencyFormatter = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      });

      // Recorre los resultados para dibujar el desglose
      data.forEach((item) => {
        const tr = document.createElement("tr");

        const discountValue = parseFloat(item.discount_applied);
        const discountClass =
          discountValue > 0
            ? "text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded"
            : "text-gray-500";

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#${item.id_sale_item}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">Venta #${item.sale_id}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${item.quantity}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${currencyFormatter.format(item.unit_price)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="${discountClass}">${currencyFormatter.format(discountValue)}</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
            ${currencyFormatter.format(item.subtotal)}
          </td>
        `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) =>
      console.error("Error al obtener el desglose de venta:", error),
    );
}
