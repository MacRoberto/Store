<?php
require_once "../src/functions.php";

$_post = json_decode(file_get_contents("php://input"), true);
$accion = $_post['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    echo json_encode(getAllActions());
    exit;
}

$status = "error";
$msg = "Action invalid";
$data = null;

switch ($accion) {
    case 'getModules':
        $data = getAllModules(); 
        if ($data !== false) { $status = "success"; }
        break;

    case 'insert':
        if (insertAction($_post['name'], $_post['description'], $_post['id_module'])) {
            $status = "success"; $msg = "Insertado correctamente";
        } else { $msg = "Error al insertar"; }
        break;
}

echo json_encode(['status' => $status, 'msg' => $msg, 'data' => $data]);
?>