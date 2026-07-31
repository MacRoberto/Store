<?php
require_once "../src/functions.php";

// Se reciben los parámetros raw del JSON payload
$requestData = json_decode(file_get_contents("php://input"), true) ?? [];
$accion = $requestData['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    // Manda a llamar la función que realiza la consulta a la bd
    $idRol = $requestData["idRol"] ?? 0;
    if($idRol){
        $list = getAllRolesPermissions($idRol);
    
        // Regresa la información solicitada
        echo json_encode($list);
    }else{
        // En caso de parámetro inválido
        echo json_encode([
            'error' => "$idRol not Validad",
        ]);    
    }
    
}else if($accion === "savePermissions"){
    $rs = saveRolePermissions($requestData);
    echo json_encode($rs);
} else {
    // En caso de parámetro inválido
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>