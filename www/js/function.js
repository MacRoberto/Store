// En este archivo se van a agregar funciones que no hagan peticiones a la base de datos

// Variables globales
let rowSelected = null; // Variable donde se almacena la fila donde el usuario dio click
let recordSelectedID = null; // Variable para almacenar el id del registro seleccionado

// Función que se ejecuta cuando se hace click en la fila de la tabla
// Se usa para mostrar u ocultar el botón que sirve para eliminar un registro
export function rowClick(event, dataID) {
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");

  const tr = event.currentTarget;

  if (rowSelected) {
    rowSelected.classList.remove("bg-indigo-100", "ring-2", "ring-indigo-400");
  }

  rowSelected = tr;
  recordSelectedID = dataID;

  tr.classList.add("bg-indigo-100", "ring-2", "ring-indigo-400");

  if (btnRemove) btnRemove.classList.remove("hidden");
  if (btnEdit) btnEdit.classList.remove("hidden");
}

// Función para cargar una vista dentro de un contenedor
export function loadView(file, containerId) {
  const container = document.getElementById(containerId);

  return fetch(file)
    .then((response) => response.text())
    .then((html) => {
      container.innerHTML = html;
    })
    .catch((error) => {
      console.error("Error loading view:", error);

      Swal.fire({
        title: "Error",
        text: "The form could not be loaded.",
        icon: "error",
      });
    });
}

// Función para guardar un nuevo registro
export function saveRecords(file, form) {
  const formData = new FormData(form);
  const dataObject = Object.fromEntries(formData.entries());

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
      fetch("../php/" + file + ".php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "save",
          ...dataObject,
        }),
      })
        .then((response) => response.json())
        .then(() => {
          Swal.fire({
            title: "Saved",
            text: "Record saved successfully",
            icon: "success",
          });
        })
        .catch((error) => console.error("Error saving record:", error));
    }
  });
}

// Función para cargar opciones dentro de un select
export function loadSelectOptions(file, selectId) {
  fetch("../php/" + file + ".php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "selectOptions",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const select = document.getElementById(selectId);
      if (!select) return;

      select.innerHTML = "";

      data.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.id;
        optionElement.textContent = option.name;
        select.appendChild(optionElement);
      });
    })
    .catch((error) => console.error("Error loading select options:", error));
}

// Limpia la fila seleccionada y oculta los botones
export function clearSelection() {
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");

  if (rowSelected) {
    rowSelected.classList.remove("bg-indigo-100", "ring-2", "ring-indigo-400");
    rowSelected = null;
  }

  recordSelectedID = null;

  if (btnRemove) btnRemove.classList.add("hidden");
  if (btnEdit) btnEdit.classList.add("hidden");
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

// Obtiene el ID seleccionado
export function getSelectedId() {
  return recordSelectedID;
}