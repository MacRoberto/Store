document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("usersTableBody");
    const formUser = document.getElementById("form-user");
    const idUserInput = document.getElementById("id_user");
    const usernameInput = document.getElementById("username");
    const idRolInput = document.getElementById("id_rol");
    const statusInput = document.getElementById("status");

    const formTitle = document.getElementById("form-title");
    const btnSubmit = document.getElementById("btn-submit");
    const btnCancel = document.getElementById("btn-cancel");

    getAllUsers();

    function getAllUsers() {
        fetch("../php/users.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "list" }),
        })
        .then(res => res.json())
        .then((data) => {
            tableBody.innerHTML = "";

            if (data.error) {
                console.error(data.error);
                return;
            }

            data.forEach((user) => {
                const tr = document.createElement("tr");
                const statusBadgeColor = user.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">${user.id_user}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${user.username}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-800">
                            ${user.role_name || "Rol ID: " + user.id_rol}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColor}">
                            ${user.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                        <button class="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-semibold btn-edit" data-user='${JSON.stringify(user)}'>Editar</button>
                        <button class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold btn-delete" data-id="${user.id_user}">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
            asignarEventos();
        })
        .catch((error) => console.error("Error al obtener los usuarios:", error));
    }

    formUser.addEventListener("submit", (e) => {
        e.preventDefault();
        const id_user = idUserInput.value;

        const payload = {
            action: id_user ? "update" : "create",
            username: usernameInput.value,
            id_rol: idRolInput.value,
            status: statusInput.value
        };
        if (id_user) payload.id_user = id_user;

        fetch("../php/users.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(json => {
            if (json.status === "success") {
                alert(json.message);
                resetForm();
                getAllUsers();
            } else {
                alert("Error: " + json.message);
            }
        });
    });

    function asignarEventos() {
        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.onclick = (e) => {
                const user = JSON.parse(e.target.getAttribute("data-user"));
                idUserInput.value = user.id_user;
                usernameInput.value = user.username;
                idRolInput.value = user.id_rol;
                statusInput.value = user.status;

                formTitle.textContent = "✏️ Editar Usuario #" + user.id_user;
                btnSubmit.textContent = "Actualizar";
                btnSubmit.className = "w-full px-4 py-2 bg-amber-500 text-white font-medium text-sm rounded-md hover:bg-amber-600 transition";
                btnCancel.classList.remove("hidden");
            };
        });

        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.getAttribute("data-id");
                if (confirm(`¿Seguro que deseas eliminar al usuario #${id}?`)) {
                    fetch("../php/users.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "delete", id_user: id })
                    })
                    .then(res => res.json())
                    .then(json => {
                        if (json.status === "success") {
                            alert(json.message);
                            getAllUsers();
                        } else {
                            alert("Error: " + json.message);
                        }
                    });
                }
            };
        });
    }

    btnCancel.onclick = resetForm;

    function resetForm() {
        formUser.reset();
        idUserInput.value = "";
        formTitle.textContent = "👤 Registrar Nuevo Usuario";
        btnSubmit.textContent = "Guardar";
        btnSubmit.className = "w-full px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-md hover:bg-indigo-700 transition";
        btnCancel.classList.add("hidden");
    }
});