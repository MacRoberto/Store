<?php
require_once "../src/functions.php";

// Se reciben los datos enviados desde JavaScript
$_get = json_decode(file_get_contents("php://input"), true);
$accion = $_get['action'] ?? "";

// Se establece el formato de respuesta
header("Content-Type: application/json");

// Se obtiene el listado de roles
if ($accion == "list") {

    $list = getAllRoles();

    echo json_encode($list);

// Se guarda un nuevo rol
} else if ($accion == "save") {

    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";

    $result = saveRole($name, $description);

    echo json_encode($result);

// Se actualiza un rol existente
} else if ($accion == "edit") {

    $id = $_get['id'] ?? "";
    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";

    $result = updateRole($id, $name, $description);

    echo json_encode($result);

// Se elimina el rol seleccionado
} else if ($accion == "delete") {

    $id = $_get['id'] ?? "";

    $result = deleteRole($id);

    echo json_encode($result);

// Acción no válida
} else {

    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>
