<?php
require_once "../src/functions.php";

header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);
$action = $input["action"] ?? "";

switch ($action) {
    case "list":
        echo json_encode(getAllSales());
        break;

    case "selectOptions":
        echo json_encode(getUserOptions());
        break;

    case "save":
        echo json_encode(saveSale($input));
        break;

    case "edit":
        echo json_encode(updateSale($input));
        break;

    case "delete":
        echo json_encode(deleteSale($input));
        break;

    default:
        echo json_encode([
            "status" => "error",
            "msg" => "Action invalid"
        ]);
        break;
}