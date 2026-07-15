import {
  rowClick,
  deleteRecords,
  editRecords,
  saveRecords,
  loadView,
  loadSelectOptions,
} from "./function.js";

document.addEventListener("DOMContentLoaded", () => {

  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnAdd = document.getElementById("btnAdd");
  btnRemove.addEventListener("click", function (event) {
    deleteRecords("categories");
  });
  btnEdit.addEventListener("click", function (event) {
    editRecords();
  });
  btnAdd.addEventListener("click", function (event) {
    loadView("../views/forms/categories.html", "content").then(() => {
      const form = document.getElementById("itemForm");

      form.addEventListener("submit", function (event) {
        event.preventDefault();

        saveRecords("categories", form);
      });
    });
  });
  fetchCategories();
});

function fetchCategories() {
  const tableBody = document.getElementById("categoriesTableBody");
  if (tableBody) {
    //onload mostrar un icono de cargando
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
        tableBody.innerHTML = "";

        if (data.error) {
          console.error(data.error);
          return;
        }

        data.forEach((categories) => {
          const tr = document.createElement("tr");

          tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${categories.id_cat}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${categories.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${categories.description}</td>  
          `;

          //Se agrega evento a cada fila
          tr.addEventListener("click", function (event) {
            rowClick(event, ); //Se manda a llamar el evento on click y se le pasa el objeto producto
          });

          tableBody.appendChild(tr);
        });
      })
      .catch((error) =>
        console.error("Error al obtener los productos:", error),
      );
  }
}
