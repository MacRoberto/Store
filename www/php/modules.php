<?php
require_once "../src/functions.php";

// Se reciben los parámetros raw del JSON payload
$_get = json_decode(file_get_contents("php://input"), true);
$accion = $_get['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    // Manda a llamar la función que realiza la consulta a la bd
    $list = getAllModules();
    
    // Regresa la información solicitada
    echo json_encode($list);
} else {
    // En caso de parámetro inválido
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>