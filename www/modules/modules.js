document.addEventListener("DOMContentLoaded", () => {
  fetchModules();
});

function fetchModules() {
  // Hace petición al archivo de php usando método POST
  fetch("php/modules.php", {
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
      const gridContainer = document.getElementById("modulesGridContainer");
      gridContainer.innerHTML = "";

      if (data.error) {
        console.error(data.error);
        return;
      }

      // Recorre los resultados para construir tarjetas (Cards) visuales
      data.forEach((module) => {
        const card = document.createElement("div");
        card.className = "bg-white overflow-hidden shadow rounded-lg border border-gray-200 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg";

        // Si tu columna 'img' guarda solo un nombre de clase de icono (ej: "fa-box"),
        // puedes renderizar un tag <i>. Si guarda rutas de archivos de imagen (ej: "img/products.png"),
        // puedes usar el tag <img> que se muestra abajo:
        card.innerHTML = `
          <div>
            <div class="h-48 w-full bg-indigo-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
              <img 
                src="${module.img}" 
                alt="Imagen de ${module.name}" 
                class="object-cover h-full w-full error-fallback"
                onerror="this.onerror=null; this.src='https://placehold.co/400x250/e0e7ff/4f46e5?text=${encodeURIComponent(module.name)}';"
              />
            </div>
            <div class="px-4 py-5 sm:p-6">
              <span class="text-xs font-semibold uppercase tracking-wider text-indigo-600">ID Módulo: #${module.id_module}</span>
              <h3 class="mt-1 text-lg font-bold text-gray-900">${module.name}</h3>
              <p class="mt-2 text-sm text-gray-500">${module.description}</p>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-100 text-right">
            <button class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Acceder módulo
            </button>
          </div>
        `;

        gridContainer.appendChild(card);
      });
    })
    .catch((error) => console.error("Error al obtener los módulos funcionales:", error));
}