import {
  deleteRecords,
  updateRecord,
  saveRecords,
  loadSelectOptions,
  loadRecordDataToForm,
  fetchRecords,
} from "./api.js";

import { initView as initViewMain } from "./enviroment.js";

import { rowClick, loadView, getSelectedId } from "./function.js";

export async function initView() {
  const products = await fetchRecords("products");
  const tableBody = document.getElementById("productsTableBody");
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnAdd = document.getElementById("btnAdd");
  const btnGoBack = document.getElementById("goback");
  //Detecta cuando el usuario da clic en el boton de eliminar
  btnRemove.addEventListener("click", async function (event) {
    //Se muestra la alerta para que confirme la eliminación del registro seleccionado
    Swal.fire({
      title: "¿Are you sure to delete this record?",
      text: "You won't be able to revert this action",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        //Hacer peticion para eliminar el registro
        await deleteRecords("products", getSelectedId());
        // Volver a cargar el listado para reflejar la eliminación.
        await loadProductsView();
      }
    });
  });

  if (btnEdit) {
    btnEdit.addEventListener("click", async function () {
      const id = getSelectedId();
      await loadView("../views/forms/products.html", "content");
      await initProductForm("edit", id);
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener("click", async function () {
      await loadView("../views/forms/products.html", "content");
      await initProductForm("add");
    });
  }

  if (tableBody) {
    products.forEach((product) => {
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
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.units}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColor}">
            ${product.status}
          </span>
        </td>
      `;

      //Se agrega evento a cada fila
      tr.addEventListener("click", function (event) {
        rowClick(event, product.id_product); //Se manda a llamar el evento on click y se le pasa el objeto producto
      });

      tableBody.appendChild(tr);
    });
  }

  if (btnGoBack) {
    btnGoBack.addEventListener("click", async function (event) {
      event.preventDefault();

      await initViewMain();
    });
  }
}

async function loadProductsView() {
  await loadView("../views/products.html", "content");
  await initView();
}

async function initProductForm(mode, id = null) {
  try {
    const form = document.getElementById("itemForm");
    const btnGoBack = document.getElementById("goback");

    // Cargar las categorías del select.
    await loadSelectOptions("categories", "category");

    // Si se está editando, cargar los datos del producto.
    if (mode === "edit" && id) {
      await loadRecordDataToForm("products", id, "itemForm");
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      try {
        if (mode === "edit") {
          await updateRecord("products", "itemForm", id);
        } else {
          Swal.fire({
            title: "¿Are you sure to Add record?",
            text: "Please confirm that the data is correct",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, save",
            cancelButtonText: "Cancel",
          }).then(async (result) => {
            if (result.isConfirmed) {
              await saveRecords("products", form);
              // Después de guardar, regresar al listado.
              await loadProductsView();
            }
          });
        }
      } catch (error) {
        console.error("Error al guardar el producto:", error);
      }
    });

    if (btnGoBack) {
      btnGoBack.addEventListener("click", async function (event) {
        event.preventDefault();

        await loadProductsView();
      });
    }
  } catch (error) {
    console.error("Error al inicializar el formulario:", error);
  }
}
