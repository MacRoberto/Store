<?php
require_once "../src/functions.php";
//Se reciben los parametros
$_get = json_decode(file_get_contents("php://input"), true);

$accion = $_get['action'] ?? "";

header("Content-Type: application/json");
if($accion == "list"){
    //manda a llamar la funcion que realiza la consulta a la bd
    $list = getAllCategories();
    //regresa la informacion solicitada
    echo json_encode($list);

}else if($accion == "selectOptions"){
    //manda a llamar la funcion que realiza la consulta a la bd
    $list = getCategoryOptions();
    //regresa la informacion solicitada
    echo json_encode($list);

}else if($accion == "getInfoByID"){
    $id = $_get['id'] ?? "";
    $category = getCategoryById($id);
    echo json_encode($category);

}else if($accion == "save"){
    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";
    $result = saveCategories($name, $description);
    echo json_encode($result);

}else if($accion == "update"){
    $id = $_get['id'] ?? "";
    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";
    $result = updateCategories($id, $name, $description);
    echo json_encode($result);

}else if($accion == "delete"){
    $id = $_get['id'] ?? "";
    $result = deleteCategories($id);
    echo json_encode($result);

}else{
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}

?>