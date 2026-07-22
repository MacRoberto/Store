<?php
require_once "../src/functions.php";

$_get = json_decode(file_get_contents("php://input"), true);
$accion = $_get['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    echo json_encode(getAllActions());

} else if ($accion == "selectOptions") {
    echo json_encode(getModuleOptions());

} else if ($accion == "getInfoByID") {
    $id = $_get['id'] ?? "";
    echo json_encode(getActionById($id));

} else if ($accion == "save") {
    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";
    $id_module = $_get['id_module'] ?? "";
    echo json_encode(saveActions($name, $description, $id_module));

} else if ($accion == "update") {
    $id = $_get['id'] ?? "";
    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";
    $id_module = $_get['id_module'] ?? "";
    echo json_encode(updateActions($id, $name, $description, $id_module));

} else if ($accion == "delete") {
    $id = $_get['id'] ?? "";
    echo json_encode(deleteActions($id));

} else {
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>