/*
 * Producto encontrado mediante la búsqueda.
 */
let selectedProduct = null;

/*
 * Productos agregados temporalmente a la carga.
 * Todavía no existen en la base de datos.
 */
let inventoryItems = [];

/*
 * Índice del producto que se está editando.
 * null significa que se agregará un producto nuevo.
 */
let editingIndex = null;

/**
 * Inicializa la vista de carga de inventario.
 */
import { sendRequest } from "./api.js";
import { loadView, setCurrentModuleKey } from "./function.js";
export function initView() {
  const btnSearchProduct = document.getElementById("btnSearchProduct");
  const searchProductInput = document.getElementById("searchProductInput");
  const itemForm = document.getElementById("itemForm");
  const btnClearItem = document.getElementById("btnClearItem");
  const btnSaveInventory = document.getElementById("btnSaveInventory");
  const inventoryTableBody = document.getElementById("inventoryTableBody");
  const btnGoBack = document.getElementById("goback");

  /*
   * Ocultar inicialmente los datos del producto.
   */
  hideProductInfo();

  /*
   * Pintar el estado inicial de la tabla y los totales.
   */
  renderInventoryTable();

  /*
   * Buscar mediante el botón Search.
   */
  btnSearchProduct.addEventListener("click", searchProduct);

  /*
   * Buscar mediante la tecla Enter.
   */
  searchProductInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      searchProduct();
    }
  });

  /*
   * Agregar o actualizar un producto en la tabla temporal.
   */
  itemForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addProductToList();
  });

  /*
   * Limpiar el formulario del producto.
   */
  btnClearItem.addEventListener("click", clearItemForm);

  /*
   * Guardar la carga completa de inventario.
   */
  btnSaveInventory.addEventListener("click", saveInventory);

  /*
   * Eventos Edit y Remove de la tabla.
   */
  inventoryTableBody.addEventListener("click", function (event) {
    const editButton = event.target.closest(".btn-edit-item");
    const removeButton = event.target.closest(".btn-remove-item");

    if (editButton) {
      const index = Number(editButton.dataset.index);
      editInventoryItem(index);
    }

    if (removeButton) {
      const index = Number(removeButton.dataset.index);
      removeInventoryItem(index);
    }
  });

  if (btnGoBack) {
    btnGoBack.addEventListener("click", async function (event) {
      await loadView("../views/inventories.html", "content");
      const inventoriesModule = await import("./inventories.js");
      setCurrentModuleKey("inventories");
      await inventoriesModule.initView();
    });
  }
}

/**
 * Busca un producto en products.php.
 */
async function searchProduct() {
  const searchProductInput = document.getElementById("searchProductInput");

  const searchValue = searchProductInput.value.trim();

  if (searchValue === "") {
    Swal.fire({
      icon: "warning",
      title: "Search required",
      text: "Enter a product code, barcode or product name.",
    });

    searchProductInput.focus();
    return;
  }

  try {
    const payload = { action: "find", search: searchValue };
    const result = await sendRequest("products", payload);
    if (result.status != "success") {
      selectedProduct = null;
      hideProductInfo();

      Swal.fire({
        icon: "warning",
        title: "Product not found",
        text: result.message || "No product matches the search.",
      });

      return;
    }

    /*
     * Se espera que el producto venga en result.data.
     */
    selectedProduct = result.product;

    showProductInfo(selectedProduct);
  } catch (error) {
    console.error("Error searching product:", error);

    Swal.fire({
      icon: "error",
      title: "Search error",
      text: "The product could not be searched.",
    });
  }
}

/**
 * Muestra la información del producto encontrado.
 */
function showProductInfo(product) {
  const productInfoStrip = document.getElementById("productInfoStrip");

  const selectedProductId = document.getElementById("selectedProductId");

  const selectedProductName = document.getElementById("selectedProductName");

  const selectedProductCode = document.getElementById("selectedProductCode");

  const selectedProductCategory = document.getElementById(
    "selectedProductCategory",
  );

  selectedProductId.value = product.id;

  selectedProductName.textContent = product.name || "";

  selectedProductCode.textContent = product.barcode || "";

  selectedProductCategory.textContent = product.category_name || "";

  productInfoStrip.classList.remove("hidden");

  document.getElementById("cost_price").focus();
}

/**
 * Oculta y limpia la información del producto.
 */
function hideProductInfo() {
  const productInfoStrip = document.getElementById("productInfoStrip");

  document.getElementById("selectedProductId").value = "0";
  document.getElementById("selectedProductName").textContent = "";
  document.getElementById("selectedProductCode").textContent = "";
  document.getElementById("selectedProductCategory").textContent = "";

  productInfoStrip.classList.add("hidden");
}

/**
 * Agrega un producto a la lista temporal.
 * También actualiza un producto cuando se encuentra en modo edición.
 */
function addProductToList() {
  const costPriceInput = document.getElementById("cost_price");
  const sellingPriceInput = document.getElementById("selling_price");
  const quantityInput = document.getElementById("quantity");
  const statusInput = document.getElementById("status");

  if (!selectedProduct) {
    Swal.fire({
      icon: "warning",
      title: "Product required",
      text: "Search and select a product first.",
    });

    document.getElementById("searchProductInput").focus();
    return;
  }

  const costPrice = Number(costPriceInput.value);
  const sellingPrice = Number(sellingPriceInput.value);
  const quantity = Number(quantityInput.value);
  const status = statusInput.value;

  /*
   * Validar precio de compra.
   */
  if (costPriceInput.value.trim() === "" || costPrice <= 0) {
    showFieldError(costPriceInput, "Purchase price must be greater than zero.");

    return;
  }

  /*
   * Validar precio de venta.
   */
  if (sellingPriceInput.value.trim() === "" || sellingPrice <= 0) {
    showFieldError(sellingPriceInput, "Sale price must be greater than zero.");

    return;
  }

  /*
   * Validar cantidad recibida.
   */
  if (
    quantityInput.value.trim() === "" ||
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    showFieldError(
      quantityInput,
      "Quantity received must be a positive integer.",
    );

    return;
  }

  /*
   * Validar estado.
   */
  if (status === "") {
    showFieldError(statusInput, "Select a product status.");

    return;
  }

  const item = {
    id: Number(selectedProduct.id),

    product_name: selectedProduct.name || selectedProduct.product_name,

    barcode: selectedProduct.barcode || selectedProduct.code || "",

    category_name:
      selectedProduct.category_name || selectedProduct.category || "",

    cost_price: costPrice,
    selling_price: sellingPrice,
    quantity: quantity,
    status: status,

    /*
     * El subtotal corresponde al costo de compra.
     */
    subtotal: costPrice * quantity,
  };

  /*
   * Si está editando, reemplazar el registro.
   */
  if (editingIndex !== null) {
    inventoryItems[editingIndex] = item;
  } else {
    /*
     * Evitar agregar dos veces el mismo producto.
     */
    const existingIndex = findProductIndex(item.id);

    if (existingIndex !== -1) {
      Swal.fire({
        icon: "warning",
        title: "Product already added",
        text: "Edit the existing product instead of adding it again.",
      });

      return;
    }

    inventoryItems.push(item);
  }

  renderInventoryTable();
  clearItemForm();
}

/**
 * Busca un producto dentro del arreglo temporal.
 */
function findProductIndex(productId) {
  for (let index = 0; index < inventoryItems.length; index++) {
    if (inventoryItems[index].id === productId) {
      return index;
    }
  }

  return -1;
}

/**
 * Pinta los productos en la tabla inferior.
 */
function renderInventoryTable() {
  const inventoryTableBody = document.getElementById("inventoryTableBody");

  inventoryTableBody.innerHTML = "";

  if (inventoryItems.length === 0) {
    inventoryTableBody.innerHTML = `
      <tr>
        <td
          colspan="7"
          class="px-6 py-10 text-center text-gray-500"
        >
          No products have been added to the inventory load.
        </td>
      </tr>
    `;

    updateInventorySummary();
    return;
  }

  for (let index = 0; index < inventoryItems.length; index++) {
    const item = inventoryItems[index];

    const row = document.createElement("tr");

    row.className = "hover:bg-gray-50 transition-colors";

    row.innerHTML = `
      <td class="px-6 py-4 font-medium text-gray-900">
        ${escapeHtml(item.product_name)}
      </td>

      <td class="px-6 py-4 text-gray-600">
        ${formatCurrency(item.cost_price)}
      </td>

      <td class="px-6 py-4 text-gray-600">
        ${formatCurrency(item.selling_price)}
      </td>

      <td class="px-6 py-4 text-gray-600">
        ${item.quantity}
      </td>

      <td class="px-6 py-4">
        ${createStatusBadge(item.status)}
      </td>

      <td class="px-6 py-4 font-medium text-gray-900">
        ${formatCurrency(item.subtotal)}
      </td>

      <td class="px-6 py-4">
        <div class="flex items-center justify-center gap-4">
          <button
            type="button"
            class="btn-edit-item inline-flex items-center gap-1
                   text-indigo-600 hover:text-indigo-800"
            data-index="${index}"
          >
            <i class="fa-solid fa-pen-to-square"></i>
            Edit
          </button>

          <button
            type="button"
            class="btn-remove-item inline-flex items-center gap-1
                   text-red-600 hover:text-red-800"
            data-index="${index}"
          >
            <i class="fa-solid fa-trash"></i>
            Remove
          </button>
        </div>
      </td>
    `;

    inventoryTableBody.appendChild(row);
  }

  updateInventorySummary();
}

/**
 * Carga en el formulario un producto agregado anteriormente.
 */
function editInventoryItem(index) {
  const item = inventoryItems[index];

  if (!item) {
    return;
  }

  editingIndex = index;

  selectedProduct = {
    id: item.id,
    name: item.product_name,
    barcode: item.barcode,
    category_name: item.category_name,
  };

  document.getElementById("searchProductInput").value =
    item.barcode || item.product_name;

  document.getElementById("cost_price").value = item.cost_price;

  document.getElementById("selling_price").value = item.selling_price;

  document.getElementById("quantity").value = item.quantity;

  document.getElementById("status").value = item.status;

  showProductInfo(selectedProduct);

  document.getElementById("btnAddToList").textContent = "Update Product";

  /*
   * Llevar al usuario a la parte superior del formulario.
   */
  document.getElementById("itemForm").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

/**
 * Elimina un producto del arreglo temporal.
 */
async function removeInventoryItem(index) {
  const item = inventoryItems[index];

  if (!item) {
    return;
  }

  const result = await Swal.fire({
    title: "Remove product?",
    text: `${item.product_name} will be removed from the inventory load.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, remove",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) {
    return;
  }

  inventoryItems.splice(index, 1);

  /*
   * Si se estaba editando el producto eliminado,
   * limpiar el formulario.
   */
  if (editingIndex === index) {
    clearItemForm();
  } else if (editingIndex !== null && editingIndex > index) {
    editingIndex--;
  }

  renderInventoryTable();
}

/**
 * Actualiza cantidad de productos, unidades y costo total.
 */
function updateInventorySummary() {
  let totalProducts = inventoryItems.length;
  let totalUnits = 0;
  let totalPurchaseCost = 0;

  for (const item of inventoryItems) {
    totalUnits += item.quantity;
    totalPurchaseCost += item.subtotal;
  }

  const productText = totalProducts === 1 ? "product" : "products";

  const unitText = totalUnits === 1 ? "unit" : "units";

  document.getElementById("totalProductsCount").textContent =
    `${totalProducts} ${productText}`;

  document.getElementById("totalUnitsCount").textContent =
    `${totalUnits} ${unitText}`;

  document.getElementById("totalPurchaseCost").textContent =
    formatCurrency(totalPurchaseCost);
}

/**
 * Limpia el formulario para seleccionar otro producto.
 */
function clearItemForm() {
  selectedProduct = null;
  editingIndex = null;

  document.getElementById("searchProductInput").value = "";
  document.getElementById("selectedProductId").value = "0";
  document.getElementById("cost_price").value = "";
  document.getElementById("selling_price").value = "";
  document.getElementById("quantity").value = "";
  document.getElementById("status").value = "Active";

  document.getElementById("btnAddToList").textContent = "Add to List";

  hideProductInfo();

  document.getElementById("searchProductInput").focus();
}

/**
 * Guarda la carga completa de inventario.
 */
async function saveInventory() {
  if (inventoryItems.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Empty inventory load",
      text: "Add at least one product before saving.",
    });

    return;
  }

  /*
   * Estos datos están representados por etiquetas span en tu HTML.
   */
  const reference = document.getElementById("lblReference").textContent.trim();

  const receptionDate = document
    .getElementById("lblReceptionDate")
    .textContent.trim();

  const notes = document.getElementById("lblNotes").textContent.trim();

  const confirmation = await Swal.fire({
    title: "Save inventory load?",
    text: "All products in the list will be registered.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, save inventory",
    cancelButtonText: "Cancel",
  });

  if (!confirmation.isConfirmed) {
    return;
  }

  const btnSaveInventory = document.getElementById("btnSaveInventory");

  const originalButtonContent = btnSaveInventory.innerHTML;

  btnSaveInventory.disabled = true;

  btnSaveInventory.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Saving...
  `;

  try {
    const payload = {
      action: "save",
      items: inventoryItems,
    };
    const result = await sendRequest("inventories", payload);
    if (result.error) {
      console.log(result);
      Swal.fire({
        icon: "error",
        title: "Inventory not saved",
        text: result.message || "The inventory load could not be saved.",
      });

      return;
    }

    await Swal.fire({
      icon: "success",
      title: "Inventory saved",
      text: result.message || "The inventory load was saved successfully.",
    });

    inventoryItems = [];

    clearItemForm();
    renderInventoryTable();

    /*
     * Ajusta esta función al nombre real del proyecto.
     */
    if (typeof loadInventoriesView === "function") {
      await loadInventoriesView();
    }
  } catch (error) {
    console.error("Error saving inventory:", error);

    Swal.fire({
      icon: "error",
      title: "Server error",
      text: "An unexpected error occurred while saving inventory.",
    });
  } finally {
    btnSaveInventory.disabled = false;
    btnSaveInventory.innerHTML = originalButtonContent;
  }
}

/**
 * Muestra una alerta y enfoca el campo incorrecto.
 */
function showFieldError(field, message) {
  field.focus();

  Swal.fire({
    icon: "warning",
    title: "Validation error",
    text: message,
  });
}

/**
 * Formatea cantidades monetarias.
 */
function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/**
 * Genera la etiqueta visual para el estado.
 */
function createStatusBadge(status) {
  if (status === "Active") {
    return `
      <span
        class="inline-flex items-center gap-1 px-2 py-1
               text-xs font-medium text-green-700 bg-green-50
               border border-green-300 rounded-md"
      >
        <span class="w-2 h-2 bg-green-500 rounded-full"></span>
        Active
      </span>
    `;
  }

  return `
    <span
      class="inline-flex items-center gap-1 px-2 py-1
             text-xs font-medium text-gray-600 bg-gray-50
             border border-gray-300 rounded-md"
    >
      <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
      ${escapeHtml(status)}
    </span>
  `;
}

/**
 * Evita imprimir directamente texto recibido desde la API.
 */
function escapeHtml(value) {
  const element = document.createElement("div");

  element.textContent = value || "";

  return element.innerHTML;
}
