<?php
function validateForm(array $data, array $rules)
{
    $cleanData = [];

    foreach ($rules as $field => $fieldRules) {
        /*
         * Obtener el valor enviado.
         */
        $value = $data[$field] ?? null;

        /*
         * Limpiar espacios Ãºnicamente cuando sea texto.
         */
        if (is_string($value)) {
            $value = trim($value);
        }

        /*
         * Guardar el valor limpio.
         */
        $cleanData[$field] = $value;

        /*
         * Nombre legible para los mensajes.
         */
        $label = $fieldRules['label'] ?? $field;

        /*
         * Validar required.
         */
        if (
            isset($fieldRules['required']) &&
            $fieldRules['required'] === true &&
            isEmptyValue($value)
        ) {
            return validationError(
                $field,
                $fieldRules['messages']['required']
                    ?? "The {$label} field is required.",
                $cleanData
            );
        }

        /*
         * Si el campo no es obligatorio y estÃ¡ vacÃ­o,
         * no se ejecutan las demÃ¡s reglas.
         */
        if (isEmptyValue($value)) {
            continue;
        }

        /*
         * Validar longitud mÃ­nima.
         */
        if (isset($fieldRules['minLength'])) {
            $minimumLength = (int) $fieldRules['minLength'];

            if (strlen((string) $value) < $minimumLength) {
                return validationError(
                    $field,
                    $fieldRules['messages']['minLength']
                        ?? "The {$label} must contain at least {$minimumLength} characters.",
                    $cleanData
                );
            }
        }

        /*
         * Validar longitud mÃ¡xima.
         */
        if (isset($fieldRules['maxLength'])) {
            $maximumLength = (int) $fieldRules['maxLength'];

            if (strlen((string) $value) > $maximumLength) {
                return validationError(
                    $field,
                    $fieldRules['messages']['maxLength']
                        ?? "The {$label} must not exceed {$maximumLength} characters.",
                    $cleanData
                );
            }
        }

        /*
         * Validar valor mÃ­nimo.
         */
        if (isset($fieldRules['min'])) {
            $minimumValue = $fieldRules['min'];

            if ((float) $value < (float) $minimumValue) {
                return validationError(
                    $field,
                    $fieldRules['messages']['min']
                        ?? "The {$label} must be at least {$minimumValue}.",
                    $cleanData
                );
            }
        }

        /*
         * Validar valor mÃ¡ximo.
         */
        if (isset($fieldRules['max'])) {
            $maximumValue = $fieldRules['max'];

            if ((float) $value > (float) $maximumValue) {
                return validationError(
                    $field,
                    $fieldRules['messages']['max']
                        ?? "The {$label} must not exceed {$maximumValue}.",
                    $cleanData
                );
            }
        }

        /*
         * Validar lista de valores permitidos.
         */
        if (isset($fieldRules['allowedValues'])) {
            $allowedValues = $fieldRules['allowedValues'];

            if (!in_array($value, $allowedValues, true)) {
                return validationError(
                    $field,
                    $fieldRules['messages']['allowedValues']
                        ?? "The selected {$label} is not valid.",
                    $cleanData
                );
            }
        }

        /*
         * Validar expresiÃ³n regular personalizada.
         */
        if (isset($fieldRules['pattern'])) {
            $pattern = $fieldRules['pattern'];

            if (!preg_match($pattern, (string) $value)) {
                return validationError(
                    $field,
                    $fieldRules['messages']['pattern']
                        ?? "The {$label} format is not valid.",
                    $cleanData
                );
            }
        }
    }

    return [
        'valid' => true,
        'error' => null,
        'data' => $cleanData
    ];
}


/**
 * Determina si un valor se considera vacÃ­o.
 *
 * El valor 0 no se considera vacÃ­o.
 */
function isEmptyValue(mixed $value)
{
    return $value === null ||
        $value === '' ||
        (is_array($value) && count($value) === 0);
}


/**
 * Valida y convierte tipos.
 */
function validateType(
    mixed $value,
    string $type,
    string $label
) {
    switch ($type) {
        case 'integer':
            if (
                filter_var(
                    $value,
                    FILTER_VALIDATE_INT
                ) === false
            ) {
                return [
                    'valid' => false,
                    'message' => "The {$label} must be an integer.",
                    'value' => $value
                ];
            }

            return [
                'valid' => true,
                'message' => null,
                'value' => (int) $value
            ];

        case 'number':
            if (!is_numeric($value)) {
                return [
                    'valid' => false,
                    'message' => "The {$label} must be numeric.",
                    'value' => $value
                ];
            }

            return [
                'valid' => true,
                'message' => null,
                'value' => (float) $value
            ];

        case 'email':
            if (
                filter_var(
                    $value,
                    FILTER_VALIDATE_EMAIL
                ) === false
            ) {
                return [
                    'valid' => false,
                    'message' => "The {$label} must be a valid email address.",
                    'value' => $value
                ];
            }

            return [
                'valid' => true,
                'message' => null,
                'value' => strtolower((string) $value)
            ];

        case 'string':
            if (!is_string($value)) {
                return [
                    'valid' => false,
                    'message' => "The {$label} must be text.",
                    'value' => $value
                ];
            }

            return [
                'valid' => true,
                'message' => null,
                'value' => trim($value)
            ];

        case 'boolean':
            $booleanValue = filter_var(
                $value,
                FILTER_VALIDATE_BOOLEAN,
                FILTER_NULL_ON_FAILURE
            );

            if ($booleanValue === null) {
                return [
                    'valid' => false,
                    'message' => "The {$label} must be true or false.",
                    'value' => $value
                ];
            }

            return [
                'valid' => true,
                'message' => null,
                'value' => $booleanValue
            ];

        default:
            return [
                'valid' => false,
                'message' => "The validation type '{$type}' is not supported.",
                'value' => $value
            ];
    }
}


/**
 * Crea una respuesta de error uniforme.
 */
function validationError(
    string $field,
    string $message
) {
    return [
        'valid' => false,
        'error' => [
            'field' => $field,
            'message' => $message
        ]
    ];
}