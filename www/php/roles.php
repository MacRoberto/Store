<?php
require_once "../src/functions.php";

$_get = json_decode(file_get_contents("php://input"), true);
$accion = $_get['action'] ?? "";

header("Content-Type: application/json");
if ($accion == "list") {
    $list = getAllRoles($_get);
    echo json_encode($list);

} else if ($accion == "getInfoByID") {
    $id = $_get['id'] ?? "";
    $role = getRoleById($id);
    echo json_encode($role);

} else if ($accion == "save") {
    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";
    $result = saveRole($name, $description);
    echo json_encode($result);

} else if ($accion == "update") {
    $id = $_get['id'] ?? "";
    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";
    $result = updateRole($id, $name, $description);
    echo json_encode($result);

} else if ($accion == "delete") {
    $id = $_get['id'] ?? "";
    $result = deleteRole($id);
    echo json_encode($result);

} else {
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>
