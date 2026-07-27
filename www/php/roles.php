<?php
require_once "../src/functions.php";

$requestData = json_decode(file_get_contents("php://input"), true) ?? [];
$accion = $requestData["action"] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    $list = getAllRoles($requestData);
    echo json_encode($list);

} else if ($accion == "delete") {
    $id_rol = $requestData["id"];
    $result = deleteRole($id_rol);
    echo json_encode($result);

} else if ($accion == "save") {
    $name = $requestData["name"] ?? "";
    $description = $requestData["description"] ?? "";
    $status = $requestData["status"] ?? "Active";

    $result = saveRole($name, $description, $status);
    echo json_encode($result);

} else if ($accion == "getInfoByID") {
    $id_rol = $requestData["id"] ?? "";
    $result = getRoleById($id_rol);
    echo json_encode($result);

} else if ($accion == "update") {
    $id_rol = $requestData["id"] ?? 0;
    $name = $requestData["name"] ?? "";
    $description = $requestData["description"] ?? "";
    $status = $requestData["status"] ?? "Active";

    $result = updateRole($id_rol, $name, $description, $status);
    echo json_encode($result);

} else {
    echo json_encode([
        "error" => "Action invalid"
    ]);
}
?>