<?php
require_once "../src/functions.php";
require_once __DIR__ . '/validators/validate-form.php';
$promotionRules = require __DIR__. '/validators/rules/promotions-rules.php';

$requestData = json_decode(file_get_contents("php://input"), true) ?? [];
$accion = $requestData['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    $list = getAllPromotions($requestData);
    
    echo json_encode($list);
}else if ($accion == "save") {
    /*Hacer validaciones*/
    $validation = validateForm(
        $requestData,
        $promotionRules
    );

    if (!$validation['valid']) {
        //En caso de error regresar el mensaje
        echo json_encode(["error" => $validation["error"]['message']]);
        exit;//detener la ejecucion del script
    }

    $name = $requestData['name'] ?? "";
    $description = $requestData['description'] ?? "";
    $date_start = $requestData['date_start'] ?? "";
    $date_end = $requestData['date_end'] ?? "";
    $percent_off = $requestData['percent_off'] ?? "";
    $id_product = $requestData['id_product'] ?? "";
    $status = $requestData['status'] ?? "";
    $result = savePromotion($name, $description, $date_start, $date_end, $percent_off, $id_product, $status);
    echo json_encode($result);
}else if($accion == "delete"){
     $id_promotion = $requestData['id']; 
    $result = deletePromotion($id_promotion);
    echo json_encode($result);
}else if($accion == "getInfoByID") {
    $id_promotion = $requestData['id'] ?? "";
    $result = getPromotionById($id_promotion);
    
    echo json_encode($result);
}else if ($accion == "update") {
    /*Hacer validaciones*/
    $validation = validateForm(
        $requestData,
        $promotionRules
    );

    if (!$validation['valid']) {
        //En caso de error regresar el mensaje
        echo json_encode(["error" => $validation["error"]['message']]);
        exit;//detener la ejecucion del script
    }

    $id_promotion = $requestData['id'] ?? 0;
    $name = $requestData['name'] ?? "";
    $description = $requestData['description'] ?? "";
    $date_start = $requestData['date_start'] ?? "";
    $date_end = $requestData['date_end'] ?? "";
    $percent_off = $requestData['percent_off'] ?? "";
    $id_product = $requestData['id_product'] ?? "";
    $status = $requestData['status'] ?? "";
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
