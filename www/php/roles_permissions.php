<?php
require_once "../src/functions.php";

header("Content-Type: application/json");

// Se recibe la acción enviada desde JavaScript
$input = json_decode(file_get_contents("php://input"), true) ?? [];
$action = $input["action"] ?? "";

switch ($action) {

    // Obtiene todos los permisos registrados
    case "list":
        echo json_encode(getAllRolesPermissions());
        break;

    // Obtiene opciones para llenar los selects del formulario
    case "selectOptions":
        echo json_encode([
            "roles" => getAllRoles(),
            "actions" => getAllActions()
        ]);
        break;

    // Guarda un nuevo permiso
    case "save":
        $id_role = (int)($input["id_role"] ?? 0);
        $id_action = (int)($input["id_action"] ?? 0);
        $status = trim($input["status"] ?? "Active");

        echo json_encode(saveRolePermission($id_role, $id_action, $status));
        break;

    // Actualiza un permiso existente
    case "edit":
        $id_permission = (int)($input["id_permission"] ?? 0);
        $id_role = (int)($input["id_role"] ?? 0);
        $id_action = (int)($input["id_action"] ?? 0);
        $status = trim($input["status"] ?? "Active");

        echo json_encode(updateRolePermission($id_permission, $id_role, $id_action, $status));
        break;

    // Elimina el permiso seleccionado
    case "delete":
        $id_permission = (int)($input["id_permission"] ?? 0);
        echo json_encode(deleteRolePermission($id_permission));
        break;

    // Acción inválida
    default:
        echo json_encode([
            "status" => "error",
            "msg" => "Action invalid"
        ]);
        break;
}
?>