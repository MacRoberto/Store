document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
});

function fetchCategories() {
  //hace petiicon al archivo de php usando metodo post
  fetch("../php/categories.php", {
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
      const tableBody = document.getElementById("categoriesTableBody");
      tableBody.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }
      //recorre los resultados para dibujar la tabla
      data.forEach((category) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${category.id_cat}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${category.name}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">${category.description}</td>
                `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error al obtener las categorías:", error));
  //configurar archivo
}
