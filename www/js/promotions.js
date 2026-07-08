document.addEventListener("DOMContentLoaded", () => {
  fetchPromotions();
});

function fetchPromotions() {
  fetch("../php/promotions.php", {
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
      const tableBody = document.getElementById("promotionsTableBody");
      tableBody.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }

      data.forEach((promo) => {
        const tr = document.createElement("tr");

        const statusBadgeColor =
          promo.status === "Active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${promo.id_promotion}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${promo.promotion_name}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${promo.description || "-"}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">${promo.product_name || "Todos los productos"}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-bold">${promo.percent_off}% OFF</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${promo.date_start} a ${promo.date_end}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColor}">
              ${promo.status}
            </span>
          </td>
        `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) =>
      console.error("Error al obtener las promociones:", error),
    );
}
