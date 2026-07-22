//En este archivo se van a agregar las funciones que hagan peticion a la base de datos
//Elimina el registro seleccionado mediante una petición al archivo PHP especificado.
export async function deleteRecords(file, recordSelectedID) {
  //Hacer peticion para eliminar el registro
  await fetch("../php/" + file + ".php", {
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

//Funcion que se ejecuta cuando el usuario da clic en el boton para guardar un registro
export async function saveRecords(file, form) {
  const formData = new FormData(form);
  const dataObject = Object.fromEntries(formData.entries());

  await fetch("../php/" + file + ".php", {
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

//Funcion que se ejecuta para cargar opciones dentro de un select, recibe el nombre del archivo y el id del select

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

export function loadRecordDataToForm(file, recordId, formId) {
  const form = document.getElementById(formId);
  if (!form) {
    console.error(`Form with ID "${formId}" was not found.`);
    return;
  }

  fetch("../php/" + file + ".php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "getInfoByID",
      id: recordId,
    }),
  })
    .then((response) => response.json())
    .then((recordData) => {
      if (recordData.error) {
        console.error("Server error:", recordData.error);
        return;
      }
      //document.getelemntById('nombre').value = productData.nombre;
      Object.keys(recordData).forEach((key) => {
        const input = form.elements[key];

        if (input) {
          input.value = recordData[key];
        }
      });

      console.log("Form successfully loaded with record ID:", recordId);
    })
    .catch(
      (error) => console.error("Error retrieving record information:", error), //error al recuperar la informacion del registro
    );
}

export function updateRecord(file, itemForm, id) {
  const formData = new FormData(itemForm);
  const dataObject = Object.fromEntries(formData.entries());

  fetch("../php/" + file + ".php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "update",
      id: id,
      ...dataObject,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      Swal.fire({
        title: "Updated",
        text: "Record updated successfully",
        icon: "success",
      });
    })
    .catch((error) => console.error("Error updating record:", error));
}

//Función para recuperar los registros
export function fetchRecords(file) {
  // Hace petición al archivo PHP usando el método POST.
  return fetch(`../php/${file}.php`, {
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
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    });
}
