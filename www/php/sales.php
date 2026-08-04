<?php
require_once "../src/functions.php";
require_once __DIR__ . '/validatores/validate-form.php';
$salesRules = require __DIR__. '/validatores/rules/sales.php';

$requestData = json_decode(file_get_contents("php://input"), true);
$accion = $requestData['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    $list = getAllSales($requestData);
    
    echo json_encode($list);
} else {
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>
