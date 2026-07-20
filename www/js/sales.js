import {
  rowClick,
  deleteRecords,
  editRecords,
  saveRecords,
  loadView,
  loadSelectOptions,
  setupGoBackButton,
  getSelectedId,
  clearSelection,
} from "./function.js";

let selectedRecord = null;

document.addEventListener("DOMContentLoaded", () => {
  fetchSales();

  const btnAdd = document.getElementById("btnAdd");
  const btnEdit = document.getElementById("btnEdit");
  const btnRemove = document.getElementById("btnRemove");
  const btnCancelForm = document.getElementById("btnCancelForm");
  const saleForm = document.getElementById("saleForm");

  btnAdd.addEventListener("click", () => openForm());

  btnEdit.addEventListener("click", () => {
    if (selectedRecord) {
      openForm(selectedRecord);
    }
  });

  btnRemove.addEventListener("click", () => {
    if (selectedRecord) {
      deleteRecord(selectedRecord.id_sale);
    }
  });

  btnCancelForm.addEventListener("click", closeForm);
  saleForm.addEventListener("submit", handleFormSubmit);
});

// Obtiene los registros de ventas
function fetchSales() {
  fetch("../php/sales.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "list",
    }),
  })
    .then((response) => response.text())
    .then((text) => {
      let json;

      try {
        json = JSON.parse(text);
      } catch (error) {
        console.error("The response is not valid JSON:", text);
        throw error;
      }

      const tableBody = document.getElementById("salesTableBody");
      tableBody.innerHTML = "";

      const sales = Array.isArray(json) ? json : json.data;

      if (!Array.isArray(sales)) {
        console.error(json.msg || "Sales could not be loaded");
        return;
      }

      sales.forEach((sale) => {
        const tr = document.createElement("tr");
        tr.className = "cursor-pointer hover:bg-gray-50 transition";

        const currencyFormatter = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        });

        let statusBadgeColor = "bg-gray-100 text-gray-800";
        switch (sale.status) {
          case "Completed":
            statusBadgeColor = "bg-green-100 text-green-800";
            break;
          case "Refunded":
            statusBadgeColor = "bg-amber-100 text-amber-800";
            break;
          case "Voided":
            statusBadgeColor = "bg-red-100 text-red-800";
            break;
        }

        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">#${escapeHtml(sale.id_sale)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(sale.transaction_date)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(sale.username || "User #" + sale.user_id)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800">
              ${escapeHtml(sale.payment_method)}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
            ${currencyFormatter.format(Number(sale.total_amount))}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColor}">
              ${escapeHtml(sale.status)}
            </span>
          </td>
        `;

        tr.addEventListener("click", (event) => {
          selectedRecord = sale;
          rowClick(event, sale.id_sale);
        });

        tableBody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Error loading sales:", error));
}

// Opens the form
function openForm(record = null) {
  const tableCard = document.getElementById("tableCard");
  const formCard = document.getElementById("formCard");
  const formTitle = document.getElementById("formTitle");

  const idSale = document.getElementById("id_sale");
  const userSelect = document.getElementById("user_id");
  const totalAmount = document.getElementById("total_amount");
  const paymentMethod = document.getElementById("payment_method");
  const status = document.getElementById("status");

  tableCard.classList.add("hidden");
  formCard.classList.remove("hidden");

  formTitle.textContent = record ? "Edit Sale" : "Add Sale";

  idSale.value = record?.id_sale ?? "";
  totalAmount.value = record?.total_amount ?? "";
  paymentMethod.value = record?.payment_method ?? "";
  status.value = record?.status ?? "";

  loadUsersForSelect(record?.user_id ?? "");
}

// Closes the form
function closeForm() {
  document.getElementById("formCard").classList.add("hidden");
  document.getElementById("tableCard").classList.remove("hidden");

  document.getElementById("saleForm").reset();
  document.getElementById("id_sale").value = "";

  clearSelection();
  selectedRecord = null;
}

// Loads users in the select
function loadUsersForSelect(selectedValue = "") {
  const userSelect = document.getElementById("user_id");

  fetch("../php/sales.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "selectOptions",
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      const users = Array.isArray(json) ? json : json.data;

      if (!Array.isArray(users)) {
        userSelect.innerHTML = `<option value="">Users could not be loaded</option>`;
        return;
      }

      userSelect.innerHTML = `<option value="">Select a User</option>`;

      users.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.name;

        if (String(selectedValue) === String(user.id)) {
          option.selected = true;
        }

        userSelect.appendChild(option);
      });
    })
    .catch(() => {
      userSelect.innerHTML = `<option value="">Users could not be loaded</option>`;
    });
}

// Saves or updates
function handleFormSubmit(event) {
  event.preventDefault();

  const idSale = document.getElementById("id_sale").value.trim();
  const userId = document.getElementById("user_id").value.trim();
  const totalAmount = document.getElementById("total_amount").value.trim();
  const paymentMethod = document.getElementById("payment_method").value.trim();
  const status = document.getElementById("status").value.trim();

  const payload = {
    action: idSale ? "edit" : "save",
    id_sale: idSale,
    user_id: userId,
    total_amount: totalAmount,
    payment_method: paymentMethod,
    status: status,
  };

  fetch("../php/sales.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((json) => {
      if (json.status === "success") {
        Swal.fire("Success", json.msg || "Sale saved successfully.", "success");
        closeForm();
        fetchSales();
      } else {
        Swal.fire("Error", json.msg || "The sale could not be saved.", "error");
      }
    })
    .catch((error) => {
      console.error("Error saving:", error);
      Swal.fire("Error", "The sale could not be saved.", "error");
    });
}

// Deletes the selected sale
function deleteRecord(id) {
  Swal.fire({
    title: "Delete Sale?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (!result.isConfirmed) return;

    fetch("../php/sales.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "delete",
        id_sale: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status === "success") {
          Swal.fire("Success", json.msg || "Sale deleted successfully.", "success");
          closeForm();
          fetchSales();
        } else {
          Swal.fire("Error", json.msg || "The sale could not be deleted.", "error");
        }
      });
  });
}

// Escapes text for HTML
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}