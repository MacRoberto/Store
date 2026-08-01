/**
 * Valida un formulario y regres si es valido, en caso de encontrar error retorna el primero que detecte.
 */
export function validateForm(form, rules) {
  /*
   * Recorrer cada campo definido en las reglas.
   */
  for (const fieldName in rules) {
    //Recuperar las reglas para el campo
    const fieldRules = rules[fieldName];
    //Buscar campo dentro del formulario
    const field = form.elements[fieldName];

    //extraer valor del campo quitando espacio del final y principio con trim
    const value = field.value.trim();

    /*
     * Campo obligatorio.
     */
    if (fieldRules.required === true && value === "") {
      return {
        valid: false,
        error: {
          field: fieldName,
          message: `${fieldRules.label} is required.`,
        },
      };
    }

    /*
     * Si el campo no es obligatorio y está vacío,
     * continuar con el siguiente campo.
     */
    if (fieldRules.required !== true && value === "") {
      continue;
    }

    /*
     * Longitud mínima aplica para campos tipo texto.
     */
    if (
      fieldRules.minLength !== undefined &&
      value.length < fieldRules.minLength
    ) {
      return {
        valid: false,
        error: {
          field: fieldName,
          message:
            `${fieldRules.label} must contain at least ` +
            `${fieldRules.minLength} characters.`,
        },
      };
    }

    /*
     * Longitud máxima para campos tipo texto.
     */
    if (
      fieldRules.maxLength !== undefined &&
      value.length > fieldRules.maxLength
    ) {
      return {
        valid: false,
        error: {
          field: fieldName,
          message:
            `${fieldRules.label} must not exceed ` +
            `${fieldRules.maxLength} characters.`,
        },
      };
    }

    /*
     * Número con o sin decimales.
     */
    if (fieldRules.type === "number") {
      const numberValue = Number(value);

      if (Number.isNaN(numberValue)) {
        return {
          valid: false,
          error: {
            field: fieldName,
            message: `${fieldRules.label} must be a valid number.`,
          },
        };
      }

      /*
       * Valor mínimo solo aplica a campos numericos.
       */
      if (fieldRules.min !== undefined && numberValue < fieldRules.min) {
        return {
          valid: false,
          error: {
            field: fieldName,
            message:
              `${fieldRules.label} must be at least ` + `${fieldRules.min}.`,
          },
        };
      }

      /*
       * Valor máximo solo aplica a campos numericos.
       */
      if (fieldRules.max !== undefined && numberValue > fieldRules.max) {
        return {
          valid: false,
          error: {
            field: fieldName,
            message:
              `${fieldRules.label} must not exceed ` + `${fieldRules.max}.`,
          },
        };
      }
    }

    /*
     * Lista de valores permitidos para campos estatus.
     *
     * Ejemplo:
     * Active e Inactive.
     */
    if (
      fieldRules.allowedValues !== undefined &&
      !fieldRules.allowedValues.includes(value)
    ) {
      return {
        valid: false,
        error: {
          field: fieldName,
          message: `${fieldRules.label} contains an invalid value.`,
        },
      };
    }
  }

  /*
   * Si terminó el recorrido sin encontrar errores,
   * el formulario es válido.
   */
  return {
    valid: true,
    error: null,
  };
}
