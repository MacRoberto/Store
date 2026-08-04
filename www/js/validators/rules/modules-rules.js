// Las reglas van acorde a lo establecido en la base de datos
export const modulesRules = {
  name: {
    // La llave debe coincidir con el name del input
    label: "Module name",
    required: true,
    minLength: 2,
    maxLength: 100,
  },

  description: {
    label: "Description",
    required: true,
    minLength: 2,
    maxLength: 65535,
  },

  img: {
    label: "Icon",
    required: true,
    minLength: 2,
    maxLength: 255,
  },

  url: {
    label: "URL",
    required: true,
    minLength: 1,
    maxLength: 255,
  },
};
