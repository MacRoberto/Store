document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
});

function fetchProducts() {
  fetch("php/products.php", {
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
      const tableBody = document.getElementById("productsTableBody");
      tableBody.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }

      data.forEach((product) => {
        const tr = document.createElement("tr");

        const statusBadgeColor =
          product.status === "Active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.id_product}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.barcode || "-"}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${product.product_name}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.category_name || "Sin Categoría"}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${product.description}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.reorder_level}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.unit}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColor}">
              ${product.status}
            </span>
          </td>
        `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error al obtener los productos:", error));
}
