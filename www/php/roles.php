<?php
require_once "../src/functions.php";

// Se leen los datos enviados desde JavaScript
$_get = json_decode(file_get_contents("php://input"), true);
$accion = $_get['action'] ?? "";

// Se define el formato de respuesta
header("Content-Type: application/json");

// Se obtiene el listado de roles
if ($accion == "list") {
    echo json_encode(getAllRoles());

// Se guarda un nuevo rol
} elseif ($accion == "save") {
    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";

    echo json_encode(saveRole($name, $description));

// Se obtiene un rol por su ID para editarlo
} elseif ($accion == "getInfoByID") {
    $id = $_get['id'] ?? "";

    echo json_encode(getRoleById($id));

// Se actualiza un rol existente
} elseif ($accion == "update") {
    $id = $_get['id'] ?? "";
    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";

    echo json_encode(updateRole($id, $name, $description));

// Se elimina el rol seleccionado
} elseif ($accion == "delete") {
    $id = $_get['id'] ?? "";

    echo json_encode(deleteRole($id));

// Acción no válida
} else {
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>