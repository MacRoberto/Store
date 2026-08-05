import { getSessionData } from "./api.js";
//En este archivo se van a agregar funciones que no hagan peticiones a la base de datos

//Variables globales
let rowSelected = null; //variable donde se almacena la fila donde el usuario dio click
let recordSelectedID = null; // variable para almacenar el id del producto dependiendo en que fila dio click el usuario
// Clave del módulo actual.
let currentModuleKey = null;
// Configuración de permisos de la vista actual.
let currentPermissionConfig = {};

//Funcion que se ejecuta cuando se hace click en la fila de la tabla
//Se usa para mostrar u ocultar el boton que sirve para eliminar un registro
export async function rowClick(event, dataID) {
  //Mostrar boton para eliminar
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnDetail = document.getElementById("btnDetail");
  const btnPermission = document.getElementById("btnPermissions");
  const btnActions = document.getElementById("btnActions");
  // Obtener el tr donde se hizo click
  const tr = event.currentTarget;
  // Quitar color a la fila seleccionada anteriormente
  if (rowSelected) {
    rowSelected.classList.remove("bg-indigo-100", "ring-2", "ring-indigo-400");
  }

  // Guardar la fila y el producto seleccionado
  rowSelected = tr;
  recordSelectedID = dataID;
  // Agregar color a la nueva fila seleccionada
  tr.classList.add("bg-indigo-100", "ring-2", "ring-indigo-400");

  await initializeButtons();
}

export function loadView(file, containerId) {
  //Vista de formulario
  const container = document.getElementById(containerId);

  return fetch(file)
    .then((response) => response.text())
    .then((html) => {
      container.innerHTML = html;
    })
    .catch((error) => {
      console.error("Error loading view:", error);

      Swal.fire({
        title: "Error",
        text: "The form could not be loaded.",
        icon: "error",
      });
    });
}

export function getSelectedId() {
  return recordSelectedID;
}

export function setCurrentModuleKey(moduleKey) {
  currentModuleKey = moduleKey;
  rowSelected = null;
  recordSelectedID = null;
  currentPermissionConfig = {};
}

export async function configureModulePermissions(config = {}) {
  currentPermissionConfig = config;

  await initializeButtons();
}

async function hasPermission(permissionKey) {
  if (!permissionKey) {
    return false;
  }

  const sessionData = await getSessionData();
  const permissions = sessionData.user?.permissions || [];

  return permissions.some(function (permission) {
    return permission.permission_key === permissionKey;
  });
}

export async function initializeButtons() {
  if (!currentModuleKey) {
    return;
  }

  const hasSelectedRecord =
    recordSelectedID !== null && recordSelectedID !== undefined;

  const btnAdd = document.getElementById("btnAdd");
  const btnRemove = document.getElementById("btnRemove");
  const btnEdit = document.getElementById("btnEdit");
  const btnDetail = document.getElementById("btnDetail");
  const btnPermissions = document.getElementById("btnPermissions");
  const btnActions = document.getElementById("btnActions");

  if (btnAdd) {
    const canCreate = await hasPermission(currentPermissionConfig.create);

    btnAdd.classList.toggle("hidden", !canCreate);
  }

  if (btnEdit) {
    const canUpdate = await hasPermission(currentPermissionConfig.edit);

    btnEdit.classList.toggle("hidden", !(canUpdate && hasSelectedRecord));
  }

  if (btnRemove) {
    const canDelete = await hasPermission(currentPermissionConfig.delete);

    btnRemove.classList.toggle("hidden", !(canDelete && hasSelectedRecord));
  }

  if (btnDetail) {
    const canViewDetails = await hasPermission(currentPermissionConfig.details);

    btnDetail.classList.toggle(
      "hidden",
      !(canViewDetails && hasSelectedRecord),
    );
  }

  if (btnPermissions) {
    const canAssignPermissions = await hasPermission(
      currentPermissionConfig.permissions,
    );

    btnPermissions.classList.toggle(
      "hidden",
      !(canAssignPermissions && hasSelectedRecord),
    );
  }

  if (btnActions) {
    const canViewActions = await hasPermission(currentPermissionConfig.actions);

    btnActions.classList.toggle(
      "hidden",
      !(canViewActions && hasSelectedRecord),
    );
  }
}
