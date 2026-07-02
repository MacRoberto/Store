<?php
require_once "../src/functions.php";

// Se reciben los parámetros raw del JSON payload
$_post = json_decode(file_get_contents("php://input"), true);
$action = $_post['action'] ?? "";

header("Content-Type: application/json");

$data = "";
switch ($action) {
    case "list":
        $data = getAllInventories();
        break;
    case "insert":
        $data = insertInventory($_post);
        break;
    default:
    echo json_encode(['status' => 'error', 'msg' => 'Action invalid']);       
    exit;
}

if ($data) {
    echo json_encode(['status' => 'success', 'data' => $data]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'No data Failed to fetch data']);
}

?>