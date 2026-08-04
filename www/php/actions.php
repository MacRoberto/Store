<?php
require_once "../src/functions.php";
require_once __DIR__ . '/validators/validate-form.php';
$actionRules = require __DIR__. '/validators/rules/actions-rules.php';

// Se reciben los parámetros raw del JSON payload
$requestData = json_decode(file_get_contents("php://input"), true) ?? [];
$accion = $requestData['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    // Manda a llamar la función que realiza la consulta a la bd
    $list = getAllActions($requestData);
    
    // Regresa la información solicitada
    echo json_encode($list);
} else if ($accion == "selectOptions") {
    echo json_encode(getModuleOptions());

} else if ($accion == "getInfoByID") {
    $id = $requestData['id'] ?? "";
    echo json_encode(getActionById($id));

} else if ($accion == "save") {
    /*Hacer validaciones*/
    $validation = validateForm(
        $requestData,
        $actionRules
    );

    if (!$validation['valid']) {
        //En caso de error regresar el mensaje
        echo json_encode(["error" => $validation["error"]['message']]);
        exit;//detener la ejecucion del script
    }

    $name = $requestData['name'] ?? "";
    $description = $requestData['description'] ?? "";
    $id_module = $requestData['id_module'] ?? "";
    echo json_encode(saveActions($name, $description, $id_module));

} else if ($accion == "update") {
    /*Hacer validaciones*/
    $validation = validateForm(
        $requestData,
        $actionRules
    );

    if (!$validation['valid']) {
        //En caso de error regresar el mensaje
        echo json_encode(["error" => $validation["error"]['message']]);
        exit;//detener la ejecucion del script
    }

    $id = $requestData['id'] ?? "";
    $name = $requestData['name'] ?? "";
    $description = $requestData['description'] ?? "";
    $id_module = $requestData['id_module'] ?? "";
    echo json_encode(updateActions($id, $name, $description, $id_module));

} else if ($accion == "delete") {
    $id = $requestData['id'] ?? "";
    echo json_encode(deleteActions($id));

}else {
    // En caso de parámetro inválido
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>