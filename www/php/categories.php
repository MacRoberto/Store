<?php
require_once "../src/functions.php";
require_once __DIR__ . '/validators/validate-form.php';
$categoriesRules = require __DIR__. '/validators/rules/categories.php';

//Se reciben los parametros
 $requestData = json_decode(file_get_contents("php://input"), true);

$accion = $requestData['action'] ?? "";

header("Content-Type: application/json");
if($accion == "list"){
    //manda a llamar la funcion que realiza la consulta a la bd
    $list = getAllCategories($requestData);
    //regresa la informacion solicitada
    echo json_encode($list);

}else if($accion == "selectOptions"){
    //manda a llamar la funcion que realiza la consulta a la bd
    $list = getCategoryOptions();
    //regresa la informacion solicitada
    echo json_encode($list);

}else if($accion == "getInfoByID"){
    $id = $requestData['id'] ?? "";
    $category = getCategoryById($id);
    echo json_encode($category);

}else if($accion == "save") {
    /*Hacer validaciones*/
    $validation = validateForm(
        $requestData,
        $categoriesRules
    );

    if (!$validation['valid']) {
        //En caso de error regresar el mensaje
        echo json_encode(["error" => $validation["error"]['message']]);
        exit;//detener la ejecucion del script
    }
    $name = $_get['name'] ?? "";
    $description = $_get['description'] ?? "";
    $result = saveCategories($name, $description);
    echo json_encode($result);

}else if($accion == "update"){
     $validation = validateForm(
        $requestData,
        $categoriesRules
    );

    if (!$validation['valid']) {
        //En caso de error regresar el mensaje
        echo json_encode(["error" => $validation["error"]['message']]);
        exit;//detener la ejecucion del script
    }
    $id =  $requestData['id'] ?? "";
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
