<?php
require_once "functions.php";
//Se reciben los parametros
$_get = json_decode(file_get_contents("php://input"), true);

$accion = $_get['action'] ?? "";

header("Content-Type: application/json");
if($accion == "list"){
    //manda a llamar la funcion que realiza la consulta a la bd
    $list = getAllCategories();
    //regresa la informacion solicitada
    echo json_encode($list);
}else{
    //en caso de parametro invalido
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>