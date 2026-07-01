<?php
require_once "../src/functions.php";

$_get = json_decode(file_get_contents("php://input"), true);
$accion = $_get['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    $list = getAllInventoryMovements();
    echo json_encode($list);
    } else if ($accion == "items") {
    $items = getAllInventoryItems();
    echo json_encode($items);
    } else if ($accion == "insert") {
    $result = insertInventoryMovement($_get);
    echo json_encode($result);
} else {
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>