<?php
require_once "../src/functions.php";

// Leer la petición JSON enviada desde JavaScript
$requestData = json_decode(file_get_contents("php://input"), true) ?? [];
$accion = $requestData['action'] ?? "";

header("Content-Type: application/json");

if ($accion == "list") {
    // Retornar lista de artículos de inventario filtrados y paginados
    $list = getAllInventoryItems($requestData);
    echo json_encode($list);

} else if ($accion == "getInfoByID") {
    $id_item = $requestData['id'] ?? 0;
    $result = getInventoryItemById($id_item);
    echo json_encode($result);

} else if ($accion == "save") {
    $inventory_id = $requestData['inventory_id'] ?? $requestData['inventoryId'] ?? 0;
    $product_id = $requestData['product_id'] ?? 0;
    $cost_price = $requestData['cost_price'] ?? $requestData['purchase_price'] ?? 0.00;
    $sale_price = $requestData['sale_price'] ?? 0.00;
    $quantity_received = $requestData['quantity_received'] ?? 0;
    $quantity_available = $requestData['quantity_available'] ?? $quantity_received;
    $status = $requestData['status'] ?? "Active";

    if (empty($inventory_id) || empty($product_id)) {
        echo json_encode(["error" => "Inventory ID and Product ID are required."]);
        exit;
    }

    $result = saveInventoryItem($inventory_id, $product_id, $cost_price, $sale_price, $quantity_received, $quantity_available, $status);
    echo json_encode($result);

} else if ($accion == "update") {
    $id_item = $requestData['id'] ?? 0;
    $inventory_id = $requestData['inventory_id'] ?? $requestData['inventoryId'] ?? 0;
    $product_id = $requestData['product_id'] ?? 0;
    $cost_price = $requestData['cost_price'] ?? $requestData['purchase_price'] ?? 0.00;
    $sale_price = $requestData['sale_price'] ?? 0.00;
    $quantity_received = $requestData['quantity_received'] ?? 0;
    $quantity_available = $requestData['quantity_available'] ?? 0;
    $status = $requestData['status'] ?? "Active";

    if (empty($id_item) || empty($inventory_id) || empty($product_id)) {
        echo json_encode(["error" => "Required fields cannot be empty."]);
        exit;
    }

    $result = updateInventoryItem($id_item, $inventory_id, $product_id, $cost_price, $sale_price, $quantity_received, $quantity_available, $status);
    echo json_encode($result);

} else if ($accion == "delete") {
    $id_item = $requestData['id'] ?? 0;
    $result = softDeleteInventoryItem($id_item);
    echo json_encode($result);

} else {
    echo json_encode([
        'status' => 'error',
        'msg' => 'Action invalid'
    ]);
}
?>