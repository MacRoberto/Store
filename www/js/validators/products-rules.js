//Las reglas van acorde a lo establecido en la base de datos
export const productsRules = {
  name: {
    //la llave o clave debe coincidir con el name del input en el formulario
    label: "Product name",
    required: true,
    minLength: 2,
    maxLength: 100,
  },

  barcode: {
    label: "Barcode",
    required: true,
    minLength: 3,
    maxLength: 50,
  },

  id_category: {
    label: "Category",
    required: true,
    type: "number",
    min: 1,
  },

  reorder_level: {
    label: "Reorder level",
    required: true,
    type: "number",
    min: 0,
    max: 99999,
  },

  status: {
    label: "Status",
    required: true,
    allowedValues: ["Active", "Inactive"],
  },
};
