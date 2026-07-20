// Variables globales
let rowSelected = null;
let recordSelectedID = null;

// Obtiene el ID seleccionado
export function getSelectedId() {
  return recordSelectedID;
}

// Selecciona una fila y muestra los botones de edición y eliminación
export function rowClick(event, id) {
  const btnEdit = document.getElementById("btnEdit");
  const btnRemove = document.getElementById("btnRemove");
  const currentRow = event.currentTarget;

  if (rowSelected) {
    rowSelected.classList.remove("bg-indigo-100", "ring-2", "ring-indigo-400");
  }

  rowSelected = currentRow;
  recordSelectedID = id;
  window.recordSelectedID = id;

  currentRow.classList.add("bg-indigo-100", "ring-2", "ring-indigo-400");

  if (btnEdit) btnEdit.classList.remove("hidden");
  if (btnRemove) btnRemove.classList.remove("hidden");
}

// Limpia la selección actual
export function clearSelection() {
  const btnEdit = document.getElementById("btnEdit");
  const btnRemove = document.getElementById("btnRemove");

  if (rowSelected) {
    rowSelected.classList.remove("bg-indigo-100", "ring-2", "ring-indigo-400");
  }

  rowSelected = null;
  recordSelectedID = null;
  window.recordSelectedID = null;

  if (btnEdit) btnEdit.classList.add("hidden");
  if (btnRemove) btnRemove.classList.add("hidden");
}

// Carga una vista dentro de un contenedor
export function loadView(url, containerId = "content") {
  const container = document.getElementById(containerId);

  if (!container) {
    console.warn(`Container with ID "${containerId}" was not found.`);
    return;
  }

  return fetch(url)
    .then((response) => response.text())
    .then((html) => {
      container.innerHTML = html;
    })
    .catch((error) => {
      console.error("Error loading view:", error);

      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Error",
          text: "The form could not be loaded.",
          icon: "error",
        });
      }
    });
}

// Carga opciones en un select desde el PHP
export function loadSelectOptions(arg1, arg2, arg3) {
  let selectId = "";
  let endpoint = "";
  let action = "selectOptions";

  if (typeof arg3 !== "undefined") {
    selectId = arg1;
    endpoint = arg2;
    action = arg3;
  } else {
    endpoint = "../php/" + arg1 + ".php";
    selectId = arg2;
  }

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action }),
  })
    .then((response) => response.json())
    .then((json) => {
      const select = document.getElementById(selectId);
      if (!select) return;

      const data = Array.isArray(json) ? json : json.data;

      if (!Array.isArray(data)) {
        return;
      }

      select.innerHTML = `<option value="">Seleccione una opción</option>`;

      data.forEach((item) => {
        const option = document.createElement("option");
        option.value =
          item.id ?? item.value ?? item.id_user ?? item.id_module ?? "";
        option.textContent =
          item.name ??
          item.label ??
          item.username ??
          item.description ??
          item.title ??
          "Opción";
        select.appendChild(option);
      });
    })
    .catch((error) => console.error("Error loading select options:", error));
}

// Guarda un registro
export function saveRecords(arg1, arg2, arg3) {
  let endpoint = "";
  let payload = null;
  let onSuccess = null;

  if (arg2 instanceof HTMLFormElement) {
    endpoint = "../php/" + arg1 + ".php";
    const formData = new FormData(arg2);
    payload = Object.fromEntries(formData.entries());
    payload.action = "save";
  } else {
    endpoint = arg1;
    payload = arg2;
    onSuccess = typeof arg3 === "function" ? arg3 : null;
  }

  const sendRequest = () => {
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status === "success") {
          if (onSuccess) onSuccess(json);
        } else {
          Swal.fire("Error", json.msg || "No se pudo guardar el registro", "error");
        }
      })
      .catch((error) => console.error("Error saving record:", error));
  };

  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "¿Are you sure to Add record?",
      text: "Please confirm that the data is correct",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        sendRequest();
      }
    });
  } else {
    sendRequest();
  }
}

// Edita un registro
export function editRecords(arg1, arg2, arg3) {
  let endpoint = "";
  let payload = null;
  let onSuccess = null;

  if (typeof arg3 === "undefined" && typeof arg1 === "string" && arg1.endsWith(".php") === false) {
    endpoint = "../php/" + arg1 + ".php";
    payload = {
      action: "edit",
      id: recordSelectedID,
      ...arg2,
    };
  } else if (typeof arg3 === "undefined" && typeof arg1 === "string") {
    endpoint = "../php/" + arg1 + ".php";
    payload = {
      action: "edit",
      id: recordSelectedID,
      ...arg2,
    };
  } else {
    endpoint = arg1;
    payload = arg2;
    onSuccess = typeof arg3 === "function" ? arg3 : null;
  }

  const sendRequest = () => {
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status === "success") {
          if (onSuccess) onSuccess(json);
        } else {
          Swal.fire("Error", json.msg || "No se pudo actualizar el registro", "error");
        }
      })
      .catch((error) => console.error("Error updating record:", error));
  };

  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "¿Are you sure to update this record?",
      text: "This will overwrite the existing information",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        sendRequest();
      }
    });
  } else {
    sendRequest();
  }
}

// Elimina un registro
export function deleteRecords(arg1, arg2, arg3) {
  let endpoint = "";
  let payload = null;
  let onSuccess = null;

  if (typeof arg2 === "undefined") {
    endpoint = "../php/" + arg1 + ".php";
    payload = {
      action: "delete",
      id: recordSelectedID,
    };
  } else {
    endpoint = arg1;
    payload = arg2;
    onSuccess = typeof arg3 === "function" ? arg3 : null;
  }

  const sendRequest = () => {
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status === "success") {
          if (onSuccess) onSuccess(json);
        } else {
          Swal.fire("Error", json.msg || "No se pudo eliminar el registro", "error");
        }
      })
      .catch((error) => console.error("Error deleting record:", error));
  };

  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "¿Are you sure to delete this record?",
      text: "You won't be able to revert this action",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        sendRequest();
      }
    });
  } else {
    sendRequest();
  }
}

// Función para cargar el botón de regresar a la vista anterior
export function setupGoBackButton(buttonId) {
  const button = document.getElementById(buttonId);

  if (button) {
    button.addEventListener("click", () => {
      window.history.back();
    });
  } else {
    console.warn(`Go Back button with ID "${buttonId}" was not found.`);
  }
}

// Carga información de un producto en un formulario
export function loadProductDataToForm(productId, formId) {
  const form = document.getElementById(formId);

  if (!form) {
    console.error(`Form with ID "${formId}" was not found.`);
    return;
  }

  fetch("../php/products.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "getInfoProduct",
      id: productId,
    }),
  })
    .then((response) => response.json())
    .then((productData) => {
      if (productData.error) {
        console.error("Server error:", productData.error);
        return;
      }

      Object.keys(productData).forEach((key) => {
        const input = form.elements[key];
        if (input) {
          input.value = productData[key];
        }
      });

      console.log("Form successfully loaded with product ID:", productId);
    })
    .catch((error) => console.error("Error retrieving product information:", error));
}

// Escapa texto para insertarlo en HTML
export function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}