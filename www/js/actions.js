document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("actionsTableBody");
  const formInsert = document.getElementById("formInsertAction");

  if (tableBody) {
    fetchActions();
  }

  if (formInsert) {
    cargarModulosSelect(document.getElementById("action_module"));
    
    document.getElementById("btnGuardar").addEventListener("click", () => {
      const name = document.getElementById("action_name").value;
      const desc = document.getElementById("action_description").value;
      const mod = document.getElementById("action_module").value;

      if (!name || !mod) return alert("Llena los campos obligatorios");

      fetch("../php/actions.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "insert", name: name, description: desc, id_module: mod })
      }).then(res => res.json()).then(data => {
        if (data.status === "success") window.location.href = "actions.html";
        else alert(data.msg);
      });
    });
  }
});

function fetchActions() {
  fetch("../php/actions.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "list" }),
  })
    .then((res) => res.json())
    .then((data) => {
      const tableBody = document.getElementById("actionsTableBody");
      tableBody.innerHTML = "";

      if (data.error) return console.error(data.error);

      data.forEach((item) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">#${item.id_action}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">${item.action_name}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              ${item.module_name || 'Módulo ID: ' + item.id_module}
            </span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-500">
            ${item.description || '<span class="text-gray-300 italic">Sin descripción</span>'}
          </td>
          <td class="px-6 py-4 text-sm font-medium">
            <a href="edit_action.html" class="text-indigo-600 hover:text-indigo-900 mr-3">Editar</a>
            <a href="delete_action.html" class="text-red-600 hover:text-red-900">Eliminar</a>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    });
}

function cargarModulosSelect(selectElement) {
  fetch("../php/actions.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "getModules" })
  }).then(res => res.json()).then(json => {
    if (json.status === "success") {
      selectElement.innerHTML = '<option value="">Selecciona un módulo...</option>';
      json.data.forEach(m => {
        selectElement.innerHTML += `<option value="${m.id_module}">${m.name}</option>`;
      });
    }
  });
}