document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const btnSearch = document.getElementById("btnSearch");
  const cartTableBody = document.getElementById("cartTableBody");
  const totalLabel = document.getElementById("totalLabel");
  const paidInput = document.getElementById("paidInput");
  const changeLabel = document.getElementById("changeLabel");

  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  });

  const cart = [];

  function money(value) {
    return formatter.format(Number(value) || 0);
  }

  function total() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function updateChange() {
    const paid = parseFloat(paidInput.value) || 0;
    const change = paid - total();
    changeLabel.textContent = money(change > 0 ? change : 0);
    totalLabel.textContent = money(total());
  }

  function renderCart() {
    cartTableBody.innerHTML = "";

    cart.forEach((item, index) => {
      const subtotal = item.price * item.quantity;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-4 py-3 text-sm text-gray-900">${item.id}</td>
        <td class="px-4 py-3 text-sm font-medium text-gray-900">${item.name}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${money(item.price)}</td>
        <td class="px-4 py-3 text-sm">
          <input
            type="number"
            min="1"
            value="${item.quantity}"
            data-index="${index}"
            class="qty-input w-20 rounded-lg border border-gray-300 px-2 py-1"
          />
        </td>
        <td class="px-4 py-3 text-sm font-semibold text-gray-900">${money(subtotal)}</td>
        <td class="px-4 py-3 text-sm">
          <button data-index="${index}" class="remove-btn text-red-600 hover:underline" type="button">
            Quitar
          </button>
        </td>
      `;
      cartTableBody.appendChild(tr);
    });

    document.querySelectorAll(".qty-input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const index = Number(e.target.dataset.index);
        let qty = parseInt(e.target.value, 10) || 1;
        if (qty < 1) qty = 1;
        cart[index].quantity = qty;
        renderCart();
      });
    });

    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = Number(e.target.dataset.index);
        cart.splice(index, 1);
        renderCart();
      });
    });

    updateChange();
  }

  async function findProduct(query) {
    try {
      const response = await fetch("../php/cashier.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "find",
          query: query.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === "error") {
        return null;
      }

      return data.product;
    } catch (error) {
      console.error("Error buscando producto:", error);
      return null;
    }
  }

  async function addProduct() {
    const query = searchInput.value.trim();
    if (!query) return;

    const product = await findProduct(query);

    if (!product) {
      alert("Producto no encontrado");
      searchInput.select();
      return;
    }

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price) || 0,
        quantity: 1,
      });
    }

    searchInput.value = "";
    searchInput.focus();
    renderCart();
  }

  paidInput.addEventListener("keydown", (e) => {
    const allowedKeys = [
      "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight",
      "Home", "End", "Enter"
    ];

    if (allowedKeys.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;
    if (!/[0-9.]/.test(e.key)) e.preventDefault();
  });

  paidInput.addEventListener("beforeinput", (e) => {
    if (e.data && /[^0-9.]/.test(e.data)) {
      e.preventDefault();
    }
  });

  paidInput.addEventListener("input", () => {
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

  btnSearch.addEventListener("click", (e) => {
    e.preventDefault();
    addProduct();
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addProduct();
    }
  });

  renderCart();
});