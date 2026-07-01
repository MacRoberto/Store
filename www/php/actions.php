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

    case 'update':
        if (updateAction($_post['id_action'], $_post['name'], $_post['description'], $_post['id_module'])) {
            $status = "success"; $msg = "Actualizado correctamente";
        } else { $msg = "Error al actualizar"; }
        break;

    case 'delete':
        if (deleteAction($_post['id_action'])) {
            $status = "success"; $msg = "Eliminado correctamente";
        } else { $msg = "No se puede eliminar. Puede estar asignado a un rol."; }
        break;
}

echo json_encode(['status' => $status, 'msg' => $msg, 'data' => $data]);
?>