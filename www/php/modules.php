<?php
require_once "../src/functions.php";
require_once __DIR__ . '/validators/validate-form.php';
$moduleRules = require __DIR__. '/validators/rules/modules-rules.php';

$requestData = json_decode(file_get_contents("php://input"), true) ?? [];
$accion = $requestData['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    $list = getAllModules($requestData);
    echo json_encode($list);

} else if ($accion == "selectOptions") {
    echo json_encode(getModuleOptions());

} else if ($accion == "getInfoByID") {
    $id = $requestData['id'] ?? "";
    echo json_encode(getModuleById($id));

} else if ($accion == "save") {
    /*Hacer validaciones*/
    $validation = validateForm(
        $requestData,
        $moduleRules
    );

    if (!$validation['valid']) {
        //En caso de error regresar el mensaje
        echo json_encode(["error" => $validation["error"]['message']]);
        exit;//detener la ejecucion del script
    }

    $name = $requestData['name'] ?? "";
    $description = $requestData['description'] ?? "";
    $img = $requestData['img'] ?? "";
    $url = $requestData['url'] ?? "";
    echo json_encode(saveModule($name, $description, $img, $url));

} else if ($accion == "update") {
    /*Hacer validaciones*/
    $validation = validateForm(
        $requestData,
        $moduleRules
    );

    if (!$validation['valid']) {
        //En caso de error regresar el mensaje
        echo json_encode(["error" => $validation["error"]['message']]);
        exit;//detener la ejecucion del script
    }

    $id = $requestData['id'] ?? "";
    $name = $requestData['name'] ?? "";
    $description = $requestData['description'] ?? "";
    $img = $requestData['img'] ?? "";
    $url = $requestData['url'] ?? "";
    echo json_encode(updateModule($id, $name, $description, $img, $url));

} else if ($accion == "delete") {
    $id = $requestData['id'] ?? "";
    echo json_encode(deleteModule($id));

} else {
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>
