
export const rolesRules = {
  name: {
    label: "Role name",
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
};
