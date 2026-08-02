<?php
require_once "../src/functions.php";

// Se reciben los parámetros raw del JSON payload
$requestData = json_decode(file_get_contents("php://input"), true);
$accion = $requestData['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    // Manda a llamar la función que realiza la consulta a la bd
    $list = getAllInventories();
     
    // Regresa la información solicitada
    echo json_encode($list);
}else if($accion == "save"){
    $products = $requestData["items"];
    $response = saveInventory($products);
    echo json_encode($response);

} else {
    // En caso de parámetro inválido
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>