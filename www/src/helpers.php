<?php

/**
 * Valida la dirección utilizada para ordenar los registros.
 * @param string $direction Dirección de ordenamiento recibida.
 * @return string Retorna ASC o DESC. Si el valor no es válido, retorna DESC.
 */
function getOrderDirection($direction) {
    $direction = strtoupper($direction);

    return in_array($direction, ["ASC", "DESC"])
        ? $direction
        : "DESC";
}

function hasPermission($idModule, $idAction) {
    $permissions = $_SESSION["user"]["permissions"] ?? [];

    foreach ($permissions as $permission) {
        if (
            (int) $permission["id_module"] === (int) $idModule &&
            (int) $permission["id_action"] === (int) $idAction
        ) {
            return true;
        }
    }

    return false;
}

?>