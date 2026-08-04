// Las reglas van acorde a lo establecido en la base de datos
export const actionsRules = {
  name: {
    // La llave debe coincidir con el name del input
    label: "Action name",
    required: true,
    type: "string",
    minLength: 2,
    maxLength: 100,
  },

  description: {
    label: "Description",
    required: false,
    type: "string",
    maxLength: 65535,
  },

  id_module: {
    label: "Module",
    required: true,
    type: "number",
    min: 1,
  },

  permission_key: {
    label: "Permission key",
    required: false,
    type: "string",
    maxLength: 150,
  },
};
