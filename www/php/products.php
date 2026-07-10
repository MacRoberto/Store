<?php
require_once "../src/functions.php";

$_get = json_decode(file_get_contents("php://input"), true);
$accion = $_get['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    $list = getAllProducts();
    
    echo json_encode($list);
}else if($accion == "delete"){
    $id_producto = $_get['id']; 
    //llamar funcion para cambiar estatus a inactivo
    $result = updateProductStatus($id_producto);
    echo json_encode($result);
}else if($accion == "save") {
    $barcode = $_get['barcode'] ?? "";
    $name = $_get['name'] ?? "";
    $category_id = $_get['category'] ?? "";
    $description = $_get['description'] ?? "";
    $reorder_level = $_get['reorder_level'] ?? "";
    $status = $_get['status'] ?? "";
    $unit = $_get['unit'] ?? "";

    //llamar funcion para guardar producto
    $result = saveProduct($barcode, $name, $category_id, $description, $reorder_level, $status, $unit);
    
    echo json_encode($result);
} else {
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}

?>