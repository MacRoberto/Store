<?php
require_once "../src/functions.php";

$requestData = json_decode(file_get_contents("php://input"), true) ?? [];
$action = $requestData["action"] ?? "";

header("Content-Type: application/json");

if ($action == "list") {
    $list = getAllRolesPermissions($requestData);
    echo json_encode($list);

} else if ($action == "delete") {
    $id = $requestData["id"] ?? "";
    $result = deleteRolePermission($id);
    echo json_encode($result);

} else if ($action == "save") {
    $id_role = $requestData["id_role"] ?? "";
    $id_action = $requestData["id_action"] ?? "";
    $status = $requestData["status"] ?? "";

    if (empty($id_role) || empty($id_action) || empty($status)) {
        echo json_encode(["error" => "Required fields cannot be empty."]);
        exit;
    }

    $result = saveRolePermission($id_role, $id_action, $status);
    echo json_encode($result);

} else if ($action == "getInfoByID") {
    $id = $requestData["id"] ?? "";
    $result = getRolePermissionById($id);
    echo json_encode($result);

} else if ($action == "update") {
    $id = $requestData["id"] ?? "";
    $id_role = $requestData["id_role"] ?? "";
    $id_action = $requestData["id_action"] ?? "";
    $status = $requestData["status"] ?? "";

    if (empty($id) || empty($id_role) || empty($id_action) || empty($status)) {
        echo json_encode(["error" => "Required fields cannot be empty."]);
        exit;
    }

    $result = updateRolePermission($id, $id_role, $id_action, $status);
    echo json_encode($result);

} else if ($action == "selectOptions") {
    $list = getRolePermissionOptions();
    echo json_encode($list);

} else {
    echo json_encode([
        "error" => "Action invalid"
    ]);
}
?>