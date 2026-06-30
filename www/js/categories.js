document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();

  const form = document.getElementById("categoryForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      fetch("../php/categories.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "insert",
          name: document.getElementById("name").value,
          description: document.getElementById("description").value,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          console.log(result);
          window.location.href = "./categories.html"; // Redirige a categories.html después de guardar
        })
        .catch((error) => console.error("Error al guardar:", error));
    });
  }
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
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${category.id_cat}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${category.name}</td>
                    <td class="px-4 py-4 text-sm text-gray-500">${category.description}</td>
                    <td class="px-4 py-4 whitespace-nowrap">
                      <div class="flex gap-2">
                        <button class="px-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Editar</button>
                        <button class="px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600">Eliminar</button>
                      </div>
                    </td>
                `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error al obtener las categorías:", error));
  //configurar archivo
}


