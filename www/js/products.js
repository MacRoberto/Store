import {
  deleteRecords,
  updateRecord,
  saveRecords,
  loadSelectOptions,
  loadRecordDataToForm,
  fetchRecords,
} from "./api.js";

import { initView as initViewMain } from "./enviroment.js";

import {
  rowClick,
  loadView,
  getSelectedId,
  configureModulePermissions,
  setCurrentModuleKey,
} from "./function.js";
import { validateForm } from "./validators/validate-form.js";
import { productsRules } from "./validators/rules/products-rules.js";

let listOptions = {
  page: 1,
  limit: 50,
  orderBy: "id_product", //campo por default por el que se va a ordenar
  orderDirection: "DESC",
  searchField: "all",
  search: "",
};

export async function initView() {
  await configureModulePermissions({
    create: "products.create",
    delete: "products.delete",
    edit: "products.edit",
  });
  const tableBody = document.getElementById("productsTableBody");
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnAdd = document.getElementById("btnAdd");
  const btnGoBack = document.getElementById("goback");

  const orderBy = document.getElementById("orderBy");
  const orderDirection = document.getElementById("orderDirection");

  const btnPrevious = document.getElementById("btnPrevious");
  const btnNext = document.getElementById("btnNext");

  const currentPage = document.getElementById("currentPage");
  const totalPages = document.getElementById("totalPages");
  const paginationSummary = document.getElementById("paginationSummary");

  const searchField = document.getElementById("searchField");
  const searchInput = document.getElementById("searchInput");
  const btnSearch = document.getElementById("btnSearch");

  if (searchField) {
    searchField.value = listOptions.searchField;
  }

  if (searchInput) {
    searchInput.value = listOptions.search;
  }

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

  if (btnGoBack) {
    btnGoBack.addEventListener("click", async function (event) {
      event.preventDefault();

      await initViewMain();
    });
  }

  if (orderBy) {
    orderBy.value = listOptions.orderBy;

    orderBy.addEventListener("change", async function () {
      listOptions.orderBy = orderBy.value;
      listOptions.page = 1;

      await loadProducts();
    });
  }

  if (orderDirection) {
    orderDirection.value = listOptions.orderDirection;

    orderDirection.addEventListener("change", async function () {
      listOptions.orderDirection = orderDirection.value;
      listOptions.page = 1;

      await loadProducts();
    });
  }

  if (btnPrevious) {
    btnPrevious.addEventListener("click", async function () {
      if (listOptions.page > 1) {
        listOptions.page--;

        await loadProducts();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", async function () {
      if (!btnNext.disabled) {
        listOptions.page++;

        await loadProducts();
      }
    });
  }

  if (btnSearch) {
    btnSearch.addEventListener("click", async function () {
      listOptions.searchField = searchField.value;
      listOptions.search = searchInput.value.trim();
      listOptions.page = 1;

      await loadProducts();
    });
  }

  //Busqueda con enter
  if (searchInput) {
    searchInput.addEventListener("keydown", async function (event) {
      if (event.key === "Enter") {
        listOptions.searchField = searchField.value;
        listOptions.search = searchInput.value.trim();
        listOptions.page = 1;

        await loadProducts();
      }
    });
  }

  await loadProducts();
}

async function loadProducts() {
  const data = await fetchRecords("products", listOptions);

  const tableBody = document.getElementById("productsTableBody");

  if (tableBody) {
    // Limpiar la tabla antes de volver a pintar los registros.
    tableBody.innerHTML = "";

    const products = data.records;

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

      tr.addEventListener("click", function (event) {
        rowClick(event, product.id_product);
      });

      tableBody.appendChild(tr);
    });

    updatePagination(data);
  }
}

function updatePagination(data) {
  const currentPage = document.getElementById("currentPage");
  const totalPages = document.getElementById("totalPages");
  const paginationSummary = document.getElementById("paginationSummary");
  const btnPrevious = document.getElementById("btnPrevious");
  const btnNext = document.getElementById("btnNext");

  currentPage.textContent = data.page;
  totalPages.textContent = data.totalPages;

  btnPrevious.disabled = data.page <= 1;
  btnNext.disabled = data.page >= data.totalPages;

  const start = data.total === 0 ? 0 : (data.page - 1) * data.limit + 1;

  const end = Math.min(data.page * data.limit, data.total);

  paginationSummary.textContent = `Showing ${start} to ${end} of ${data.total} products`;
}

async function loadProductsView() {
  await loadView("../views/products.html", "content");
  setCurrentModuleKey("products");
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

      //se manda a llamar la funcion, se le pasa el formulario y las reglas definidas
      const validation = validateForm(form, productsRules);
      //Si no es valido se muestra mensaje y ya no ejecuta el resto del proceso
      if (!validation.valid) {
        await Swal.fire({
          icon: "warning",
          title: "Validation error",
          text: validation.error.message,
        });

        return; // Evitar que se ejecute el guardado o la actualización.
      }

      try {
        if (mode === "edit") {
          Swal.fire({
            title: "¿Are you sure to update this record?",
            text: "This will overwrite the existing information",
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update",
            cancelButtonText: "Cancel",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const response = await updateRecord("products", form, id);
              // Después de guardar, regresar al listado.
              if (response) {
                // Después de guardar, regresar al listado.
                await loadProductsView();
              }
            }
          });
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
              const response = await saveRecords("products", form);
              if (response) {
                // Después de guardar, regresar al listado.
                await loadProductsView();
              }
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
