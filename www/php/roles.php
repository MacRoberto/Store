<?php
require_once "../src/functions.php";

$requestData = json_decode(file_get_contents("php://input"), true) ?? [];
$action = $requestData["action"] ?? "";

header("Content-Type: application/json");

if ($action == "list") {
    $list = getAllRoles();
    echo json_encode($list);

} else if ($action == "selectOptions") {
    $list = getRoleOptions();
    echo json_encode($list);

} else {
    echo json_encode([
        "error" => "Action invalid"
    ]);
}
?>