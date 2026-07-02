<?php
require_once "../src/functions.php";

$_get = json_decode(file_get_contents("php://input"), true);
$accion = $_get['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    $list = getAllProducts();
    
    echo json_encode($list);

} else if ($accion == "create") {
    $result = createProduct($_get);
    echo json_encode($result);

} else {
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>