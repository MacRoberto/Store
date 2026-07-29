<?php
require_once "../src/functions.php";

$_get = json_decode(file_get_contents("php://input"), true);
$accion = $_get['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    $list = getAllModules($_get);
    echo json_encode($list);

} else if ($accion == "selectOptions") {
    echo json_encode(getModuleOptions());

} else if ($accion == "getInfoByID") {
    $id = $_get['id'] ?? "";
    echo json_encode(getModuleById($id));

} else if ($accion == "save") {
    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";
    $img = $_get['img'] ?? "";
    $url = $_get['url'] ?? "";
    echo json_encode(saveModule($name, $description, $img, $url));

} else if ($accion == "update") {
    $id = $_get['id'] ?? "";
    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";
    $img = $_get['img'] ?? "";
    $url = $_get['url'] ?? "";
    echo json_encode(updateModule($id, $name, $description, $img, $url));

} else if ($accion == "delete") {
    $id = $_get['id'] ?? "";
    echo json_encode(deleteModule($id));

} else {
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>
