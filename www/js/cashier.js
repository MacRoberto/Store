import { sendRequest } from "./api.js";
const formatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const cart = [];

let processingPayment = false;

export async function initView() {
  const searchInput = document.getElementById("searchInput");
  const btnSearch = document.getElementById("btnSearch");
  const paidInput = document.getElementById("paidInput");
  const btnPay = document.getElementById("btnPay");
  const paymentMethod = document.getElementById("paymentMethod");
  const btnClearCart = document.getElementById("btnClearCart");

  cart.length = 0;
  processingPayment = false;

  if (btnSearch) {
    btnSearch.addEventListener("click", async function (event) {
      event.preventDefault();

      await addProduct();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", async function (event) {
      if (event.key === "Enter") {
        event.preventDefault();

        await addProduct();
      }
    });
  }

  if (paidInput) {
    initPaidInput(paidInput);
  }

  if (paymentMethod) {
    paymentMethod.addEventListener("change", function () {
      changePaymentMethod();
    });
  }

  if (btnPay) {
    btnPay.addEventListener("click", async function (event) {
      event.preventDefault();

      await pay();
    });
  }

  if (btnClearCart) {
    btnClearCart.addEventListener("click", async function () {
      if (processingPayment || cart.length === 0) {
        return;
      }

      Swal.fire({
        title: "¿Clear cart?",
        text: "All added products will be removed.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, vaciar",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          clearSale();
        }
      });
    });
  }

  renderCart();
  changePaymentMethod();

  if (searchInput) {
    searchInput.focus();
  }
}

async function addProduct() {
  const searchInput = document.getElementById("searchInput");

  if (!searchInput || processingPayment) {
    return;
  }

  const query = searchInput.value.trim();

  if (!query) {
    searchInput.focus();
    return;
  }
  const payload = {
    action: "find",
    search: query,
  };
  const response = await sendRequest("products", payload);
  const product = response.product;
  if (response.status === "error") {
    await fireAlert({
      icon: "error",
      title: "Product not found",
      text: "No product found with that code",
    });

    searchInput.select();
    return;
  }

  const existingProduct = cart.find(function (item) {
    return String(item.id) === String(product.id);
  });

  const promotion =
    Array.isArray(product.promotions) && product.promotions.length > 0
      ? product.promotions[0]
      : null;

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      id_inventory_item: product.inventory_item_id,
      barcode: product.barcode,
      name: product.name,
      price: parseFloat(product.price) || 0,
      quantity: 1,

      id_promotion: promotion ? Number(promotion.id_promotion) : null,

      percent_off: promotion ? parseFloat(promotion.percent_off) || 0 : 0,
    });
  }

  searchInput.value = "";
  searchInput.focus();

  renderCart();
}

function renderCart() {
  const cartTableBody = document.getElementById("cartTableBody");

  if (!cartTableBody) {
    return;
  }

  cartTableBody.innerHTML = "";

  if (cart.length === 0) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td
        colspan="8"
        class="px-4 py-8 text-center text-sm text-gray-500"
      >
        No products added.
      </td>
    `;

    cartTableBody.appendChild(tr);

    updateChange();
    return;
  }

  cart.forEach(function (item, index) {
    const subtotal = item.price * item.quantity;
    const percentOff = Number(item.percent_off) || 0;

    const discountApplied = subtotal * (percentOff / 100);

    const finalTotal = subtotal - discountApplied;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="px-4 py-3 text-sm text-gray-900">
        ${item.id}
      </td>

      <td class="px-4 py-3 text-sm font-medium text-gray-900">
        ${item.name}
      </td>

      <td class="px-4 py-3 text-sm text-gray-700">
        ${money(item.price)}
      </td>

      <td class="px-4 py-3 text-sm">
        <input
          type="number"
          min="1"
          value="${item.quantity}"
          data-index="${index}"
          class="qty-input w-20 rounded-lg border border-gray-300 px-2 py-1"
        />
      </td>

      <td class="px-4 py-3 text-sm font-semibold text-gray-900">
        ${money(subtotal)}
      </td>

      <td class="px-4 py-3 text-sm font-semibold text-green-600">
        ${percentOff > 0 ? `${percentOff}%` : "-"}
      </td>

      <td class="px-4 py-3 text-sm font-semibold text-gray-900">
        ${money(finalTotal)}
      </td>

      <td class="px-4 py-3 text-sm">
        <button
          type="button"
          data-index="${index}"
          class="remove-btn text-red-600 hover:underline"
        >
          Quitar
        </button>
      </td>
    `;

    cartTableBody.appendChild(tr);
  });

  initQuantityInputs();
  initRemoveButtons();
  updateChange();
}

function initQuantityInputs() {
  const quantityInputs = document.querySelectorAll(".qty-input");

  quantityInputs.forEach(function (input) {
    input.addEventListener("change", function (event) {
      if (processingPayment) {
        renderCart();
        return;
      }

      const index = Number(event.target.dataset.index);

      let quantity = parseInt(event.target.value, 10) || 1;

      if (quantity < 1) {
        quantity = 1;
      }

      if (!cart[index]) {
        return;
      }

      cart[index].quantity = quantity;

      renderCart();
    });
  });
}

function initRemoveButtons() {
  const removeButtons = document.querySelectorAll(".remove-btn");

  removeButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      if (processingPayment) {
        return;
      }

      const index = Number(event.currentTarget.dataset.index);

      cart.splice(index, 1);

      renderCart();
    });
  });
}

function changePaymentMethod() {
  const paymentMethod = document.getElementById("paymentMethod");

  const cashPaymentSection = document.getElementById("cashPaymentSection");

  const cardPaymentSection = document.getElementById("cardPaymentSection");

  const paidInput = document.getElementById("paidInput");
  const btnPay = document.getElementById("btnPay");

  if (!paymentMethod || !cashPaymentSection || !cardPaymentSection || !btnPay) {
    return;
  }

  cashPaymentSection.classList.add("hidden");
  cardPaymentSection.classList.add("hidden");
  btnPay.classList.add("hidden");

  resetTerminalStatus();

  if (paymentMethod.value === "cash") {
    cashPaymentSection.classList.remove("hidden");
    btnPay.classList.remove("hidden");

    btnPay.textContent = "COBRAR EN EFECTIVO";

    if (paidInput) {
      paidInput.focus();
    }

    updateChange();
    return;
  }

  if (paymentMethod.value === "card") {
    cardPaymentSection.classList.remove("hidden");
    btnPay.classList.remove("hidden");

    btnPay.textContent = "COBRAR CON TERMINAL";

    if (paidInput) {
      paidInput.value = "";
    }

    updateChange();
    return;
  }

  if (paidInput) {
    paidInput.value = "";
  }

  updateChange();
}

async function pay() {
  const paymentMethod = document.getElementById("paymentMethod");

  if (processingPayment) {
    return;
  }

  if (cart.length === 0) {
    await fireAlert({
      icon: "warning",
      title: "Empty cart",
      text: "Add at least one product before checking out.",
    });

    return;
  }

  if (!paymentMethod || !paymentMethod.value) {
    await fireAlert({
      icon: "warning",
      title: "Select payment method",
      text: "You must select cash or card.",
    });

    return;
  }

  if (paymentMethod.value === "cash") {
    await processCashPayment();
    return;
  }

  if (paymentMethod.value === "card") {
    await processCardPayment();
  }
}

async function processCashPayment() {
  const paidInput = document.getElementById("paidInput");

  if (!paidInput) {
    return;
  }

  const paid = parseFloat(paidInput.value) || 0;
  const saleData = createSaleSnapshot();

  if (paid < saleData.total) {
    await fireAlert({
      icon: "error",
      title: "Insufficient payment",
      text: `The payment must be at least ${money(saleData.total)}`,
    });

    paidInput.focus();
    return;
  }

  const change = paid - saleData.total;

  await processSale(saleData, {
    paymentMethod: "cash",
    amountPaid: paid,
    changeAmount: change,
    terminalReference: null,
  });
}

const SIMULATION_ENABLED = true;
async function processCardPayment() {
  if (processingPayment) {
    return;
  }

  processingPayment = true;
  setProcessingState(true);

  const saleData = createSaleSnapshot();

  setTerminalStatus("waiting", "Creando orden de pago...");

  try {
    /*
     * Aquí conserva todo tu flujo actual:
     *
     * crear order
     * ejecutar simulación después de 5 segundos
     * esperar confirmación
     * revisar processed o failed
     */

    const rsOrder = await sendRequest("cashier", {
      action: "create_order",
      total_amount: Number(saleData.total.toFixed(2)),
    });

    if (rsOrder.success !== true || !rsOrder.order_id) {
      throw new Error(rsOrder.message || "Unable to create the order.");
    }

    const orderId = rsOrder.order_id;

    setTerminalStatus("waiting", "Waiting for terminal response...");

    /*
     * Simulación temporal.
     */
    if (SIMULATION_ENABLED) {
      simulateResponseAfterDelay(orderId).catch(function (error) {
        console.error("Error executing the simulation:", error);
      });
    }

    /*
     * Esperar confirmación de Mercado Pago.
     */
    const orderResult = await waitForOrderConfirmation(orderId);

    if (orderResult.status === "failed") {
      setTerminalStatus("rejected", "The operation was rejected.");

      await fireAlert({
        icon: "error",
        title: "Payment rejected",
        text: orderResult.status_detail || "The terminal rejected the payment.",
      });

      return;
    }

    if (orderResult.status === "canceled" || orderResult.status === "expired") {
      setTerminalStatus("rejected", "The operation was not completed.");

      await fireAlert({
        icon: "warning",
        title: "Payment not completed",
        text:
          orderResult.status === "canceled"
            ? "The operation was canceled."
            : "The payment order expired.",
      });

      return;
    }

    if (orderResult.status === "processed") {
      const paymentMethod = orderResult.payment_method_type || "credit_card";

      setTerminalStatus("approved", `Payment approved. Order: ${orderId}`);

      await processSale(saleData, {
        paymentMethod: paymentMethod,
        amountPaid: saleData.total,
        changeAmount: 0,
        terminalReference: orderId,
      });

      return;
    }

    throw new Error(`Status not recognized: ${orderResult.status}`);
  } catch (error) {
    console.error("Error while processing card payment:", error);

    setTerminalStatus("rejected", "Cannot complete the operation.");

    await fireAlert({
      icon: "error",
      title: "Error in the payment",
      text: error.message || "An unexpected error occurred.",
    });
  } finally {
    processingPayment = false;
    setProcessingState(false);
  }
}

async function processSale(saleData, paymentData) {
  /*
   * En efectivo, processSale administra el bloqueo.
   * En tarjeta, processCardPayment ya lo administra.
   */
  const managesProcessingState = !processingPayment;

  if (managesProcessingState) {
    processingPayment = true;
    setProcessingState(true);
  }

  try {
    const payload = {
      action: "pay",
      products: saleData.products,
      payment_method: paymentData.paymentMethod,

      total_amount: Number(saleData.total.toFixed(2)),

      amount_paid: Number(paymentData.amountPaid.toFixed(2)),

      change_amount: Number(paymentData.changeAmount.toFixed(2)),

      terminal_reference: paymentData.terminalReference,
    };

    const response = await sendRequest("cashier", payload);

    if (response.success !== true) {
      throw new Error(response.message || "Unable to register the sale.");
    }

    await fireAlert({
      icon: "success",
      title: "Sale processed",
      text:
        response.message ||
        `The sale was registered for ${money(saleData.total)}.`,
    });

    clearSale();
  } catch (error) {
    console.error("Error while registering the sale:", error);

    await fireAlert({
      icon: "error",
      title: "Error while registering the sale",
      text: error.message,
    });
  } finally {
    /*
     * Solo desbloquea cuando processSale
     * inició el bloqueo.
     */
    if (managesProcessingState) {
      processingPayment = false;
      setProcessingState(false);
    }
  }
}

function createSaleSnapshot() {
  const products = cart.map(function (item) {
    const subtotalBeforeDiscount = item.price * item.quantity;

    const percentOff = Number(item.percent_off) || 0;

    const discountApplied = subtotalBeforeDiscount * (percentOff / 100);

    const finalSubtotal = subtotalBeforeDiscount - discountApplied;

    return {
      product_id: item.id,
      quantity: item.quantity,
      barcode: item.barcode,
      inventory_item_id: item.id_inventory_item,

      unit_price: Number(item.price.toFixed(2)),

      id_promotion: item.id_promotion || null,

      percent_off: Number(percentOff.toFixed(2)),

      discount_applied: Number(discountApplied.toFixed(2)),

      subtotal: Number(finalSubtotal.toFixed(2)),
    };
  });

  return {
    products: products,
    total: Number(getTotal().toFixed(2)),
  };
}

function initPaidInput(paidInput) {
  paidInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();

      pay();
      return;
    }

    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      return;
    }

    if (!/[0-9.]/.test(event.key)) {
      event.preventDefault();
    }
  });

  paidInput.addEventListener("beforeinput", function (event) {
    if (event.data && /[^0-9.]/.test(event.data)) {
      event.preventDefault();
    }
  });

  paidInput.addEventListener("input", function () {
    let value = paidInput.value.replace(/[^0-9.]/g, "");

    const firstDot = value.indexOf(".");
    if (firstDot !== -1) {
      value =
        value.slice(0, firstDot + 1) +
        value.slice(firstDot + 1).replace(/\./g, "");
    }

    let [integer = "", decimal = ""] = value.split(".");
    integer = integer.slice(0, 7);
    decimal = decimal.slice(0, 2);

    paidInput.value = decimal.length > 0 ? `${integer}.${decimal}` : integer;
    updateChange();
  });
}

function updateChange() {
  const paidInput = document.getElementById("paidInput");
  const changeLabel = document.getElementById("changeLabel");
  const totalLabel = document.getElementById("totalLabel");

  const total = getTotal();

  if (totalLabel) {
    totalLabel.textContent = money(total);
  }

  if (!paidInput || !changeLabel) {
    return;
  }

  const paid = parseFloat(paidInput.value) || 0;
  const change = paid - total;

  changeLabel.textContent = money(change > 0 ? change : 0);
}

function getTotal() {
  return cart.reduce(function (sum, item) {
    const subtotal = item.price * item.quantity;
    const percentOff = Number(item.percent_off) || 0;

    const discountApplied = subtotal * (percentOff / 100);

    const finalTotal = subtotal - discountApplied;

    return sum + finalTotal;
  }, 0);
}

function money(value) {
  return formatter.format(Number(value) || 0);
}

function setTerminalStatus(type, message) {
  const terminalStatus = document.getElementById("terminalStatus");

  if (!terminalStatus) {
    return;
  }

  terminalStatus.classList.remove(
    "hidden",
    "bg-blue-50",
    "text-blue-700",
    "bg-green-50",
    "text-green-700",
    "bg-red-50",
    "text-red-700",
  );

  if (type === "approved") {
    terminalStatus.classList.add("bg-green-50", "text-green-700");
  } else if (type === "rejected") {
    terminalStatus.classList.add("bg-red-50", "text-red-700");
  } else {
    terminalStatus.classList.add("bg-blue-50", "text-blue-700");
  }

  terminalStatus.textContent = message;
}

function resetTerminalStatus() {
  const terminalStatus = document.getElementById("terminalStatus");

  if (!terminalStatus) {
    return;
  }

  terminalStatus.classList.add("hidden");

  terminalStatus.classList.remove(
    "bg-green-50",
    "text-green-700",
    "bg-red-50",
    "text-red-700",
  );

  terminalStatus.classList.add("bg-blue-50", "text-blue-700");

  terminalStatus.textContent = "Waiting for terminal response...";
}

function clearSale() {
  const paidInput = document.getElementById("paidInput");
  const paymentMethod = document.getElementById("paymentMethod");

  const cashPaymentSection = document.getElementById("cashPaymentSection");

  const cardPaymentSection = document.getElementById("cardPaymentSection");

  const btnPay = document.getElementById("btnPay");
  const searchInput = document.getElementById("searchInput");

  cart.length = 0;

  if (paidInput) {
    paidInput.value = "";
  }

  if (paymentMethod) {
    paymentMethod.value = "";
  }

  if (cashPaymentSection) {
    cashPaymentSection.classList.add("hidden");
  }

  if (cardPaymentSection) {
    cardPaymentSection.classList.add("hidden");
  }

  if (btnPay) {
    btnPay.classList.add("hidden");
    btnPay.textContent = "COBRAR";
  }

  resetTerminalStatus();
  renderCart();

  if (searchInput) {
    searchInput.value = "";
    searchInput.focus();
  }
}

function setProcessingState(isProcessing) {
  const btnPay = document.getElementById("btnPay");

  const btnSearch = document.getElementById("btnSearch");

  const searchInput = document.getElementById("searchInput");

  const paymentMethod = document.getElementById("paymentMethod");

  const btnClearCart = document.getElementById("btnClearCart");

  const paidInput = document.getElementById("paidInput");

  if (btnPay) {
    btnPay.disabled = isProcessing;

    if (isProcessing) {
      btnPay.textContent = "WAITING FOR TERMINAL...";
    } else {
      updatePayButtonText();
    }
  }

  if (btnSearch) {
    btnSearch.disabled = isProcessing;
  }

  if (searchInput) {
    searchInput.disabled = isProcessing;
  }

  if (paymentMethod) {
    paymentMethod.disabled = isProcessing;
  }

  if (btnClearCart) {
    btnClearCart.disabled = isProcessing;
  }

  if (paidInput) {
    paidInput.disabled = isProcessing;
  }

  document
    .querySelectorAll(".qty-input, .remove-btn")
    .forEach(function (element) {
      element.disabled = isProcessing;
    });
}

function updatePayButtonText() {
  const paymentMethod = document.getElementById("paymentMethod");
  const btnPay = document.getElementById("btnPay");

  if (!paymentMethod || !btnPay) {
    return;
  }

  if (paymentMethod.value === "cash") {
    btnPay.textContent = "PAY WITH CASH";
  } else if (paymentMethod.value === "card") {
    btnPay.textContent = "PAY WITH CARD";
  } else {
    btnPay.textContent = "PAY";
  }
}

function fireAlert(options) {
  const modal = window.sweetAlert || window.Swal;

  if (modal && typeof modal.fire === "function") {
    return modal.fire(options);
  }

  const title = options.title || "";
  const text = options.text || "";

  if (options.showCancelButton) {
    const confirmed = window.confirm(`${title}\n\n${text}`);

    return Promise.resolve({
      isConfirmed: confirmed,
      isDenied: false,
    });
  }

  window.alert(`${title}\n\n${text}`);

  return Promise.resolve({
    isConfirmed: true,
    isDenied: false,
  });
}

async function simulateResponseAfterDelay(orderId) {
  /*
   * Esta función existe únicamente
   * durante las pruebas.
   */
  await new Promise(function (resolve) {
    setTimeout(resolve, 5000);
  });

  const response = await sendRequest("cashier", {
    action: "simulate_order",
    order_id: orderId,
  });

  if (response.success !== true) {
    throw new Error(response.message || "Unable to execute the simulation.");
  }

  console.log("Simulated response sent:", response);

  return response;
}

async function waitForOrderConfirmation(orderId) {
  const maxAttempts = 30;
  const interval = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await sendRequest("cashier", {
      action: "get_order",
      order_id: orderId,
    });

    if (response.success !== true) {
      throw new Error(response.message || "Unable to consult the order.");
    }

    console.log(`Consulta ${attempt}:`, response.status);

    if (
      response.status === "processed" ||
      response.status === "failed" ||
      response.status === "canceled" ||
      response.status === "expired"
    ) {
      return response;
    }

    await new Promise(function (resolve) {
      setTimeout(resolve, interval);
    });
  }

  throw new Error("No final response received from Mercado Pago.");
}
