let productsCache = [];
document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
  fetchProducts();

  document.getElementById("btnNuevoProducto").addEventListener("click", openCreateModal);
  document.getElementById("btnCerrarModal").addEventListener("click", closeModal);
  document.getElementById("btnCancelar").addEventListener("click", closeModal);
  document.getElementById("productForm").addEventListener("submit", saveProduct);
});

function fetchProducts() {
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
          <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
            <button
              class="text-indigo-600 hover:text-indigo-900 font-medium"
              
            >
              Editar
            </button>
            <button
              class="text-red-600 hover:text-red-900 font-medium"
              
            >
              Eliminar
            </button>
          </td>
        `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error al obtener los productos:", error));
}
// -------- Cargar categorías para el <select> --------
function fetchCategories() {
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
      const select = document.getElementById("category_id");
      select.innerHTML = '<option value="">-- Selecciona una categoría --</option>';

      if (data.error) {
        console.error(data.error);
        return;
      }

      data.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id_cat;
        option.textContent = category.name;
        select.appendChild(option);
      });
    })
    .catch((error) => console.error("Error al obtener las categorías:", error));
}

// -------- Modal --------
function openCreateModal() {
  document.getElementById("productForm").reset();
  document.getElementById("id_product").value = "";
  document.getElementById("modalTitle").textContent = "Nuevo Producto";
  document.getElementById("btnGuardar").textContent = "Guardar";
  document.getElementById("productModal").classList.remove("hidden");
}


function closeModal() {
  document.getElementById("productModal").classList.add("hidden");
}

// -------- Guardar (crear o actualizar) --------
function saveProduct(event) {
  event.preventDefault();

  const id_product = document.getElementById("id_product").value;

  const payload = {
    action: "create",
    barcode: document.getElementById("barcode").value.trim(),
    name: document.getElementById("name").value.trim(),
    category_id: document.getElementById("category_id").value,
    description: document.getElementById("description").value.trim(),
    unit: document.getElementById("unit").value.trim(),
    reorder_level: document.getElementById("reorder_level").value,
    status: document.getElementById("status").value,
};
// -------- Mensaje flotante de feedback --------
function showFeedback(msg, ok) {
  const el = document.getElementById("feedbackMsg");
  el.textContent = msg;
  el.className =
    "fixed top-4 right-4 px-4 py-3 rounded-md shadow-lg text-sm font-medium z-50 " +
    (ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800");

  setTimeout(() => {
    el.classList.add("hidden");
  }, 3500);
}

  fetch("../php/products.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        closeModal();
        fetchProducts();
        showFeedback(data.msg, true);
      } else {
        showFeedback(data.msg || "Ocurrió un error al guardar el producto", false);
      }
    })
    .catch((error) => {
      console.error("Error al guardar el producto:", error);
      showFeedback("Error de conexión al guardar el producto", false);
    });
}


