<?php
require_once "../src/functions.php";
//Se reciben los parametros
$data = json_decode(file_get_contents("php://input"), true);

$accion = $data['action'] ?? "";

header("Content-Type: application/json");
if($accion == "list"){
    //manda a llamar la funcion que realiza la consulta a la bd
    $list = getAllCategories();
    //regresa la informacion solicitada
    echo json_encode($list);
} elseif ($accion == "insert") {

    echo json_encode(insertCategories( $data['name'], $data['description']));
    
} else{
    //en caso de parametro invalido
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>

