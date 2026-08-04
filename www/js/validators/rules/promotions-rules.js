// Las reglas van acorde a lo establecido en la base de datos
export const promotionsRules = {
  name: {
    // La llave debe coincidir con el name del input
    label: "Promotion name",
    required: true,
    minLength: 2,
    maxLength: 150,
  },

  description: {
    label: "Description",
    required: false,
    maxLength: 65535,
  },

  date_start: {
    label: "Start date",
    required: true,
    type: "date",
  },

  date_end: {
    label: "End date",
    required: true,
    type: "date",
  },

  percent_off: {
    label: "Discount percentage",
    required: true,
    type: "number",
    min: 1,
    max: 100,
  },

  status: {
    label: "Status",
    required: true,
    allowedValues: ["Active", "Inactive"],
  },
};
