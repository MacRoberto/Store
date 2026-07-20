import { fetchRecords } from "./api.js";
import { loadView } from "./function.js";

export async function initView() {
  await loadView("../views/menu.html", "content");
  // Recuperar modulos al que un usuario tiene acceso
  const modules = await fetchRecords("modules");
  const gridContainer = document.getElementById("modulesGridContainer");
  gridContainer.innerHTML = "";

  // Recorre los resultados para construir tarjetas (Cards) visuales
  modules.forEach((module) => {
    const card = document.createElement("div");
    card.innerHTML = `
        <a href="#" class="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl"><i class="fa-solid fa-${module.img}"></i></div>
            <span class="text-sm font-semibold text-gray-800 text-center">${module.name}</span>
        </a>
    `;
    card.addEventListener("click", async () => {
      // Cargar la vista correspondiente.
      await loadView(`${module.url}.html`, "content");

      // Cargar dinámicamente el controlador correspondiente.
      const moduleController = await import(`./${module.url}.js`);

      // Inicializar el controlador.
      moduleController.initView();
    });
    gridContainer.appendChild(card);
  });
}
