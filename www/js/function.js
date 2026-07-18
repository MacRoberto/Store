//Variables globales
let rowSelected = null; //variable donde se almacena la fila donde el usuario dio click
let recordSelectedID = null; // variable para almacenar el id del producto dependiendo en que fila dio click el usuario

//Funcion que se ejecuta cuando se hace click en la fila de la tabla
//Se usa para mostrar u ocultar el boton que sirve para eliminar un registro
export function rowClick(event, dataID) {
  //Mostrar boton para eliminar
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");

  // Obtener el tr donde se hizo click
  const tr = event.currentTarget;
  // Quitar color a la fila seleccionada anteriormente
  if (rowSelected) {
    rowSelected.classList.remove("bg-indigo-100", "ring-2", "ring-indigo-400");
  }

  // Guardar la fila y el producto seleccionado
  rowSelected = tr;
  recordSelectedID = dataID;
  // Agregar color a la nueva fila seleccionada
  tr.classList.add("bg-indigo-100", "ring-2", "ring-indigo-400");

  // Mostrar botón eliminar
  btnRemove.classList.remove("hidden"); //Quitar la clase hidden para hacer visible el boton
  btnEdit.classList.remove("hidden");
}

//Funcion que se ejecuta cuando el usuario da clic en el boton de eliminar
export function deleteRecords(file) {
  //products
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
      //Hacer peticion para eliminar el registro
      fetch("../php/" + file + ".php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          id: recordSelectedID,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          Swal.fire({
            title: "Deleted",
            text: "Record deleted successfully",
            icon: "success",
          });
        })
        .catch((error) => console.error("Error deleting record:", error));
    }
  });
}

//Funcion que se ejecuta cuando el usuario da clic en el boton de editar
export function editRecords(file, data) {
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
      fetch("../php/" + file + ".php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "edit",
          id: recordSelectedID,
          ...data,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          Swal.fire({
            title: "Updated",
            text: "Record updated successfully",
            icon: "success",
          });
        })
        .catch((error) => console.error("Error updating record:", error));
    }
  });
}

export function loadView(file, containerId) {
  //Vista de formulario
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
        .then((data) => {
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

export function loadSelectOptions(file, selectId) {
  fetch("../php/" + file + ".php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "selectOptions", //lista de categorias desde la bd para llenar el select
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const select = document.getElementById(selectId);
      console.log(select);
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

//Función para cargar el boton de regresar a la vista anterior

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
