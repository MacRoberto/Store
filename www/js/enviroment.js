import { fetchRecords, sendRequest, getSessionData } from "./api.js";
import { loadView, setCurrentModuleKey } from "./function.js";

export async function initView() {
  const sessionData = await getSessionData();

  if (sessionData.status !== "success") {
    window.location.href = "../index.html";
    return;
  }

  document.body.classList.remove("hidden");

  const loggedUser = document.getElementById("loggedUser");
  const loggedRole = document.getElementById("loggedRole");

  if (sessionData.status === "success" && loggedUser) {
    loggedUser.textContent = sessionData.user.username;
    loggedRole.textContent = sessionData.user.role;
  }

  const defaultView = sessionData.user.defaultView ?? "dashboard";
  await loadView(`../views/${defaultView}.html`, "content");
  if (defaultView === "menu") {
    await loadModules();
  } else if (defaultView === "dashboard") {
    //Cargar js
    const dashboardController = await import(`./dashboard.js`);
    //Llamar funcion principal
    dashboardController.initView();
  }

  const btnMenu = document.getElementById("btnMenu");
  const btnDashboard = document.getElementById("btnDashboard");
  const btnLogout = document.getElementById("btnLogout");

  if (btnDashboard) {
    btnDashboard.addEventListener("click", async function (event) {
      event.preventDefault();
      btnDashboard.classList.remove("text-gray-600", "font-medium");
      btnDashboard.classList.add(
        "bg-indigo-50",
        "text-indigo-600",
        "font-semibold",
      );

      btnMenu.classList.remove(
        "bg-indigo-50",
        "text-indigo-600",
        "font-semibold",
      );
      btnMenu.classList.add("text-gray-600", "font-medium");
      //Carga la vista
      await loadView("../views/dashboard.html", "content");
      //Cargar js
      const dashboardController = await import(`./dashboard.js`);
      //Llamar funcion principal
      dashboardController.initView();
    });
  }

  if (btnMenu) {
    btnMenu.addEventListener("click", async function (event) {
      event.preventDefault();
      btnMenu.classList.remove("text-gray-600", "font-medium");
      btnMenu.classList.add("bg-indigo-50", "text-indigo-600", "font-semibold");

      btnDashboard.classList.remove(
        "bg-indigo-50",
        "text-indigo-600",
        "font-semibold",
      );
      btnDashboard.classList.add("text-gray-600", "font-medium");
      await loadView("../views/menu.html", "content");
      await loadModules();
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", async function () {
      const result = await Swal.fire({
        icon: "question",
        title: "Logout",
        text: "Are you sure you want to log out?",
        showCancelButton: true,
        confirmButtonText: "Yes, logout",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        return;
      }

      const data = await sendRequest("users", {
        action: "logout",
      });

      if (data.status === "success") {
        window.location.href = "../index.html";
      }
    });
  }
}

async function loadModules() {
  const sessionData = await sendRequest("users", {
    action: "session",
  });

  const modules = sessionData.user.modules;
  const gridContainer = document.getElementById("modulesGridContainer");

  if (!gridContainer) {
    return;
  }

  gridContainer.innerHTML = "";

  modules.forEach((module) => {
    const card = document.createElement("div");

    card.innerHTML = `
      <a href="#" class="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
        <div>
          <i class="fa-solid fa-${module.img}"></i>
        </div>

        <span class="text-sm font-semibold text-gray-800 text-center">
          ${module.module}
        </span>
      </a>
    `;

    card.addEventListener("click", async () => {
      await loadView(`${module.url}.html`, "content");
      setCurrentModuleKey(module.url);
      const moduleController = await import(`./${module.url}.js`);

      await moduleController.initView();
    });

    gridContainer.appendChild(card);
  });
}
