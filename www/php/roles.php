<?php
require_once "../src/functions.php";
require_once __DIR__ . '/validators/validate-form.php';
$roleRules = require __DIR__. '/validators/rules/roles-rules.php';

$requestData = json_decode(file_get_contents("php://input"), true) ?? [];
$accion = $requestData['action'] ?? "";

header("Content-Type: application/json");
if ($accion == "list") {
    $list = getAllRoles($requestData);
    echo json_encode($list);

} else if ($accion == "getInfoByID") {
    $id = $requestData['id'] ?? "";
    $role = getRoleById($id);
    echo json_encode($role);

} else if ($accion == "save") {
    /*Hacer validaciones*/
    $validation = validateForm(
        $requestData,
        $roleRules
    );

    if (!$validation['valid']) {
        //En caso de error regresar el mensaje
        echo json_encode(["error" => $validation["error"]['message']]);
        exit;//detener la ejecucion del script
    }

    $name = $requestData['name'] ?? "";
    $description = $requestData['description'] ?? "";
    $result = saveRole($name, $description);
    echo json_encode($result);

} else if ($accion == "update") {
    /*Hacer validaciones*/
    $validation = validateForm(
        $requestData,
        $roleRules
    );

    if (!$validation['valid']) {
        //En caso de error regresar el mensaje
        echo json_encode(["error" => $validation["error"]['message']]);
        exit;//detener la ejecucion del script
    }

    $id = $requestData['id'] ?? "";
    $name = $requestData['name'] ?? "";
    $description = $requestData['description'] ?? "";
    $result = updateRole($id, $name, $description);
    echo json_encode($result);

} else if ($accion == "delete") {
    $id = $requestData['id'] ?? "";
    $result = deleteRole($id);
    echo json_encode($result);

} else if ($accion == "selectOptions") {
    $list = getRoleOptions();
    echo json_encode($list);

} else {
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>
