<?php
require_once "../src/functions.php";

$requestData = json_decode(file_get_contents("php://input"), true) ?? [];
$accion = $requestData["action"] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    echo json_encode(getAllRoles($requestData));

} else if ($accion == "delete") {
    $id_rol = $requestData["id"] ?? "";
    echo json_encode(deleteRole($id_rol));

} else if ($accion == "save") {
    $name = $requestData["name"] ?? "";
    $description = $requestData["description"] ?? "";
    echo json_encode(saveRole($name, $description));

} else if ($accion == "getInfoByID") {
    $id_rol = $requestData["id"] ?? "";
    echo json_encode(getRoleById($id_rol));

} else if ($accion == "update") {
    $id_rol = $requestData["id"] ?? "";
    $name = $requestData["name"] ?? "";
    $description = $requestData["description"] ?? "";
    echo json_encode(updateRole($id_rol, $name, $description));

} else {
    echo json_encode([
        "error" => "Action invalid"
    ]);
}
?>