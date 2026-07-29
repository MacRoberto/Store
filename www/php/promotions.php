<?php
require_once "../src/functions.php";

$_get = json_decode(file_get_contents("php://input"), true);
$accion = $_get['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    $list = getAllPromotions($_get);
    
    echo json_encode($list);
}else if ($accion == "save") {
    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";
    $date_start = $_get['date_start'] ?? "";
    $date_end = $_get['date_end'] ?? "";
    $percent_off = $_get['percent_off'] ?? "";
    $id_product = $_get['id_product'] ?? "";
    $status = $_get['status'] ?? "";
    $result = savePromotion($name, $description, $date_start, $date_end, $percent_off, $id_product, $status);
    echo json_encode($result);
}else if($accion == "delete"){
     $id_promotion = $_get['id']; 
    $result = deletePromotion($id_promotion);
    echo json_encode($result);
}else if($accion == "getInfoByID") {
    $id_promotion = $_get['id'] ?? "";
    $result = getPromotionById($id_promotion);
    
    echo json_encode($result);
}else if ($accion == "update") {
    $id_promotion = $_get['id'] ?? 0;
    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";
    $date_start = $_get['date_start'] ?? "";
    $date_end = $_get['date_end'] ?? "";
    $percent_off = $_get['percent_off'] ?? "";
    $id_product = $_get['id_product'] ?? "";
    $status = $_get['status'] ?? "";
    $result = updatePromotion($id_promotion, $name, $description, $date_start, $date_end, $percent_off, $id_product, $status);
    echo json_encode($result);
}
else {
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>
