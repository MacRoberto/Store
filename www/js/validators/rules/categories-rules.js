// Las reglas van acorde a lo establecido en la base de datos
export const categoriesRules = {
  name: {
    // La llave debe coincidir con el name del input
    label: "Category name",
    required: true,
    type: "string",
    minLength: 2,
    maxLength: 100,
  },

  description: {
    label: "Description",
    required: false,
    type: "string",
    maxLength: 255,
  },

  status: {
    label: "Status",
    required: true,
    allowedValues: ["Active", "Inactive"],
  },
};
