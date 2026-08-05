// Las reglas van acorde a lo establecido en la base de datos.
export const promotionsRules = {
  name: {
    label: "Promotion name",
    required: true,
    minLength: 2,
    maxLength: 100,
  },

  description: {
    label: "Description",
    required: true,
    minLength: 2,
    maxLength: 255,
  },

  date_start: {
    label: "Start date",
    required: true,
  },

  date_end: {
    label: "End date",
    required: true,
  },

  percent_off: {
    label: "Discount percentage",
    required: true,
    type: "number",
    min: 1,
    max: 100,
  },

  id_product: {
    label: "Product",
    required: true,
    type: "number",
    min: 1,
  },

  status: {
    label: "Status",
    required: true,
    allowedValues: ["Active", "Inactive"],
  },
};