<?php
require_once "../src/functions.php";
//Se reciben los parametros
$requestData = json_decode(file_get_contents("php://input"), true) ?? [];

$accion = $requestData['action'] ?? "";
header("Content-Type: application/json");

if($accion == "list"){
    $list = getAllCategories($requestData);
    echo json_encode($list);

}else if($accion == "selectOptions"){
    $list = getCategoryOptions();
    echo json_encode($list);

}else if($accion == "getInfoByID"){
    $id = $requestData['id'] ?? "";
    $category = getCategoryById($id);
    echo json_encode($category);

}else if($accion == "save"){
    $name = $requestData['name'] ?? "";
    $description = $requestData['description'] ?? "";
    $result = saveCategories($name, $description);
    echo json_encode($result);

}else if($accion == "update"){
    $id = $requestData['id'] ?? "";
    $name = $requestData['name'] ?? "";
    $description = $requestData['description'] ?? "";
    $result = updateCategories($id, $name, $description);
    echo json_encode($result);

}else if($accion == "delete"){
    $id = $requestData['id'] ?? "";
    $result = deleteCategories($id);
    echo json_encode($result);

}else{
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}

?>
