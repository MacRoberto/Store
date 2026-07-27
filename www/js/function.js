// Guarda la fila y el ID seleccionado
let rowSelected = null;
let recordSelectedID = null;

// Marca una fila como seleccionada
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

// Limpia la selección actual
export function clearSelection() {
  if (rowSelected) {
    rowSelected.classList.remove("bg-indigo-100", "ring-2", "ring-indigo-400");
  }

  rowSelected = null;
  recordSelectedID = null;

  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");

  if (btnRemove) btnRemove.classList.add("hidden");
  if (btnEdit) btnEdit.classList.add("hidden");
}

// Carga una vista dentro del contenedor principal
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

// Devuelve el ID del registro seleccionado
export function getSelectedId() {
  return recordSelectedID;
}