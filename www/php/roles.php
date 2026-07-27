<?php
require_once "../src/functions.php";

header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);
$action = $input["action"] ?? "";

if ($action === "list") {
    echo json_encode(getAllRoles());

} elseif ($action === "save") {
    $name = trim($input["name"] ?? "");
    $description = trim($input["description"] ?? "");
    echo json_encode(saveRole($name, $description));

} elseif ($action === "getInfoByID") {
    $id = $input["id"] ?? "";
    echo json_encode(getRoleById($id));

} elseif ($action === "update") {
    $id = $input["id"] ?? "";
    $name = trim($input["name"] ?? "");
    $description = trim($input["description"] ?? "");
    echo json_encode(updateRole($id, $name, $description));

} elseif ($action === "delete") {
    $id = $input["id"] ?? "";
    echo json_encode(deleteRole($id));

} else {
    echo json_encode([
        "status" => "error",
        "msg" => "Action invalid"
    ]);
}
?>