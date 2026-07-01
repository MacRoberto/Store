document.addEventListener("DOMContentLoaded", () => {
  fetchInventoryItems();
  initInsertarForm();
});

function fetchInventoryItems() {
  fetch("../php/inventory_items.php", {
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
      const tableBody = document.getElementById("inventoryItemsTableBody");
      if (!tableBody) return; // Evita errores si estamos en insertar_items.html
      tableBody.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }

      data.forEach((item) => {
        const tr = document.createElement("tr");

        const statusBadgeColor =
          item.status === "Active"
            ? "bg-green-100 text-green-800"
            : "bg-amber-100 text-amber-800";

        const formatter = new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        });

        const isDepleted = parseInt(item.quantity_available) <= 0;
        const availableStockClass = isDepleted
          ? "text-red-600 font-bold bg-red-50 px-2 py-1 rounded"
          : "text-gray-900";

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.id_inventory_item}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${item.product_name || "ID Producto: " + item.product_id}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${"Almacén #" + item.id_inventory}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${formatter.format(item.cost_price)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">${formatter.format(item.sale_price)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.quantity_received}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="${availableStockClass}">${item.quantity_available}</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColor}">
              ${isDepleted ? "Depleted" : item.status}
            </span>

            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
    <a href="editar_items.html?id=${item.id_inventory_item}" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors">
      Editar
    </a>
    <a href="eliminar_items.html?id=${item.id_inventory_item}" class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors">
      Eliminar
    </a>
  </td>
          </td>
        `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) =>
      console.error("Error al obtener los artículos de inventario:", error),
    );
}

// --- LOGICA DE INSERCIÓN Y CARGA DE SELECTS ---
function initInsertarForm() {
  const formInsertar = document.getElementById("formInsertarItem");
  if (!formInsertar) return;

  // 1. Cargar la lista de Productos
  fetch("../php/inventory_items.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "get_products_list" })
  })
  .then(res => res.json())
  .then(products => {
    const selectProduct = document.getElementById("productId");
    selectProduct.innerHTML = '<option value="">-- Selecciona un Producto --</option>';
    products.forEach(p => {
      selectProduct.innerHTML += `<option value="${p.id_product}">${p.product_name} (S/N: ${p.barcode || 'N/A'})</option>`;
    });
  })
  .catch(err => console.error("Error cargando productos:", err));

  // 2. Cargar la lista de Almacenes / Inventarios (Con plan de respaldo si está vacío)
  fetch("../php/inventory_items.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "get_inventories_list" })
  })
  .then(res => res.json())
  .then(inventories => {
    const selectInventory = document.getElementById("idInventory");
    if (!inventories || inventories.length === 0 || inventories.error) {
      selectInventory.innerHTML = `
        <option value="">-- No hay almacenes en la BD, usando uno automático --</option>
        <option value="1">Almacén Principal (ID: 1)</option>
      `;
      return;
    }
    selectInventory.innerHTML = '<option value="">-- Selecciona un Almacén --</option>';
    inventories.forEach(i => {
      const infoEncargado = i.username ? i.username : (i.user_id ? 'ID Usuario: ' + i.user_id : 'Sin encargado');
      selectInventory.innerHTML += `<option value="${i.id_inventory}">Almacén #${i.id_inventory} (${infoEncargado})</option>`;
    });
  })
  .catch(err => {
    console.error("Error cargando almacenes, usando fallback:", err);
    const selectInventory = document.getElementById("idInventory");
    selectInventory.innerHTML = `
      <option value="">-- Error de red, usando por defecto --</option>
      <option value="1">Almacén Principal (ID: 1)</option>
    `;
  });

  // 3. Manejar el evento submit del formulario
  formInsertar.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const btnGuardar = document.getElementById("btnGuardarItem");
    if (btnGuardar) btnGuardar.disabled = true;

    const itemData = {
      action: "insert",
      product_id: document.getElementById("productId").value,
      id_inventory: document.getElementById("idInventory").value,
      cost_price: document.getElementById("costPrice").value,
      sale_price: document.getElementById("salePrice").value,
      quantity_received: document.getElementById("quantityReceived").value,
      quantity_available: document.getElementById("quantityAvailable").value
    };

    if (!itemData.product_id || !itemData.id_inventory) {
      alert("Por favor, selecciona un producto y un almacén válidos.");
      if (btnGuardar) btnGuardar.disabled = false;
      return;
    }

    fetch("../php/inventory_items.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          alert("¡Artículo guardado exitosamente!");
          window.location.href = "inventory_items.html";
        } else {
          alert("Error al guardar en BD: " + data.msg);
          if (btnGuardar) btnGuardar.disabled = false;
        }
      })
      .catch((error) => {
        console.error("Error al insertar el artículo:", error);
        alert("Ocurrió un error en la conexión.");
        if (btnGuardar) btnGuardar.disabled = false;
      });
  });
}