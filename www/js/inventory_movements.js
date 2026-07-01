document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("movementsTableBody")) fetchMovements();

  if (document.getElementById("idItem")) cargarArticulos();

  const btnGuardar = document.getElementById("btnGuardar");
  if (btnGuardar) btnGuardar.addEventListener("click", guardarMovimiento);
});

function fetchMovements() {
  fetch("../php/inventory_movements.php", {
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
      const tableBody = document.getElementById("movementsTableBody");
      tableBody.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }

      data.forEach((movement) => {
        const tr = document.createElement("tr");

        // Cambiar el color del badge y el prefijo matemático según la acción
        let typeBadgeColor = "bg-gray-100 text-gray-800";
        let qtyPrefix = "";

        switch (movement.movement_type) {
          case "Entry":
          case "Return":
            typeBadgeColor = "bg-green-100 text-green-800";
            qtyPrefix = "+";
            break;
          case "Sale":
            typeBadgeColor = "bg-red-100 text-red-800";
            qtyPrefix = "-";
            break;
          case "Adjustment":
            typeBadgeColor = "bg-yellow-100 text-yellow-800";
            qtyPrefix = "±";
            break;
          case "Void":
            typeBadgeColor = "bg-purple-100 text-purple-800";
            break;
        }

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${movement.id_movement}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${movement.movement_date}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${movement.item_name || "Item ID: " + movement.id_inventory_item}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeBadgeColor}">
              ${movement.movement_type}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-bold ${qtyPrefix === "-" ? "text-red-600" : qtyPrefix === "+" ? "text-green-600" : "text-gray-900"}">
            ${qtyPrefix}${movement.quantity}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${movement.username || "Sistema"}</td>
          <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title="${movement.notes || ""}">
            ${movement.notes || '<span class="text-gray-300">Ninguna</span>'}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <a href="editar.html?id=${movement.id_movement}" class="text-indigo-600 hover:underline">editar</a>
            <a href="eliminar.html?id=${movement.id_movement}" class="text-red-600 hover:underline ml-2">eliminar</a>
          </td>
        `;

        tableBody.appendChild(tr);
      });
    })
    .catch((error) =>
      console.error("Error al obtener los movimientos:", error),
    );
}

function guardarMovimiento() {
  const usuario = JSON.parse(localStorage.getItem("user"));

  const payload = {
    action: "insert",
    id_inventory_item: document.getElementById("idItem").value,
    user_id: 1, // temporal
    movement_type: document.getElementById("tipoMovimiento").value,
    quantity: document.getElementById("cantidad").value,
    notes: document.getElementById("notas").value,
  };

  fetch("../php/inventory_movements.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "error") {
        console.error(data.msg ?? data.message);
        return;
      }
      window.location.href = "inventory_movements.html";
    })
    .catch((error) => console.error("Error al guardar el movimiento:", error));
}

function cargarArticulos() {
  fetch("../php/inventory_movements.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "items" }),
  })
    .then((response) => response.json())
    .then((data) => {
      const select = document.getElementById("idItem");
      data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id_inventory_item;
        option.textContent = item.product_name || "Artículo #" + item.id_inventory_item;
        select.appendChild(option);
      });
    })
    .catch((error) => console.error("Error al cargar artículos:", error));
}