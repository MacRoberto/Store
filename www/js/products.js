document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
});

function fetchProducts() {
  //onload mostrar un icono de cargando
  fetch("../php/products.php", {
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

        //Se agrega evento a cada fila
        tr.addEventListener("click", function (event) {
          rowClick(event, product); //Se manda a llamar el evento on click y se le pasa el objeto producto
        });

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error al obtener los productos:", error));
}

//Variables globales
let filaSeleccionada = null; //variable donde se almacena la fila donde el usuario dio click
let productoSeleccionadoId = null; // variable para almacenar el id del producto dependiendo en que fila dio click el usuario

//Funcion que se ejecuta cuando se hace click en la fila de la tabla
//Se usa para mostrar u ocultar el boton que sirve para eliminar un registro
function rowClick(event, product) {
  //Mostrar boton para eliminar
  const btnEliminar = document.getElementById("btnEliminarProductos");

  // Obtener el tr donde se hizo click
  const tr = event.currentTarget;
  // Quitar color a la fila seleccionada anteriormente
  if (filaSeleccionada) {
    filaSeleccionada.classList.remove(
      "bg-indigo-100",
      "ring-2",
      "ring-indigo-400",
    );
  }

  // Guardar la fila y el producto seleccionado
  filaSeleccionada = tr;
  productoSeleccionadoId = product.id_product;
  // Agregar color a la nueva fila seleccionada
  tr.classList.add("bg-indigo-100", "ring-2", "ring-indigo-400");

  // Mostrar botón eliminar
  btnEliminar.classList.remove("hidden"); //Quitar la clase hidden para hacer visible el boton
}
