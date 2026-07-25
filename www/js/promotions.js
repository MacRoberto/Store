import {
  deleteRecords,
  updateRecord,
  saveRecords,
  loadSelectOptions,
  loadRecordDataToForm,
  fetchRecords,
} from "./api.js";

import { initView as initViewMain } from "./enviroment.js";

import { rowClick, loadView, getSelectedId } from "./function.js";

export async function initView() {
  const promotions = await fetchRecords("promotions");
  const tableBody = document.getElementById("promotionsTableBody");
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnAdd = document.getElementById("btnAdd");
  const btnGoBack = document.getElementById("goback");
  //Detecta cuando el usuario da clic en el boton de eliminar
  btnRemove.addEventListener("click", async function (event) {
    //Se muestra la alerta para que confirme la eliminación del registro seleccionado
    Swal.fire({
      title: "¿Are you sure to delete this record?",
      text: "You won't be able to revert this action",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        //Hacer peticion para eliminar el registro
        await deleteRecords("promotions", getSelectedId());
        // Volver a cargar el listado para reflejar la eliminación.
        await loadPromotionsView();
      }
    });
  });

  if (btnEdit) {
    btnEdit.addEventListener("click", async function () {
      const id = getSelectedId();
      await loadView("../views/forms/promotions.html", "content");
      await initPromotionForm("edit", id);
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener("click", async function () {
      await loadView("../views/forms/promotions.html", "content");
      await initPromotionForm("add");
    });
  }

  if (tableBody) {
    promotions.forEach((promotion) => {
      const tr = document.createElement("tr");

      const statusBadgeColor =
        promotion.status === "Active"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800";

      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${promotion.id_promotion}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${promotion.promotion_name || "-"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${promotion.description}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${promotion.date_start || "Sin Producto"}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${promotion.date_end}%</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${promotion.percent_off}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${promotion.product_name}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColor}">
            ${promotion.status}
          </span>
        </td>
      `;

      //Se agrega evento a cada fila
      tr.addEventListener("click", function (event) {
        rowClick(event, promotion.id_promotion); //Se manda a llamar el evento on click y se le pasa el objeto promoción
      });

      tableBody.appendChild(tr);
    });
  }

  if (btnGoBack) {
    btnGoBack.addEventListener("click", async function (event) {
      event.preventDefault();

      await initViewMain();
    });
  }
}

async function loadPromotionsView() {
  await loadView("../views/promotions.html", "content");
  await initView();
}

async function initPromotionForm(mode, id = null) {
  try {
    const form = document.getElementById("itemForm");
    const btnGoBack = document.getElementById("goback");

    // Si se está editando, cargar los datos de la promocion.
    if (mode === "edit" && id) {
      await loadRecordDataToForm("promotions", id, "itemForm");
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      try {
        if (mode === "edit") {
          Swal.fire({
            title: "¿Are you sure to update this record?",
            text: "This will overwrite the existing information",
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update",
            cancelButtonText: "Cancel",
          }).then(async (result) => {
            if (result.isConfirmed) {
              await updateRecord("promotions", form, id);
              // Después de guardar, regresar al listado.
              await loadPromotionsView();
            }
          });
        } else {
          Swal.fire({
            title: "¿Are you sure to Add record?",
            text: "Please confirm that the data is correct",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, save",
            cancelButtonText: "Cancel",
          }).then(async (result) => {
            if (result.isConfirmed) {
              await saveRecords("promotions", form);
              // Después de guardar, regresar al listado.
              await loadPromotionsView();
            }
          });
        }
      } catch (error) {
        console.error("Error to save the promotion:", error);
      }
    });

    if (btnGoBack) {
      btnGoBack.addEventListener("click", async function (event) {
        event.preventDefault();

        await loadPromotionsView();
      });
    }
  } catch (error) {
    console.error("Error to initialize the promotion form:", error);
  }
}
