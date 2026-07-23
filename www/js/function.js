//En este archivo se van a agregar funciones que no hagan peticiones a la base de datos

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

export function getSelectedId() {
  return recordSelectedID;
}

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