// Las reglas van acorde a lo establecido en la base de datos
export const usersRules = {
  username: {
    // La llave debe coincidir con el name del input
    label: "Username",
    required: true,
    minLength: 3,
    maxLength: 100,
  },

  password: {
    label: "Password",
    required: true,
    minLength: 8,
    maxLength: 255,
  },

  id_rol: {
    label: "Role",
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
