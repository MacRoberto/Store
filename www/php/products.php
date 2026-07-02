<?php
require_once "../src/functions.php";

$_get = json_decode(file_get_contents("php://input"), true);
$accion = $_get['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    $list = getAllProducts();
    
    echo json_encode($list);

} elseif ($accion == "create") {
    $result = createProduct($_get);
    echo json_encode($result);

} elseif ($accion == "update") {
    $id = $_get['id_product'] ?? null;

    if (!$id) {
        echo json_encode(['status' => 'error', 'msg' => 'Falta id_product']);
        exit;
    }

} else {
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>